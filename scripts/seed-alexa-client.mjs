#!/usr/bin/env node
/**
 * Seed the Alexa+ OAuth client into Neon.
 * Usage:
 *   DATABASE_URL=... node scripts/seed-alexa-client.mjs <client_id> <client_secret> [redirect_uri...]
 */
import { createHash } from "node:crypto";
import pg from "pg";

const [clientId, clientSecret, ...redirectUris] = process.argv.slice(2);
if (!process.env.DATABASE_URL || !clientId || !clientSecret) {
  console.error(
    "Usage: DATABASE_URL=... node scripts/seed-alexa-client.mjs <client_id> <client_secret> [redirect_uri...]"
  );
  process.exit(1);
}

const uris =
  redirectUris.length > 0
    ? redirectUris
    : ["https://alexa.amazon.com/api/skill/link/PLACEHOLDER"];

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const hash = createHash("sha256").update(clientSecret).digest("hex");
await pool.query(
  `INSERT INTO oauth_clients (client_id, client_secret_hash, name, redirect_uris)
   VALUES ($1, $2, $3, $4)
   ON CONFLICT (client_id) DO UPDATE
     SET client_secret_hash = EXCLUDED.client_secret_hash,
         redirect_uris = EXCLUDED.redirect_uris`,
  [clientId, hash, "Alexa+", uris]
);
console.log("Seeded oauth client", clientId, "redirect_uris=", uris);
await pool.end();
