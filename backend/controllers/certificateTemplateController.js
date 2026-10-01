import cloudinary from "cloudinary";
import sharp from "sharp";
import * as templateModel from "../models/certificateTemplateModel.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/png", "image/jpeg"]);
const allowedAlignments = new Set(["left", "center", "right"]);

function validateFields(fields, width, height) {
  if (!Array.isArray(fields) || fields.length > 50) throw new Error("Invalid template fields");
  return fields.map((field) => {
    if (!field?.id || !/^[a-z0-9_-]+$/i.test(field.id)) throw new Error("Invalid field ID");
    const x = Number(field.x); const y = Number(field.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > width || y > height) throw new Error(`Field ${field.id} is outside the canvas`);
    return {
      id: field.id, label: String(field.label || field.id).slice(0, 100), type: "text", x, y,
      maxWidth: Math.min(Math.max(Number(field.maxWidth) || 0, 0), width),
      fontSize: Math.min(Math.max(Number(field.fontSize) || 32, 1), 300),
      fontFamily: ["Arial", "Georgia", "Times New Roman", "Verdana", "Helvetica"].includes(field.fontFamily) ? field.fontFamily : "Arial",
      fontWeight: field.fontWeight === "bold" ? "bold" : "normal",
      fontStyle: field.fontStyle === "italic" ? "italic" : "normal",
      color: /^#[0-9a-f]{6}$/i.test(field.color || "") ? field.color : "#000000",
      alignment: allowedAlignments.has(field.alignment) ? field.alignment : "left",
    };
  });
}

async function uploadBackground(file) {
  if (!file || !allowedTypes.has(file.mimetype) || file.size > MAX_FILE_SIZE) throw new Error("Upload a PNG or JPEG image up to 10MB");
  const metadata = await sharp(file.buffer).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200 || metadata.width > 10000 || metadata.height > 10000) throw new Error("Image dimensions must be between 200 and 10000 pixels");
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream({ folder: "icell/certificate-templates", resource_type: "image", format: "png" }, (error, value) => error ? reject(error) : resolve(value));
    stream.end(file.buffer);
  });
  return { ...result, width: metadata.width, height: metadata.height };
}

export async function listCertificateTemplates(req, res) {
  try { res.json({ templates: await templateModel.listTemplates({ activeOnly: req.query.activeOnly === "true" }) }); }
  catch (error) { console.error(error); res.status(500).json({ error: "Failed to load templates" }); }
}

export async function getCertificateTemplate(req, res) {
  try { const template = await templateModel.getTemplateById(req.params.id); if (!template) return res.status(404).json({ error: "Template not found" }); res.json({ template }); }
  catch (error) { res.status(500).json({ error: "Failed to load template" }); }
}

export async function createCertificateTemplate(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    if (!name || name.length > 150) return res.status(400).json({ error: "A template name is required" });
    const upload = await uploadBackground(req.file);
    const fields = validateFields(JSON.parse(req.body.fields || "[]"), upload.width, upload.height);
    const template = await templateModel.createTemplate({ name, background_url: upload.secure_url, cloudinary_public_id: upload.public_id, canvas_width: upload.width, canvas_height: upload.height, fields, created_by: req.user.userId });
    res.status(201).json({ template });
  } catch (error) { console.error(error); res.status(400).json({ error: error.message || "Failed to create template" }); }
}

export async function updateCertificateTemplate(req, res) {
  try {
    const existing = await templateModel.getTemplateById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Template not found" });
    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim().slice(0, 150);
    if (req.body.fields !== undefined) updates.fields = validateFields(JSON.parse(req.body.fields), existing.canvas_width, existing.canvas_height);
    if (req.body.active !== undefined) updates.active = req.body.active === "true" || req.body.active === true;
    if (req.file) { const upload = await uploadBackground(req.file); Object.assign(updates, { background_url: upload.secure_url, cloudinary_public_id: upload.public_id, canvas_width: upload.width, canvas_height: upload.height }); }
    const template = await templateModel.updateTemplate(req.params.id, updates);
    res.json({ template });
  } catch (error) { res.status(400).json({ error: error.message || "Failed to update template" }); }
}

export async function deleteCertificateTemplate(req, res) {
  try { const result = await templateModel.deleteTemplate(req.params.id); if (!result.deletedCount) return res.status(404).json({ error: "Template not found" }); res.json({ message: "Template deleted" }); }
  catch (error) { res.status(500).json({ error: "Failed to delete template" }); }
}
