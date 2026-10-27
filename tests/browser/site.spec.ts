import { test, expect } from "@playwright/test";
test("home renders its real sculpture or refined fallback without hiding content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "intelligence",
  );
  await expect(
    page.getByRole("img", { name: /^Intelligence Core:/ }),
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByRole("link", { name: "Explore the studio", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
  const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect((heading?.x ?? 0) + (heading?.width ?? 0)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("expertise tabs and keyboard navigation change the panel", async ({
  page,
}) => {
  await page.goto("/services");
  await page.getByRole("tab", { name: /AI Agents/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "A new kind of team player",
  );
  await page.getByRole("tab", { name: /AI Agents/ }).press("ArrowDown");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Everything, working together",
  );
  await page.getByRole("link", { name: "Explore the possibilities" }).click();
  await expect(page).toHaveURL(/services\/business-integrations/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Business Integrations",
  );
});
test("conceptual workflow explains human review", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Decide/ }).click();
  await expect(page.locator("#workflow-description")).toContainText(
    "go to a person for review",
  );
  await expect(page.locator("#workflow-description")).toContainText(
    "no live integrations",
  );
});
test("gallery filters have a genuine empty state and missing work returns 404", async ({
  page,
}) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "AI Films", exact: true }).click();
  await expect(page).toHaveURL(/category=film/);
  await expect(
    page.getByRole("heading", { name: "A little space for what’s next." }),
  ).toBeVisible();
  const res = await page.goto("/projects/not-a-published-project");
  expect(res?.status()).toBe(404);
});
test("contact validation and unavailable persistence never report success", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send your inquiry" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await page.getByLabel("Your name").fill("Test Visitor");
  await page.getByLabel("Email address").fill("visitor@example.com");
  await page
    .getByLabel("A little about your idea")
    .fill("We would like to discuss an intelligent automation project.");
  await page.getByRole("button", { name: "Send your inquiry" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "couldn’t save" }),
  ).toContainText("couldn’t save your inquiry");
  await expect(page.getByText("A new possibility begins.")).toHaveCount(0);
});
test("private endpoints and write origins fail closed", async ({ request }) => {
  expect(
    (
      await request.post("/api/revalidate", {
        data: { event: "entry.publish", model: "project" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (await request.get("/api/preview?secret=invalid&slug=private")).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/media/upload-auth", {
        data: { documentId: "fake" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (await request.post("/api/media/complete", { data: {} })).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/contact", {
        headers: { origin: "https://attacker.test" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/contact", {
        headers: { origin: "http://localhost:3000" },
        data: {},
      })
    ).status(),
  ).toBe(400);
  const ops = await request.get("/operations");
  expect(ops.url()).toContain("/operations/login");
});
test("mobile dialog supports opening, navigating and escaping", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("link", { name: /Work/ }).click();
  await expect(page).toHaveURL("/projects");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("reduced motion remains readable and responsive", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("#process").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /02.*Design/ }).click();
  await expect(page.getByText("Give possibility a shape.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("the final reveal reuses the same WebGL canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 20000 });
  await page.locator(".final-core-slot").scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const a = document
            .querySelector(".core-viewport")!
            .getBoundingClientRect(),
          b = document
            .querySelector(".final-core-slot")!
            .getBoundingClientRect();
        return Math.abs(a.top - b.top) < 3 && Math.abs(a.width - b.width) < 3;
      }),
    )
    .toBe(true);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Send your inquiry" }),
  ).toBeVisible();
});
test("WebGL failure keeps a readable, navigable static alternative", async ({
  page,
}) => {
  await page.addInitScript(
    `const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;return original.call(this,type,...args);};`,
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".sculpture-fallback")).toBeVisible();
  await page.getByRole("link", { name: "Have an idea?", exact: true }).click();
  await expect(page).toHaveURL("/contact");
});
