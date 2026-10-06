import { describe, expect, it } from "vitest";
import {
  assertSingleFeedbackChannel,
  CREDENTIALS_FEEDBACK_CHANNEL,
} from "../apps/web/lib/feedback";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("credentials feedback channel", () => {
  it("is toast-only by policy", () => {
    expect(CREDENTIALS_FEEDBACK_CHANNEL).toBe("toast");
    expect(assertSingleFeedbackChannel("toast")).toBe("toast");
  });

  it("credentials form does not render inline Alert for errors", () => {
    const source = readFileSync(
      path.resolve("apps/web/components/campus-credentials-form.tsx"),
      "utf8"
    );
    expect(source).not.toMatch(/from "@\/components\/ui\/alert"/);
    expect(source).not.toMatch(/inlineError/);
    expect(source).toMatch(/toast\.error/);
    expect(source).toMatch(/toast\.success/);
  });
});
