import { describe, expect, it } from "vitest";
import { readJsonBody } from "../apps/web/lib/http";

describe("readJsonBody", () => {
  it("parses JSON bodies", async () => {
    const res = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    await expect(readJsonBody(res)).resolves.toEqual({ ok: true });
  });

  it("rejects empty error responses with a clear message", async () => {
    const res = new Response("", { status: 500 });
    await expect(readJsonBody(res)).rejects.toThrow(/Error del servidor \(500\)/);
  });

  it("rejects non-JSON bodies", async () => {
    const res = new Response("<html>oops</html>", { status: 502 });
    await expect(readJsonBody(res)).rejects.toThrow(/Error del servidor \(502\)/);
  });
});
