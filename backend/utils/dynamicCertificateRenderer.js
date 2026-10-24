import sharp from "sharp";

const allowedFonts = new Set(["Arial", "Georgia", "Times New Roman", "Verdana", "Helvetica"]);
const allowedAlignments = new Set(["left", "center", "right"]);

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value, maxWidth, fontSize) {
  const words = String(value ?? "").split(/\s+/).filter(Boolean);
  if (!maxWidth) return [String(value ?? "")];
  const maxChars = Math.max(1, Math.floor(maxWidth / Math.max(fontSize * 0.55, 1)));
  const lines = [];
  let line = "";
  for (const word of words) {
    let remaining = word;
    while (remaining.length > maxChars) {
      if (line) {
        lines.push(line);
        line = "";
      }
      lines.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }
    const next = line ? `${line} ${remaining}` : remaining;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = remaining;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderCertificate(template, data) {
  const fields = Array.isArray(template.fields) ? template.fields : [];
  const text = fields.flatMap((field) => {
    if (field.system || field.hidden) return [];
    const width = Math.max(1, Number(template.canvas_width) || 1);
    const height = Math.max(1, Number(template.canvas_height) || 1);
    const fontSize = Math.max(1, Number(field.fontSize) || 32);
    const lineHeight = Math.round(fontSize * 1.2);
    const family = allowedFonts.has(field.fontFamily) ? field.fontFamily : "Arial";
    const alignment = allowedAlignments.has(field.alignment) ? field.alignment : "left";
    const anchor = alignment === "center" ? "middle" : alignment === "right" ? "end" : "start";
    const rawX = Number(field.x);
    const rawY = Number(field.y);
    const x = Math.min(width, Math.max(0, Number.isFinite(rawX) ? rawX : 0));
    const y = Math.min(height, Math.max(lineHeight, Number.isFinite(rawY) ? rawY : lineHeight));
    const availableWidth = alignment === "center" ? Math.min(x, width - x) * 2 : alignment === "right" ? x : width - x;
    const maxWidth = Math.min(Number(field.maxWidth) || availableWidth, availableWidth);
    const lines = wrapText(data[field.id], Math.max(1, maxWidth), fontSize);
    const firstBaseline = Math.min(y, Math.max(lineHeight, height - (lines.length - 1) * lineHeight));
    return lines.map((line, index) => `<text x="${x}" y="${firstBaseline + index * lineHeight}" text-anchor="${anchor}" fill="${escapeXml(field.color || "#000000")}" font-family="${family}" font-size="${fontSize}" font-weight="${field.fontWeight === "bold" ? "bold" : "normal"}" font-style="${field.fontStyle === "italic" ? "italic" : "normal"}">${escapeXml(line)}</text>`);
  }).join("");

  const background = await fetch(template.background_url).then((response) => {
    if (!response.ok) throw new Error("Unable to fetch certificate background");
    return response.arrayBuffer();
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${template.canvas_width}" height="${template.canvas_height}"><image href="data:image/png;base64,${Buffer.from(await sharp(Buffer.from(background)).png().toBuffer()).toString("base64")}" width="100%" height="100%" preserveAspectRatio="none"/>${text}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
