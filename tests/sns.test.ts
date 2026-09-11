import { describe, expect, it } from "vitest";
import { canonicalString, isTrustedAwsUrl, type SnsMessage } from "@/lib/sns";

const base = {
  MessageId: "m-1",
  TopicArn: "arn:aws:sns:eu-west-1:123:ses-events",
  Message: "{}",
  Timestamp: "2026-09-11T00:00:00.000Z",
  Signature: "sig",
  SignatureVersion: "2" as const,
  SigningCertURL: "https://sns.eu-west-1.amazonaws.com/cert.pem",
};

describe("SNS canonical string", () => {
  it("signs notification fields in AWS's order, omitting an absent Subject", () => {
    const m: SnsMessage = { ...base, Type: "Notification" };
    expect(canonicalString(m)).toBe(
      "Message\n{}\nMessageId\nm-1\nTimestamp\n2026-09-11T00:00:00.000Z\nTopicArn\narn:aws:sns:eu-west-1:123:ses-events\nType\nNotification\n",
    );
  });

  it("includes Subject when present", () => {
    const m: SnsMessage = { ...base, Type: "Notification", Subject: "Hi" };
    expect(canonicalString(m)).toContain("MessageId\nm-1\nSubject\nHi\nTimestamp\n");
  });

  it("signs SubscribeURL and Token for subscription confirmations", () => {
    const m: SnsMessage = { ...base, Type: "SubscriptionConfirmation", SubscribeURL: "https://sns.x/confirm", Token: "t" };
    expect(canonicalString(m)).toBe(
      "Message\n{}\nMessageId\nm-1\nSubscribeURL\nhttps://sns.x/confirm\nTimestamp\n2026-09-11T00:00:00.000Z\nToken\nt\nTopicArn\narn:aws:sns:eu-west-1:123:ses-events\nType\nSubscriptionConfirmation\n",
    );
  });
});

describe("certificate URL trust", () => {
  it("accepts only HTTPS SNS hosts", () => {
    expect(isTrustedAwsUrl("https://sns.eu-west-1.amazonaws.com/a.pem")).toBe(true);
    expect(isTrustedAwsUrl("http://sns.eu-west-1.amazonaws.com/a.pem")).toBe(false);
    expect(isTrustedAwsUrl("https://sns.eu-west-1.amazonaws.com.evil.com/a.pem")).toBe(false);
    expect(isTrustedAwsUrl("https://evil.com/sns.eu-west-1.amazonaws.com")).toBe(false);
    expect(isTrustedAwsUrl("not a url")).toBe(false);
  });
});
