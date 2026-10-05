import { query } from "@moodle-ai/db";
import { randomToken, sha256Hex, verifyPkceS256 } from "./crypto.js";

function publicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
}

function webAppUrl() {
  return (process.env.WEB_APP_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
}

function mcpResourceUri() {
  return `${publicBaseUrl()}/mcp`;
}

export function authorizationServerMetadata() {
  const issuer = publicBaseUrl();
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: [
      "client_credentials",
      "authorization_code",
      "refresh_token",
    ],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["mcp:service", "mcp:tools", "mcp:resources"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
  };
}

export function protectedResourceMetadata() {
  const resource = mcpResourceUri();
  return {
    resource,
    authorization_servers: [publicBaseUrl()],
    scopes_supported: ["mcp:service", "mcp:tools", "mcp:resources"],
    bearer_methods_supported: ["header"],
  };
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx < 0) return null;
  return {
    clientId: decoded.slice(0, idx),
    clientSecret: decoded.slice(idx + 1),
  };
}

async function authenticateClient(req, body) {
  const basic = parseBasicAuth(req.get("authorization"));
  const clientId = basic?.clientId || body.client_id;
  const clientSecret = basic?.clientSecret || body.client_secret;
  if (!clientId || !clientSecret) {
    return { error: "invalid_client", status: 401 };
  }
  const { rows } = await query(
    `SELECT client_id, client_secret_hash, redirect_uris FROM oauth_clients WHERE client_id = $1`,
    [clientId]
  );
  if (!rows[0] || sha256Hex(clientSecret) !== rows[0].client_secret_hash) {
    return { error: "invalid_client", status: 401 };
  }
  return { client: rows[0] };
}

