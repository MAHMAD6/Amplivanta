import { describe, it, expect, vi, afterEach } from "vitest";
import { api, ApiRequestError } from "@/lib/client/api";

function mockFetch(status: number, body: unknown) {
  const text = body === undefined ? "" : JSON.stringify(body);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(text, { status, headers: { "Content-Type": "application/json" } })),
  );
}

describe("api client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns parsed JSON on 200", async () => {
    mockFetch(200, { id: "1", name: "ok" });
    const res = await api.get<{ id: string }>("/api/x");
    expect(res.id).toBe("1");
  });

  it("throws ApiRequestError with the server message on non-2xx", async () => {
    mockFetch(400, { error: "Validation failed" });
    await expect(api.post("/api/x", {})).rejects.toMatchObject({
      name: "Error",
      status: 400,
      message: "Validation failed",
    });
    await expect(api.post("/api/x", {})).rejects.toBeInstanceOf(ApiRequestError);
  });

  it("falls back to a generic message when no error field is present", async () => {
    mockFetch(500, {});
    await expect(api.del("/api/x")).rejects.toMatchObject({ status: 500 });
  });

  it("sends a JSON body with content-type on POST", async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal("fetch", spy);
    await api.post("/api/x", { a: 1 });
    expect(spy).toHaveBeenCalledWith(
      "/api/x",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: 1 }),
      }),
    );
  });
});
