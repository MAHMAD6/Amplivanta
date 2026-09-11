import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3-compatible object storage: IONOS (the approved provider), or Cloudflare
 * R2 for existing deployments. Uploads use short-lived presigned PUT URLs so
 * file bytes never pass through the app server; objects are private and read
 * through presigned GETs unless a public base URL is configured.
 *
 * IONOS / generic S3 (preferred):
 *   S3_ENDPOINT        e.g. https://s3.eu-central-1.ionoscloud.com
 *   S3_REGION          e.g. eu-central-1
 *   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET
 *   S3_PRIVATE_BUCKET  bucket for Marketplace deliverables (defaults to S3_BUCKET)
 *   S3_PUBLIC_URL      optional public base for non-sensitive assets
 * Legacy R2: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
 */

type StorageConfig = {
  provider: "s3" | "r2";
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  privateBucket: string;
  publicUrl?: string;
  forcePathStyle: boolean;
};

function readConfig(): StorageConfig | null {
  const e = process.env;
  if (e.S3_ENDPOINT && e.S3_ACCESS_KEY_ID && e.S3_SECRET_ACCESS_KEY && e.S3_BUCKET) {
    return {
      provider: "s3",
      endpoint: e.S3_ENDPOINT,
      region: e.S3_REGION || "eu-central-1",
      accessKeyId: e.S3_ACCESS_KEY_ID,
      secretAccessKey: e.S3_SECRET_ACCESS_KEY,
      bucket: e.S3_BUCKET,
      privateBucket: e.S3_PRIVATE_BUCKET || e.S3_BUCKET,
      publicUrl: e.S3_PUBLIC_URL,
      forcePathStyle: e.S3_FORCE_PATH_STYLE !== "false",
    };
  }
  if (e.R2_ACCOUNT_ID && e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && e.R2_BUCKET) {
    return {
      provider: "r2",
      endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: "auto",
      accessKeyId: e.R2_ACCESS_KEY_ID,
      secretAccessKey: e.R2_SECRET_ACCESS_KEY,
      bucket: e.R2_BUCKET,
      privateBucket: e.R2_BUCKET,
      publicUrl: e.R2_PUBLIC_URL,
      forcePathStyle: false,
    };
  }
  return null;
}

export function isStorageConfigured(): boolean {
  return readConfig() !== null;
}

export function storageProviderName(): "s3" | "r2" | null {
  return readConfig()?.provider ?? null;
}

let client: S3Client | null = null;
function getClient(): { client: S3Client; config: StorageConfig } {
  const config = readConfig();
  if (!config) throw new Error("Object storage is not configured");
  if (!client) {
    client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return { client, config };
}

/** A namespaced object key: workspaceId/folder/uuid-filename. */
export function buildObjectKey(workspaceId: string, filename: string, folder = "assets"): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(-120);
  const uuid = crypto.randomUUID();
  return `${workspaceId}/${folder}/${uuid}-${safe}`;
}

/** Presigned PUT URL the browser uploads directly to (expires in 10 min). */
export async function presignUpload(key: string, contentType: string, opts: { private?: boolean } = {}): Promise<string> {
  const { client, config } = getClient();
  const Bucket = opts.private ? config.privateBucket : config.bucket;
  return getSignedUrl(client, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType }), { expiresIn: 600 });
}

/** Public URL for a non-sensitive object, or a presigned GET when no public base is set. */
export async function objectUrl(key: string): Promise<string> {
  const { client, config } = getClient();
  if (config.publicUrl) return `${config.publicUrl.replace(/\/$/, "")}/${key}`;
  return getSignedUrl(client, new GetObjectCommand({ Bucket: config.bucket, Key: key }), { expiresIn: 3600 });
}

/**
 * Short-lived download link for a private object (Marketplace deliverables).
 * Never uses the public base URL: callers must have checked entitlement first.
 */
export async function presignPrivateDownload(key: string, ttlSeconds: number, filename?: string): Promise<string> {
  const { client, config } = getClient();
  const ttl = Math.min(Math.max(Math.floor(ttlSeconds), 30), 3600);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.privateBucket,
      Key: key,
      ResponseContentDisposition: filename ? `attachment; filename="${filename.replace(/"/g, "")}"` : undefined,
    }),
    { expiresIn: ttl },
  );
}

export async function deleteObject(key: string, opts: { private?: boolean } = {}): Promise<void> {
  const { client, config } = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: opts.private ? config.privateBucket : config.bucket, Key: key }));
}
