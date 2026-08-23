"use client";

/**
 * Thin client-side fetch wrapper for the JSON API routes. Sends/parses JSON,
 * surfaces the server's `{ error }` message, and throws on non-2xx so callers
 * can `try/catch` + toast. Every route is workspace-scoped server-side, so no
 * tenant params are needed here.
 */
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.error as string)) || `Request failed (${res.status})`;
    throw new ApiRequestError(res.status, message);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body: unknown) => request<T>("POST", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  del: <T>(url: string) => request<T>("DELETE", url),
};
