import { test, expect } from "@playwright/test";

const hasClerk = Boolean(
  process.env.E2E_CLERK_PUBLISHABLE_KEY && process.env.E2E_CLERK_SECRET_KEY
);

test.describe("dashboard access", () => {
  test.skip(!hasClerk, "Requires E2E_CLERK_PUBLISHABLE_KEY and E2E_CLERK_SECRET_KEY");

  test("unauthenticated visitor is redirected away from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });
});
