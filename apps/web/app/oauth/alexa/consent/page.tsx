"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function ConsentInner() {
  const params = useSearchParams();
  const { user } = useUser();
  const toast = useToast();
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
      toast.success("Redirigiendo…", "Vinculación aprobada");
      const url = new URL(redirectUri);
      url.searchParams.set("code", data.code);
      if (state) url.searchParams.set("state", state);
      window.location.href = url.toString();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
      toast.error(message, "No se pudo vincular");
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-3xl text-[var(--ink)]">
        Vincular asistente de voz
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Se solicita acceso a Moodle AI
        {clientId ? (
          <>
            {" "}
            (<code className="text-[var(--fg)]">{clientId}</code>)
          </>
        ) : null}
        .
      </p>
      <Button
        type="button"
        className="mt-6"
        onClick={approve}
        disabled={busy || !user}
      >
        {busy ? "Vinculando…" : "Aprobar y continuar"}
      </Button>
      {error ? (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      ) : null}
    </section>
  );
}

export default function AlexaConsentPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[var(--muted)]">Cargando…</p>}>
      <ConsentInner />
    </Suspense>
  );
}
