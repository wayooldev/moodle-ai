"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ConsentInner() {
  const params = useSearchParams();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const clientId = params.get("client_id") || "";
  const redirectUri = params.get("redirect_uri") || "";
  const state = params.get("state") || "";
  const codeChallenge = params.get("code_challenge") || "";
  const codeChallengeMethod = params.get("code_challenge_method") || "S256";
  const scope = params.get("scope") || "mcp:tools mcp:resources";
  const resource = params.get("resource") || "";

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      const viaApi = await fetch("/api/oauth/create-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
          scope,
          resource,
        }),
      });
      const data = await viaApi.json();
      if (!viaApi.ok) {
        throw new Error(data.error || "No se pudo crear el authorization code");
      }
      const url = new URL(redirectUri);
      url.searchParams.set("code", data.code);
      if (state) url.searchParams.set("state", state);
      window.location.href = url.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h1>Vincular Alexa+</h1>
      <p className="muted">
        Alexa solicita acceso a Moodle AI (<code>{clientId || "…"}</code>) con
        scopes <code>{scope}</code>.
      </p>
      <button type="button" onClick={approve} disabled={busy || !user}>
        {busy ? "Vinculando…" : "Aprobar y volver a Alexa"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}

export default function AlexaConsentPage() {
  return (
    <Suspense fallback={<p>Cargando…</p>}>
      <ConsentInner />
    </Suspense>
  );
}
