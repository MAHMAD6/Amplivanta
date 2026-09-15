import { describe, expect, it } from "vitest";
import { safeReturnTo, signState, verifyState } from "@/lib/oauth";
import { missingScopes } from "@/lib/google/services";

describe("OAuth state", () => {
  it("binds workspace, user, provider and return path to the browser nonce", () => {
    const { state, nonce } = signState({ workspaceId: "w1", userId: "u1" }, "google_analytics", "/app/integrations/connected");
    expect(verifyState(state, nonce)).toMatchObject({ workspaceId: "w1", userId: "u1", provider: "google_analytics", returnTo: "/app/integrations/connected" });
    expect(verifyState(state, "other-nonce")).toBeNull();
    expect(verifyState(state, undefined)).toBeNull();
    expect(verifyState(`${state.split(".")[0]}.tampered`, nonce)).toBeNull();
  });

  it("only allows in-app return paths", () => {
    expect(safeReturnTo("https://evil.example")).toBe("/app/integrations/connected");
    expect(safeReturnTo("//evil.example/app")).toBe("/app/integrations/connected");
    expect(safeReturnTo("/app/analytics?tab=seo")).toBe("/app/analytics?tab=seo");
  });
});

describe("missingScopes", () => {
  it("detects scopes the user did not grant", () => {
    expect(missingScopes("youtube", "https://www.googleapis.com/auth/youtube.readonly")).toEqual(["https://www.googleapis.com/auth/yt-analytics.readonly"]);
    expect(missingScopes("google_analytics", "openid https://www.googleapis.com/auth/analytics.readonly")).toEqual([]);
  });
});
