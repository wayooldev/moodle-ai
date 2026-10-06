import { defineConfig, devices } from "@playwright/test";

const hasClerkE2E =
  Boolean(process.env.E2E_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.E2E_CLERK_SECRET_KEY);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: hasClerkE2E
    ? {
        command: "npm run dev:web",
        url: "http://127.0.0.1:3001",
        reuseExistingServer: !process.env.CI,
        env: {
          ...process.env,
          SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || "1",
        },
      }
    : undefined,
});
