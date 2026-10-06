import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

const hasClerk = Boolean(
  process.env.E2E_CLERK_PUBLISHABLE_KEY &&
    process.env.E2E_CLERK_SECRET_KEY &&
    process.env.E2E_CLERK_USER_USERNAME &&
    process.env.E2E_CLERK_USER_PASSWORD
);

test.describe("authenticated campus flows", () => {
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

  test("signed-in user without campus is sent to onboarding", async ({
    page,
  }) => {
    await page.route("**/api/moodle/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ connected: false }),
      });
    });

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(
      page.getByRole("heading", { name: /Conecta tu campus/i })
    ).toBeVisible();
  });

  test("signed-in user can save wstoken from onboarding with stubbed API", async ({
    page,
  }) => {
    await page.route("**/api/moodle/credentials", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.route("**/api/moodle/test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          site: { sitename: "Demo", username: "student" },
        }),
      });
    });

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/onboarding");
    await page.getByLabel("Moodle URL").fill("https://moodle.example.com");
    await page.getByLabel("Token de acceso").fill("test-wstoken-value");
    await page.getByRole("button", { name: /Guardar y conectar/i }).click();
    await expect(page.getByText("Campus conectado")).toBeVisible();
    await expect(page.getByLabel("Token de acceso")).toHaveValue("");
  });

  test("save error appears once via toast (not duplicated inline)", async ({
    page,
  }) => {
    const errorMessage = "No se pudo guardar la conexión del campus";
    await page.route("**/api/moodle/credentials", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: errorMessage }),
      });
    });

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/onboarding");
    await page.getByLabel("Moodle URL").fill("https://moodle.example.com");
    await page.getByLabel("Token de acceso").fill("test-wstoken-value");
    await page.getByRole("button", { name: /Guardar y conectar/i }).click();

    const errorNodes = page.getByText(errorMessage);
    await expect(errorNodes).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(1);
    await expect(page.getByRole("alert")).toContainText(errorMessage);
  });

  test("empty credentials API body still surfaces a single error toast", async ({
    page,
  }) => {
    await page.route("**/api/moodle/credentials", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "",
      });
    });

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/onboarding");
    await page.getByLabel("Moodle URL").fill("https://moodle.example.com");
    await page.getByLabel("Token de acceso").fill("test-wstoken-value");
    await page.getByRole("button", { name: /Guardar y conectar/i }).click();

    const errorNodes = page.getByText(/Error del servidor \(500\)/i);
    await expect(errorNodes).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(1);
  });
});
