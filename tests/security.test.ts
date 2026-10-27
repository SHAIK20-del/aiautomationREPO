import { test } from "node:test";
import assert from "node:assert/strict";
import { inquirySchema } from "../packages/shared/src/index";
import {
  readTextBounded,
  BodyTooLarge,
  equalSecret,
  sessionToken,
  validSession,
  sameOrigin,
  rateKey,
} from "../apps/web/src/lib/security";
const input = {
  name: "A visitor",
  email: "visitor@example.com",
  company: "Studio",
  service: "AI Workflow Automation",
  estimatedBudget: "Exploring options",
  message: "An idea for automating our customer support workflow.",
  website: "",
};
test("inquiry accepts valid input and strips unknown properties", () => {
  const parsed = inquirySchema.parse({ ...input, admin: true });
  assert.equal(parsed.name, "A visitor");
  assert.equal("admin" in parsed, false);
});
test("inquiry rejects invalid email, short messages and honeypot spam", () => {
  for (const patch of [
    { email: "invalid" },
    { message: "short" },
    { website: "spam" },
    { service: "arbitrary" },
    { name: "x".repeat(101) },
  ])
    assert.equal(
      inquirySchema.safeParse({ ...input, ...patch }).success,
      false,
    );
});
test("owner session expires, rejects tampering, and requires a strong key", () => {
  const secret = "a".repeat(40),
    now = Date.now(),
    token = sessionToken(secret, now);
  assert.ok(validSession(token, secret, now));
  assert.equal(validSession(token + "a", secret, now), false);
  assert.equal(
    validSession(token, secret, now + 8 * 60 * 60 * 1000 + 1),
    false,
  );
  assert.equal(validSession(token, "short", now), false);
  assert.equal(validSession(token, "b".repeat(40), now), false);
});
test("secret comparison fails closed for unset values", () => {
  assert.equal(equalSecret("", undefined), false);
  assert.equal(equalSecret("test", "test"), true);
  assert.equal(equalSecret("test", "tests"), false);
});
test("cross-origin writes are rejected", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  assert.ok(
    sameOrigin(
      new Request("http://localhost:3000", {
        headers: { origin: "http://localhost:3000" },
      }),
    ),
  );
  assert.equal(
    sameOrigin(
      new Request("http://localhost:3000", {
        headers: { origin: "https://attacker.test" },
      }),
    ),
    false,
  );
  assert.equal(sameOrigin(new Request("http://localhost:3000")), false);
});
test("self-hosted rate limit does not trust spoofable forwarded IPs", () => {
  process.env.RATE_LIMIT_SALT = "a".repeat(40);
  delete process.env.VERCEL;
  const a = rateKey(
    new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    }),
    "contact",
  );
  const b = rateKey(
    new Request("http://localhost", {
      headers: { "x-forwarded-for": "5.6.7.8" },
    }),
    "contact",
  );
  assert.equal(a, b);
  assert.equal(a.includes("1.2.3.4"), false);
});

test("request size is bounded even without a Content-Length header", async () => {
  const body = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode("x".repeat(20000)));
      c.close();
    },
  });
  const request = new Request("http://localhost", {
    method: "POST",
    body,
    duplex: "half",
  } as RequestInit);
  await assert.rejects(readTextBounded(request), BodyTooLarge);
  assert.equal(
    await readTextBounded(
      new Request("http://localhost", { method: "POST", body: "hello" }),
    ),
    "hello",
  );
});
