import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

const collection = () => getDB().collection("certificate_templates");

export async function listTemplates({ activeOnly = false } = {}) {
  const filter = activeOnly ? { active: true } : {};
  return collection().find(filter).sort({ updated_at: -1 }).toArray();
}

export async function getTemplateById(id) {
  return collection().findOne({ _id: id });
}

export async function createTemplate(data) {
  const now = new Date();
  const template = {
    _id: uuidv4(),
    name: data.name,
    background_url: data.background_url,
    cloudinary_public_id: data.cloudinary_public_id,
    canvas_width: data.canvas_width,
    canvas_height: data.canvas_height,
    fields: data.fields || [],
    created_by: data.created_by,
    active: data.active !== false,
    created_at: now,
    updated_at: now,
  };
  await collection().insertOne(template);
  return template;
}

export async function updateTemplate(id, updates) {
  const result = await collection().findOneAndUpdate(
    { _id: id },
    { $set: { ...updates, updated_at: new Date() } },
    { returnDocument: "after" }
  );
  return result;
}

export async function deleteTemplate(id) {
  return collection().deleteOne({ _id: id });
}
