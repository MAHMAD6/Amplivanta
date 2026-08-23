import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 storage (S3-compatible). Uploads use short-lived presigned PUT
 * URLs so file bytes never pass through the app server. Reads use the public
 * bucket URL when configured, else a presigned GET.
 *
 * Env:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 *   R2_PUBLIC_URL (optional — a public bucket / custom domain base URL)
 */

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!isStorageConfigured()) throw new Error("R2 storage is not configured");
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

const BUCKET = () => process.env.R2_BUCKET!;

/** A namespaced object key: workspaceId/folder/uuid-filename. */
export function buildObjectKey(workspaceId: string, filename: string, folder = "assets"): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(-120);
  const uuid = crypto.randomUUID();
  return `${workspaceId}/${folder}/${uuid}-${safe}`;
}

/** Presigned PUT URL the browser uploads directly to (expires in 10 min). */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: contentType }),
    { expiresIn: 600 },
  );
}

/** Public URL for an object, or a presigned GET when no public base is set. */
export async function objectUrl(key: string): Promise<string> {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: BUCKET(), Key: key }), {
    expiresIn: 3600,
  });
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: BUCKET(), Key: key }));
}
