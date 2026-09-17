import { ApiError } from "@/lib/tenant";
import { IMPORT_FIELDS, IMPORT_LIMITS, type ImportEntity } from "@/lib/data-transfer";

export function importEntity(v: unknown): ImportEntity {
  if (typeof v === "string" && v in IMPORT_FIELDS) return v as ImportEntity;
  throw new ApiError(400, "Choose contacts, companies or deals.");
}

/** Reads the uploaded CSV from multipart form data, enforcing type and size. */
export async function readUpload(form: FormData): Promise<{ text: string; fileName: string }> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw new ApiError(400, "Choose a CSV file to upload.");
  if (file.size > IMPORT_LIMITS.bytes) throw new ApiError(413, "Files are limited to 5 MB.");
  const name = file.name || "import.csv";
  if (!/\.csv$/i.test(name) && !/csv|text\/plain/.test(file.type)) throw new ApiError(415, "Only CSV files are supported. Save spreadsheets as CSV first.");
  const text = await file.text();
  if (text.includes(String.fromCharCode(0))) throw new ApiError(415, "That file is not a text CSV.");
  return { text, fileName: name.slice(0, 200) };
}
