import { parse } from "csv-parse/sync";
import * as authModel from "../models/authModel.js";
import * as certificateModel from "../models/certificateModel.js";
import * as templateModel from "../models/certificateTemplateModel.js";
import { renderCertificate } from "../utils/dynamicCertificateRenderer.js";
import { ZipArchive } from "archiver";

const MAX_CSV_SIZE = 5 * 1024 * 1024; // maximum
const MAX_ROWS = 1000;
const MAX_VALUE_LENGTH = 300;
const USER_LOOKUP_CONCURRENCY = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYSTEM_EMAIL_FIELD = {
  id: "email",
  label: "Email (required, not displayed)",
  type: "text",
  system: true,
  hidden: true,
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const getColumn = (row, name) => String(row[name] ?? "").trim();
const labelOf = (field) => field.label || field.id;

function readRows(file) {
  if (!file) throw new HttpError(400, "No CSV file received. Attach it in the 'file' field");
  if (!/\.csv$/i.test(file.originalname || "")) throw new HttpError(400, "Only .csv files are allowed");
  if (!file.buffer?.length) throw new HttpError(400, "The CSV file is empty");
  if (file.size > MAX_CSV_SIZE) {
    throw new HttpError(413, `CSV must be 5 MB or smaller (received ${(file.size / 1048576).toFixed(1)} MB)`);
  }

  let rows;
  try {
    rows = parse(file.buffer.toString("utf8"), {
      columns: (headers) => headers.map((h) => String(h).trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_")),
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_column_count: false,
    });
  } catch (error) {
    throw new HttpError(400, `Invalid CSV${error.lines ? ` near line ${error.lines}` : ""}: ${error.message}`);
  }

  if (!rows.length) throw new HttpError(400, "CSV has no data rows");
  if (rows.length > MAX_ROWS) throw new HttpError(400, `CSV has ${rows.length} rows. Maximum is ${MAX_ROWS} per upload`);
  return rows;
}

function parseMapping(raw, fields, headers) {
  let mapping;
  try {
    mapping = raw ? JSON.parse(raw) : {};
  } catch {
    throw new HttpError(400, "Invalid field mapping");
  }
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) throw new HttpError(400, "Invalid field mapping");

  const unmapped = fields.filter((f) => typeof mapping[f.id] !== "string" || !mapping[f.id]);
  if (unmapped.length) throw new HttpError(400, `Map all template fields: ${unmapped.map(labelOf).join(", ")}`);

  const unknown = fields.filter((f) => !headers.includes(mapping[f.id]));
  if (unknown.length) throw new HttpError(400, `Mapped column not found in the CSV for: ${unknown.map(labelOf).join(", ")}`);
  return mapping;
}

async function loadTemplate(id) {
  if (!id || typeof id !== "string") throw new HttpError(400, "templateId is required");
  const template = await templateModel.getTemplateById(id);
  if (!template || !template.active) throw new HttpError(404, "Active certificate template not found");
  return {
    ...template,
    fields: [
      SYSTEM_EMAIL_FIELD,
      ...(template.fields || []).filter((field) => field?.id !== SYSTEM_EMAIL_FIELD.id),
    ],
  };
}

/** Resolve each unique email to a user, a few at a time. */
async function lookupUsers(emails) {
  const users = new Map();
  for (let i = 0; i < emails.length; i += USER_LOOKUP_CONCURRENCY) {
    await Promise.all(
      emails.slice(i, i + USER_LOOKUP_CONCURRENCY).map(async (email) => {
        users.set(email, EMAIL_RE.test(email) ? await authModel.getUserByEmail(email) : null);
      })
    );
  }
  return users;
}

/** Append to the ZIP and wait until it is flushed, so memory stays flat. */
function appendEntry(archive, res, buffer, name) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      archive.off("entry", onEntry);
      res.off("close", onClose);
    };
    const onEntry = (entry) => {
      if (entry.name === name) {
        cleanup();
        resolve();
      }
    };
    const onClose = () => {
      cleanup();
      reject(new Error("Client disconnected"));
    };
    archive.on("entry", onEntry);
    res.on("close", onClose);
    archive.append(buffer, { name });
  });
}

function sendError(res, error, fallback) {
  const known = error instanceof HttpError;
  if (!known) console.error(fallback, error);
  if (res.headersSent) return res.destroy(error); // browser sees a failed download, not a truncated ZIP
  res.status(known ? error.status : 500).json({ error: known ? error.message : fallback });
}

