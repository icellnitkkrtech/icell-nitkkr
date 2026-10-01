export const certificateTemplateSchema = {
  _id: String,
  name: String,
  background_url: String,
  cloudinary_public_id: String,
  canvas_width: Number,
  canvas_height: Number,
  fields: Array,
  created_by: String,
  active: Boolean,
  created_at: Date,
  updated_at: Date,
};
