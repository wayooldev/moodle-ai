import { query } from "@moodle-ai/db";
import { decryptSecret } from "./crypto.js";
import { resolveBearerToken } from "./oauth.js";
import { createMoodleClient } from "./moodle.js";

const MCP_API_KEY = process.env.MCP_API_KEY;

/**
 * Auth for MCP routes:
 * - X-Api-Key / ?api_key=  (Cursor / scripts) -> service Moodle token from env
 * - Authorization: Bearer (Alexa+ OAuth) -> per-user Moodle credential from Neon
 *
 * Alexa+ requires 401 WITHOUT WWW-Authenticate header.
 */
export async function requireMcpAuth(req, res, next) {
  try {
    const headerKey = req.get("x-api-key");
    const queryKey =
      typeof req.query.api_key === "string" ? req.query.api_key : undefined;
    const apiKey = headerKey || queryKey;

    if (apiKey && MCP_API_KEY && apiKey === MCP_API_KEY) {
      req.auth = {
        type: "api_key",
        userId: null,
        moodle: createMoodleClient(),
      };
      next();
      return;
    }

    const authHeader = req.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const row = await resolveBearerToken(token);
      if (!row) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Service-level token: tools/list / initialize — use env Moodle token if present
      if (!row.user_id) {
        if (!process.env.MOODLE_TOKEN) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        req.auth = {
          type: "bearer_service",
          userId: null,
          scope: row.scope,
          moodle: createMoodleClient(),
        };
        next();
        return;
      }

      const creds = await query(
        `SELECT moodle_url, wstoken_ciphertext, wstoken_nonce
         FROM moodle_credentials WHERE user_id = $1
         ORDER BY updated_at DESC LIMIT 1`,
        [row.user_id]
      );
      if (!creds.rows[0]) {
        res.status(403).json({
          error: "moodle_not_linked",
          message: "Connect a Moodle wstoken in the Moodle AI web app first",
        });
        return;
      }

      const wstoken = decryptSecret(
        creds.rows[0].wstoken_ciphertext,
        creds.rows[0].wstoken_nonce
      );
      req.auth = {
        type: "bearer_user",
        userId: row.user_id,
        scope: row.scope,
        moodle: createMoodleClient({
          baseUrl: creds.rows[0].moodle_url,
          token: wstoken,
        }),
      };
      next();
      return;
    }

    res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    console.error("auth failed", err);
    res.status(401).json({ error: "Unauthorized" });
  }
}