export async function previewDynamicCertificate(req, res) {
  try {
    const template = await loadTemplate(req.body.templateId);
    const input = req.body.data && typeof req.body.data === "object" && !Array.isArray(req.body.data) ? req.body.data : {};
    const data = Object.fromEntries(
      (template.fields || []).map((f) => [f.id, String(input[f.id] ?? "").slice(0, MAX_VALUE_LENGTH)])
    );
    const buffer = await renderCertificate(template, data);
    res.type("png").send(buffer);
  } catch (error) {
    sendError(res, error, "Failed to render preview");
  }
}

export async function generateDynamicCertificates(req, res) {
  try {
    /* ---------- 1. validate everything BEFORE streaming ---------- */
    const template = await loadTemplate(req.body.templateId);
    const rows = readRows(req.file);
    const fields = template.fields || [];
    if (fields[0]?.id !== "email" || !fields[0]?.system || !fields[0]?.hidden) {
      throw new HttpError(400, "Certificate template is missing its required locked email field");
    }
    const mapping = parseMapping(req.body.mapping, fields, Object.keys(rows[0]));
    if (Object.keys(rows[0])[0] !== "email" || mapping.email !== "email") {
      throw new HttpError(400, "The first CSV column must be email");
    }

    const missingEmail = rows.map((r, i) => (getColumn(r, "email") ? null : i + 2)).filter(Boolean);
    if (missingEmail.length) {
      throw new HttpError(
        400,
        `CSV must include an email for every row. Missing on line${missingEmail.length > 1 ? "s" : ""}: ${missingEmail.slice(0, 5).join(", ")}${missingEmail.length > 5 ? "…" : ""}`
      );
    }

    const users = await lookupUsers([...new Set(rows.map((r) => getColumn(r, "email").toLowerCase()))]);

    const jobs = [];
    const failures = [];
    rows.forEach((row, index) => {
      const line = index + 2;
      const email = getColumn(row, "email").toLowerCase();
      const values = Object.fromEntries(
        fields.map((f) => [f.id, String(row[mapping[f.id]] ?? "").trim().slice(0, MAX_VALUE_LENGTH)])
      );
      const emptyFields = fields.filter((f) => !values[f.id]).map(labelOf);
      if (emptyFields.length) return failures.push({ row: line, error: `Missing ${emptyFields.join(", ")}` });
      const user = users.get(email);
      if (!user) return failures.push({ row: line, error: `Student account not found for ${email}` });
      jobs.push({ index, email, values, user });
    });

    if (!jobs.length) {
      const sample = failures.slice(0, 3).map((f) => `line ${f.row}: ${f.error}`).join("; ");
      throw new HttpError(400, `No certificates could be generated. ${sample}`);
    }

    /* ---------- 2. stream the ZIP ---------- */
    const batchId = `dynamic_${Date.now()}_${req.user.userId}`;
    res.attachment("certificates.zip");
    const archive = new ZipArchive({ zlib: { level: 1 } }); // PNGs are already compressed
    archive.on("warning", (w) => console.warn("Certificate ZIP warning:", w.message));
    archive.on("error", (err) => {
      console.error("Certificate ZIP error:", err);
      res.destroy(err);
    });
    archive.pipe(res);

    let aborted = false;
    res.on("close", () => {
      if (!res.writableFinished) {
        aborted = true;
        archive.abort();
      }
    });

    let generated = 0;
    for (const job of jobs) {
      if (aborted) return;
      try {
        const buffer = await renderCertificate(template, job.values);
        await certificateModel.createDynamicCertificate({
          userId: job.user._id,
          title: template.name,
          templateId: template._id,
          data: job.values,
          email: job.email,
          batchId,
          issuedBy: req.user.userId,
        });
        const base = (job.values.name || job.values[fields[0]?.id] || `certificate-${job.index + 1}`)
          .replace(/[^a-z0-9_-]+/gi, "_")
          .slice(0, 80);
        await appendEntry(archive, res, buffer, `${String(job.index + 1).padStart(4, "0")}_${base}.png`);
        generated += 1;
      } catch (error) {
        if (aborted) return;
        failures.push({ row: job.index + 2, error: error.message });
      }
    }

    archive.append(
      JSON.stringify({ total: rows.length, generated, failed: failures.length, failures }, null, 2),
      { name: "generation-report.json" }
    );
    await archive.finalize();
    console.info(`Dynamic certificate batch ${batchId} by ${req.user.userId}: ${generated}/${rows.length}, failed ${failures.length}`);
  } catch (error) {
    sendError(res, error, "Failed to generate certificates");
  }
}