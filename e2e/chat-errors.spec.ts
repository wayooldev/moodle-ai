import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

const hasClerk = Boolean(
  process.env.E2E_CLERK_PUBLISHABLE_KEY &&
    process.env.E2E_CLERK_SECRET_KEY &&
    process.env.E2E_CLERK_USER_USERNAME &&
    process.env.E2E_CLERK_USER_PASSWORD
);

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
}

test.describe("chat error UX", () => {
  test.skip(
    !hasClerk,
    "Requires E2E_CLERK_* keys and E2E_CLERK_USER_USERNAME/PASSWORD"
  );

  test.beforeAll(async () => {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.E2E_CLERK_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
      process.env.E2E_CLERK_PUBLISHABLE_KEY;
    process.env.CLERK_SECRET_KEY = process.env.E2E_CLERK_SECRET_KEY;
    await clerkSetup({
      publishableKey: process.env.E2E_CLERK_PUBLISHABLE_KEY!,
    });
  });

  test("signed-in visit to / leaves the marketing landing", async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/$/);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test("chat shows Spanish error + technical detail when /api/chat fails", async ({
    page,
  }, testInfo) => {
    // Soft-gate: layout may send users without DB campus creds to onboarding.
    await page.route("**/api/moodle/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          connected: true,
          moodleUrl: "https://moodle.example.com",
          label: "Demo",
          hasToken: true,
        }),
      });
    });
    await page.route("**/api/moodle/site", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sitename: "Demo Campus",
          fullname: "Estudiante Demo",
          username: "demo",
        }),
      });
    });
    await page.route("**/api/moodle/courses", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ courses: [] }),
      });
    });
    await page.route("**/api/moodle/assignments", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ assignments: [] }),
      });
    });
    await page.route("**/api/moodle/calendar", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ events: [], source: "e2e" }),
      });
    });

    const technical =
      "This model models/gemini-2.0-flash is no longer available. Please update your code.";
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: technical }),
      });
    });

    await signIn(page);
    await page.goto("/dashboard/chat");

    // Without real campus credentials in DB the layout redirects to onboarding.
    if (page.url().includes("/onboarding")) {
      testInfo.skip(
        true,
        "E2E user has no campus credentials in DB; unit tests cover chat error mapping"
      );
      return;
    }

    await expect(
      page.getByRole("heading", { name: /^Asistente$/i })
    ).toBeVisible();

    const input = page.getByLabel("Mensaje al asistente");
    await input.fill("¿Qué cursos tengo?");
    await page.getByRole("button", { name: /^Enviar$/i }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/modelo de IA|no está disponible|completar/i);
    await expect(alert).not.toContainText("An error occurred");

    await page.getByRole("button", { name: /Ver detalle técnico/i }).click();
    await expect(page.locator("pre")).toContainText(/gemini-2\.0-flash|no longer available/i);
  });
});
