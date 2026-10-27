import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// An explicit HTTP contract fixture, never production content or a hosted-CMS test.
test("Next.js ↔ Strapi HTTP contract", { timeout: 120000 }, async (t) => {
  let published = true,
    unavailable = false;
  const seen = [];
  const fixture = {
    documentId: "contractfixture000000001",
    slug: "contract-fixture",
    title: "Contract fixture",
    shortDescription: "Test data only",
    projectType: "film",
    publishedAt: new Date().toISOString(),
    thumbnail: { url: "https://ik.imagekit.io/contract/fixture.jpg" },
    category: { name: "Test film", slug: "test-film" },
  };
  const mock = createServer((req, res) => {
    const u = new URL(req.url, "http://fixture");
    seen.push(u);
    if (unavailable) {
      res.writeHead(503);
      res.end("{}");
      return;
    }
    res.setHeader("content-type", "application/json");
    if (u.pathname === "/api/projects") {
      const records =
        u.searchParams.get("status") === "draft"
          ? [{ ...fixture, title: "Private draft fixture", publishedAt: null }]
          : published
            ? [fixture]
            : [];
      res.end(JSON.stringify({ data: records }));
    } else if (u.pathname === "/api/services") {
      res.end(JSON.stringify({ data: [] }));
    } else res.end(JSON.stringify({ data: null }));
  });
  await new Promise((r) => mock.listen(0, "127.0.0.1", r));
  const mockPort = mock.address().port;
  const base = "http://127.0.0.1:3001";
  const secret = "contract-only-secret-with-more-than-32-characters";
  const child = spawn(
    process.execPath,
    [
      resolve("node_modules/next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3001",
    ],
    {
      cwd: resolve("apps/web"),
      env: {
        ...process.env,
        STRAPI_URL: `http://127.0.0.1:${mockPort}`,
        STRAPI_SERVER_API_TOKEN: "contract-fixture-token",
        STRAPI_REVALIDATION_SECRET: secret,
        STRAPI_PREVIEW_SECRET: secret,
        IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/contract",
        NEXT_PUBLIC_SITE_URL: base,
        NEXT_TELEMETRY_DISABLED: "1",
        NEXT_DIST_DIR: ".next-contract",
      },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stdout.on("data", (d) => {
    output = (output + d).slice(-5000);
  });
  child.stderr.on("data", (d) => {
    output = (output + d).slice(-5000);
  });
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        const r = await fetch(base + "/services");
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {}
      await delay(300);
    }
    assert.ok(ready, output);
    await t.test(
      "published records render from the HTTP API with explicit published status",
      async () => {
        const res = await fetch(base + "/projects");
        const html = await res.text();
        assert.equal(res.status, 200);
        assert.ok(html.includes("Contract fixture"));
        assert.ok(html.includes("https://ik.imagekit.io/contract/fixture.jpg"));
        assert.ok(
          seen
            .filter((x) => x.pathname === "/api/projects")
            .every((x) => x.searchParams.get("status") === "published"),
        );
      },
    );
    await t.test(
      "published detail renders and a signed preview switches to uncached drafts",
      async () => {
        const live = await fetch(base + "/projects/contract-fixture");
        assert.equal(live.status, 200);
        assert.ok((await live.text()).includes("Contract fixture"));
        const preview = await fetch(
          base + `/api/preview?secret=${secret}&slug=contract-fixture`,
          { redirect: "manual" },
        );
        assert.equal(preview.status, 307);
        const cookie = preview.headers
          .getSetCookie()
          .map((x) => x.split(";")[0])
          .join("; ");
        assert.ok(cookie.includes("__prerender_bypass"));
        const draft = await fetch(base + "/projects/contract-fixture", {
          headers: { cookie },
        });
        assert.ok((await draft.text()).includes("Private draft fixture"));
      },
    );
    await t.test(
      "unpublication webhook removes a public detail with HTTP 404",
      async () => {
        published = false;
        const webhook = await fetch(base + "/api/revalidate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "entry.unpublish", model: "project" }),
        });
        assert.equal(webhook.status, 200);
        assert.equal((await webhook.json()).revalidated, true);
        const res = await fetch(base + "/projects/contract-fixture");
        assert.equal(res.status, 404);
      },
    );
    await t.test(
      "CMS failures show a public unavailable state without crashing",
      async () => {
        unavailable = true;
        await fetch(base + "/api/revalidate", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event: "entry.update", model: "project" }),
        });
        const res = await fetch(base + "/projects");
        assert.equal(res.status, 200);
        assert.ok(
          (await res.text()).includes("collection is temporarily unavailable"),
        );
      },
    );
  } finally {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {}
    await new Promise((r) => mock.close(r));
  }
});
