import { createRequire } from "module";
import { parse } from "csv-parse/sync";
import * as authModel from "../models/authModel.js";
import * as certificateModel from "../models/certificateModel.js";
import * as templateModel from "../models/certificateTemplateModel.js";
import { renderCertificate } from "../utils/dynamicCertificateRenderer.js";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

const MAX_CSV_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 1000;

function getColumn(row, name) {
  return String(row[name] ?? "").trim();
}

function readRows(file) {
  if (!file || file.size > MAX_CSV_SIZE || !/\.csv$/i.test(file.originalname || "")) throw new Error("Upload a CSV file up to 5MB");
  const rows = parse(file.buffer.toString("utf8"), {
    columns: (headers) => headers.map((header) => header.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_")),
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: false,
  });
  if (!rows.length || rows.length > MAX_ROWS) throw new Error("CSV must contain between 1 and 1000 data rows");
  return rows;
}

async function loadTemplate(id) {
  const template = await templateModel.getTemplateById(id);
  if (!template || !template.active) throw new Error("Active certificate template not found");
  return template;
}

export async function previewDynamicCertificate(req, res) {
  try {
    const template = await loadTemplate(req.body.templateId);
    const data = req.body.data && typeof req.body.data === "object" ? req.body.data : {};
    const buffer = await renderCertificate(template, data);
    res.type("png").send(buffer);
  } catch (error) { res.status(400).json({ error: error.message || "Failed to render preview" }); }
}

export async function generateDynamicCertificates(req, res) {
  try {
    const template = await loadTemplate(req.body.templateId);
    const rows = readRows(req.file);
    const fields = template.fields || [];
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const batchId = `dynamic_${Date.now()}_${req.user.userId}`;
    if (!rows.every((row) => getColumn(row, "email"))) {
      return res.status(400).json({ error: "CSV must include an email column for student delivery" });
    }
    const missing = fields.filter((field) => !mapping[field.id]).map((field) => field.label || field.id);
    if (missing.length) return res.status(400).json({ error: `Map all template fields: ${missing.join(", ")}` });

    res.attachment("certificates.zip");
    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", (error) => { throw error; });
    archive.pipe(res);
    let generated = 0;
    const failures = [];
    for (let index = 0; index < rows.length; index += 1) {
      try {
        const values = Object.fromEntries(fields.map((field) => [field.id, String(rows[index][mapping[field.id]] ?? "").trim()]));
        const missingValues = fields.filter((field) => !values[field.id]).map((field) => field.label || field.id);
        if (missingValues.length) throw new Error(`Missing ${missingValues.join(", ")}`);
        const buffer = await renderCertificate(template, values);
        const email = getColumn(rows[index], "email").toLowerCase();
        const user = await authModel.getUserByEmail(email);
        if (!user) throw new Error(`Student account not found for ${email}`);
        await certificateModel.createDynamicCertificate({
          userId: user._id,
          title: template.name,
          templateId: template._id,
          data: values,
          email,
          batchId,
          issuedBy: req.user.userId,
        });
        const safeName = (values.name || values[fields[0]?.id] || `certificate-${index + 1}`).replace(/[^a-z0-9_-]+/gi, "_").slice(0, 80);
        archive.append(buffer, { name: `${String(index + 1).padStart(4, "0")}_${safeName}.png` });
        generated += 1;
      } catch (error) { failures.push({ row: index + 2, error: error.message }); }
    }
    archive.append(JSON.stringify({ total: rows.length, generated, failed: failures.length, failures }, null, 2), { name: "generation-report.json" });
    await archive.finalize();
    console.info(`Dynamic certificate batch by ${req.user.userId}: ${generated}/${rows.length}, failed ${failures.length}`);
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ error: error.message || "Failed to generate certificates" });
  }
}
