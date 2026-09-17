import { describe, expect, it } from "vitest";
import { annualSavings, dimensionValue, parseLimit, periodPrice } from "@/lib/plan-config";
import { csvCell, median, monthlyEquivalent, positionPlans } from "@/lib/pricing-benchmark";

describe("plan configuration", () => {
  it("reads entitlements as configured values", () => {
    const e = [
      { featureKey: "users", limitValue: 5, enabled: true },
      { featureKey: "contacts", limitValue: null, enabled: true },
      { featureKey: "ai_credits", limitValue: 100, enabled: false },
    ];
    expect(dimensionValue("users", e)).toBe("5 users");
    expect(dimensionValue("contacts", e)).toBe("Unlimited");
    expect(dimensionValue("ai_credits", e)).toBe("Not included");
    expect(dimensionValue("storage_gb", e)).toBeNull();
  });

  it("parses admin limit input", () => {
    expect(parseLimit("")).toEqual({ action: "remove" });
    expect(parseLimit("Unlimited")).toEqual({ action: "set", enabled: true, limitValue: null });
    expect(parseLimit("none")).toEqual({ action: "set", enabled: false, limitValue: null });
    expect(parseLimit("10,000")).toEqual({ action: "set", enabled: true, limitValue: 10000 });
    expect(parseLimit("2.5")).toEqual({ action: "invalid" });
    expect(parseLimit("-1")).toEqual({ action: "invalid" });
  });

  it("never invents an annual price", () => {
    expect(periodPrice({ price: 49, annualPrice: null }, "annual")).toBeNull();
    expect(periodPrice({ price: 49, annualPrice: 490 }, "annual")).toBe(490);
    expect(periodPrice({ price: 0, annualPrice: null }, "annual")).toBe(0);
    expect(annualSavings({ price: 49, annualPrice: 490 })).toBe(17);
    expect(annualSavings({ price: 49, annualPrice: 600 })).toBeNull();
    expect(annualSavings({ price: 0, annualPrice: 0 })).toBeNull();
  });
});

describe("pricing benchmark", () => {
  it("normalises intervals and medians", () => {
    expect(monthlyEquivalent(120, "year")).toBe(10);
    expect(monthlyEquivalent(99, "one_time")).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it("positions paid plans against same-currency benchmarks", () => {
    const rows = [
      { competitor: "A", planName: "Pro", price: 100, currency: "USD", interval: "month" },
      { competitor: "B", planName: "Pro", price: 1200, currency: "USD", interval: "year" },
      { competitor: "C", planName: "Pro", price: 200, currency: "USD", interval: "month" },
      { competitor: "D", planName: "Pro", price: 10, currency: "EUR", interval: "month" },
    ];
    const [free, cheap, mid, dear] = [{ name: "Free", price: 0 }, { name: "Starter", price: 49 }, { name: "Growth", price: 100 }, { name: "Scale", price: 300 }];
    const out = positionPlans([free, cheap, mid, dear], rows, "USD");
    expect(out.map((p) => p.plan)).toEqual(["Starter", "Growth", "Scale"]);
    expect(out[0]).toMatchObject({ compared: 3, median: 100, cheaperThan: 3, label: "Below market" });
    expect(out[1]).toMatchObject({ label: "At market", cheaperThan: 1 });
    expect(out[2]).toMatchObject({ label: "Above market", cheaperThan: 0, percentile: 0 });
    expect(positionPlans([cheap], [], "USD")[0].label).toBe("No comparison");
  });

  it("escapes CSV cells and neutralises formulas", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(null)).toBe("");
  });
});

import { checkMapping, parseCsv, suggestMapping, validateRow, toCsv } from "@/lib/data-transfer";

describe("data import", () => {
  it("parses quoted CSV with BOM, CRLF and embedded newlines", () => {
    const rows = parseCsv('﻿Email,Name,Notes\r\na@x.com,"Doe, Jane","line1\nline2"\r\n\r\nb@x.com,Bob,"say ""hi"""\r\n');
    expect(rows).toEqual([["Email", "Name", "Notes"], ["a@x.com", "Doe, Jane", "line1\nline2"], ["b@x.com", "Bob", 'say "hi"']]);
  });

  it("suggests mappings from common header names, once per field", () => {
    expect(suggestMapping("contacts", ["E-mail", "First Name", "Company Name", "Email", "Random"])).toEqual(["email", "firstName", "companyName", null, null]);
    expect(suggestMapping("deals", ["Opportunity", "Amount", "Deal Stage", "Close Date"])).toEqual(["name", "value", "stage", "closeDate"]);
  });

  it("validates and normalises rows", () => {
    const map = ["email", "firstName", "lastName", "tags", "status"];
    expect(validateRow("contacts", ["A@X.com", "Ann", "Lee", "vip; beta,vip", "Qualified"], map)).toEqual({ ok: true, data: { email: "a@x.com", firstName: "Ann", lastName: "Lee", tags: ["vip", "beta"], status: "qualified", name: "Ann Lee" } });
    expect(validateRow("contacts", ["not-an-email", "", "", "", ""], map)).toMatchObject({ ok: false });
    expect(validateRow("contacts", ["", "", "", "", ""], map)).toMatchObject({ ok: false, message: "A contact needs an email or a name" });
    expect(validateRow("contacts", ["", "Ann", "", "", "boss"], map)).toMatchObject({ ok: false });
    expect(validateRow("deals", ["Big deal", "$12,500.50", "eur", "WON"], ["name", "value", "currency", "status"])).toEqual({ ok: true, data: { name: "Big deal", value: 12500.5, currency: "EUR", status: "won" } });
    expect(validateRow("companies", ["Acme", "HTTPS://www.Acme.com/about"], ["name", "domain"])).toEqual({ ok: true, data: { name: "Acme", domain: "acme.com" } });
  });

  it("rejects incomplete or duplicate mappings", () => {
    expect(checkMapping("companies", ["a", "b"], ["domain", null])).toBe("Map a column to Name.");
    expect(checkMapping("contacts", ["a", "b"], ["email", "email"])).toBe("Each field can be mapped from one column only.");
    expect(checkMapping("contacts", ["a"], ["phone"])).toBe("Map a column to Email or a name field.");
    expect(checkMapping("contacts", ["a"], ["email", null])).toBe("The column mapping does not match the file.");
    expect(checkMapping("deals", ["a"], ["name"])).toBeNull();
  });

  it("writes spreadsheet-safe CSV", () => {
    expect(toCsv(["A", "B"], [["=cmd()", -5], [["x", "y"], null]])).toBe("A,B\r\n'=cmd(),-5\r\nx; y,\r\n");
  });
});
