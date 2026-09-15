import { describe, expect, it } from "vitest";
import { nextStatusForReview } from "@/lib/social/platforms";
import { parsePreferences, PREFERENCE_SCOPES } from "@/lib/preferences";
import { csvCell } from "@/lib/audit-filters";

describe("nextStatusForReview", () => {
  it("only decides posts awaiting review", () => {
    expect(nextStatusForReview("draft", "approve", false)).toBeNull();
    expect(nextStatusForReview("pending_approval", "approve", true)).toBe("scheduled");
    expect(nextStatusForReview("pending_approval", "approve", false)).toBe("approved");
    expect(nextStatusForReview("pending_approval", "changes", true)).toBe("changes_requested");
    expect(nextStatusForReview("pending_approval", "reject", false)).toBe("rejected");
  });
});

describe("parsePreferences", () => {
  const scope = PREFERENCE_SCOPES["social.settings"];
  it("keeps defined keys with valid values and drops everything else", () => {
    const v = parsePreferences(scope, { timezone: "Europe/London", defaultVisibility: "nope", requireApproval: "on", utmSource: "newsletter", injected: "x", utmMedium: "<script>" });
    expect(v).toMatchObject({ timezone: "Europe/London", requireApproval: true, utmSource: "newsletter", urlShortening: false });
    expect(v).not.toHaveProperty("defaultVisibility");
    expect(v).not.toHaveProperty("injected");
    expect(v).not.toHaveProperty("utmMedium");
  });
});

describe("csvCell", () => {
  it("quotes separators and neutralizes formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(null)).toBe("");
  });
});