async function issueAccessToken({ clientId, userId, scope, resource, grantType, expiresIn }) {
  const accessToken = randomToken(32);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await query(
    `INSERT INTO oauth_access_tokens (token_hash, client_id, user_id, scope, resource, grant_type, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sha256Hex(accessToken), clientId, userId, scope, resource || null, grantType, expiresAt]
  );
  return { accessToken, expiresIn, expiresAt };
}

async function issueRefreshToken({ clientId, userId, scope, resource }) {
  const refreshToken = randomToken(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await query(
    `INSERT INTO oauth_refresh_tokens (token_hash, client_id, user_id, scope, resource, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [sha256Hex(refreshToken), clientId, userId, scope, resource || null, expiresAt]
  );
  return refreshToken;
}

export function mountOauthRoutes(app) {
  app.get("/.well-known/oauth-authorization-server", (_req, res) => {
    res.json(authorizationServerMetadata());
  });

  app.get("/.well-known/oauth-protected-resource", (_req, res) => {
    res.json(protectedResourceMetadata());
  });

  app.get("/.well-known/oauth-protected-resource/mcp", (_req, res) => {
    res.json(protectedResourceMetadata());
  });

  // Alexa starts here; we bounce to the web app (Clerk) for login + consent.
  app.get("/oauth/authorize", (req, res) => {
    const params = new URLSearchParams();
    for (const key of [
      "response_type",
      "client_id",
      "redirect_uri",
      "scope",
      "state",
      "code_challenge",
      "code_challenge_method",
      "resource",
    ]) {
      if (typeof req.query[key] === "string") params.set(key, req.query[key]);
    }
    res.redirect(302, `${webAppUrl()}/oauth/alexa/consent?${params.toString()}`);
  });

  // Called by the web app after Clerk login + user consent.
  app.post("/oauth/internal/create-code", async (req, res) => {
    try {
      const internalKey = process.env.INTERNAL_API_KEY || process.env.MCP_API_KEY;
      if (!internalKey || req.get("x-internal-key") !== internalKey) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const {
        client_id,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        scope,
        resource,
        clerk_user_id,
        email,
      } = req.body || {};

      if (
        !client_id ||
        !redirect_uri ||
        !code_challenge ||
        code_challenge_method !== "S256" ||
        !clerk_user_id
      ) {
        res.status(400).json({ error: "invalid_request" });
        return;
      }

      const client = await query(
        `SELECT client_id, redirect_uris FROM oauth_clients WHERE client_id = $1`,
        [client_id]
      );
      if (!client.rows[0]) {
        res.status(400).json({ error: "invalid_client" });
        return;
      }
      if (!client.rows[0].redirect_uris.includes(redirect_uri)) {
        res.status(400).json({ error: "invalid_request", error_description: "redirect_uri mismatch" });
        return;
      }

      let user = await query(`SELECT id FROM users WHERE clerk_user_id = $1`, [clerk_user_id]);
      if (!user.rows[0]) {
        user = await query(
          `INSERT INTO users (clerk_user_id, email) VALUES ($1, $2) RETURNING id`,
          [clerk_user_id, email || null]
        );
      }

      const code = randomToken(24);
      const scopes = scope || "mcp:tools mcp:resources";
      await query(
        `INSERT INTO oauth_authorization_codes
          (code, client_id, user_id, redirect_uri, code_challenge, code_challenge_method, scope, resource, expires_at)
         VALUES ($1,$2,$3,$4,$5,'S256',$6,$7, now() + interval '10 minutes')`,
        [
          code,
          client_id,
          user.rows[0].id,
          redirect_uri,
          code_challenge,
          scopes,
          resource || mcpResourceUri(),
        ]
      );

      res.json({ code });
    } catch (err) {
      console.error("create-code failed", err);
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/oauth/token", async (req, res) => {
    try {
      const body = req.body || {};
      const auth = await authenticateClient(req, body);
      if (auth.error) {
        res.status(auth.status).json({ error: auth.error });
        return;
      }
      const client = auth.client;
      const grantType = body.grant_type;

      if (grantType === "client_credentials") {
        const scope = body.scope || "mcp:service";
        if (scope.split(/\s+/).some((s) => s !== "mcp:service")) {
          res.status(400).json({ error: "invalid_scope" });
          return;
        }
        const resource = body.resource || mcpResourceUri();
        if (resource !== mcpResourceUri()) {
          res.status(403).json({ error: "access_denied" });
          return;
        }
        const issued = await issueAccessToken({
          clientId: client.client_id,
          userId: null,
          scope: "mcp:service",
          resource,
          grantType: "client_credentials",
          expiresIn: 3600,
        });
        res.json({
          access_token: issued.accessToken,
          token_type: "Bearer",
          expires_in: issued.expiresIn,
          scope: "mcp:service",
        });
        return;
      }

      if (grantType === "authorization_code") {
        const { code, redirect_uri, code_verifier, resource } = body;
        if (!code || !redirect_uri || !code_verifier) {
          res.status(400).json({ error: "invalid_request" });
          return;
        }
        const { rows } = await query(
          `SELECT * FROM oauth_authorization_codes WHERE code = $1`,
          [code]
        );
        const row = rows[0];
        if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }
        if (row.client_id !== client.client_id || row.redirect_uri !== redirect_uri) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }
        if (!verifyPkceS256(code_verifier, row.code_challenge)) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }
        const expectedResource = row.resource || mcpResourceUri();
        if (resource && resource !== expectedResource) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }

        await query(`UPDATE oauth_authorization_codes SET used_at = now() WHERE code = $1`, [
          code,
        ]);

        const issued = await issueAccessToken({
          clientId: client.client_id,
          userId: row.user_id,
          scope: row.scope,
          resource: expectedResource,
          grantType: "authorization_code",
          expiresIn: 3600,
        });
        const refresh = await issueRefreshToken({
          clientId: client.client_id,
          userId: row.user_id,
          scope: row.scope,
          resource: expectedResource,
        });

        res.json({
          access_token: issued.accessToken,
          token_type: "Bearer",
          expires_in: issued.expiresIn,
          refresh_token: refresh,
          scope: row.scope,
        });
        return;
      }

      if (grantType === "refresh_token") {
        const { refresh_token, resource } = body;
        if (!refresh_token) {
          res.status(400).json({ error: "invalid_request" });
          return;
        }
        const { rows } = await query(
          `SELECT * FROM oauth_refresh_tokens WHERE token_hash = $1`,
          [sha256Hex(refresh_token)]
        );
        const row = rows[0];
        if (
          !row ||
          row.revoked_at ||
          row.client_id !== client.client_id ||
          new Date(row.expires_at) < new Date()
        ) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }
        const expectedResource = row.resource || mcpResourceUri();
        if (resource && resource !== expectedResource) {
          res.status(400).json({ error: "invalid_grant" });
          return;
        }
        const issued = await issueAccessToken({
          clientId: client.client_id,
          userId: row.user_id,
          scope: row.scope,
          resource: expectedResource,
          grantType: "refresh_token",
          expiresIn: 3600,
        });
        res.json({
          access_token: issued.accessToken,
          token_type: "Bearer",
          expires_in: issued.expiresIn,
          scope: row.scope,
        });
        return;
      }

      res.status(400).json({ error: "unsupported_grant_type" });
    } catch (err) {
      console.error("token endpoint failed", err);
      res.status(500).json({ error: "server_error" });
    }
  });
}

export async function resolveBearerToken(accessToken) {
  const { rows } = await query(
    `SELECT token_hash, client_id, user_id, scope, resource, grant_type, expires_at
     FROM oauth_access_tokens WHERE token_hash = $1`,
    [sha256Hex(accessToken)]
  );
  const row = rows[0];
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return row;
}
