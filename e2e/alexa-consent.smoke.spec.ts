import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

/**
 * Alexa linking is not fully stable yet. This smoke only checks the consent
 * page renders for an authenticated user with stub query params.
 * Enable with ALEXA_E2E_SMOKE=1 plus Clerk e2e secrets.
 */
const enabled =
  process.env.ALEXA_E2E_SMOKE === "1" &&
  Boolean(process.env.E2E_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.E2E_CLERK_SECRET_KEY) &&
  Boolean(process.env.E2E_CLERK_USER_USERNAME) &&
  Boolean(process.env.E2E_CLERK_USER_PASSWORD);

test.describe("Alexa consent smoke", () => {
  test.skip(
    !enabled,
    "Deferred until Alexa linking is stable; set ALEXA_E2E_SMOKE=1 and Clerk e2e secrets"
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

  test("consent page renders for signed-in user", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto(
      "/oauth/alexa/consent?client_id=test-client&redirect_uri=https://example.com/cb&state=abc&code_challenge=challenge&code_challenge_method=S256&scope=mcp:tools"
    );
    await expect(page.getByRole("heading", { name: /Vincular Alexa/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Aprobar y volver a Alexa/i })
    ).toBeVisible();
  });
});
