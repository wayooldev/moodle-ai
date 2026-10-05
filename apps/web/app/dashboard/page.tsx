"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [moodleUrl, setMoodleUrl] = useState("https://ict.myopenlms.net");
  const [wstoken, setWstoken] = useState("");
  const [label, setLabel] = useState("Open LMS");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch("/api/moodle/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodleUrl, wstoken, label }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar");
      }
      setWstoken("");
      setStatus("Credencial Moodle guardada (cifrada).");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        BYOK: pega el <code>wstoken</code> de Moodle (admin / Security keys /
        app). No uses la cookie de sesión web.
      </p>
      <form className="card" onSubmit={onSave}>
        <label htmlFor="moodleUrl">Moodle URL</label>
        <input
          id="moodleUrl"
          value={moodleUrl}
          onChange={(e) => setMoodleUrl(e.target.value)}
          required
        />
        <label htmlFor="label">Etiqueta</label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <label htmlFor="wstoken">wstoken</label>
        <input
          id="wstoken"
          type="password"
          value={wstoken}
          onChange={(e) => setWstoken(e.target.value)}
          required
          autoComplete="off"
        />
        <button type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cifrado"}
        </button>
        {status ? <p>{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </form>
      <div className="card">
        <h2>Alexa+</h2>
        <p className="muted">
          El linking usa OAuth 2.1 en el MCP (
          <code>/oauth/authorize</code> → esta app →{" "}
          <code>/oauth/token</code>). Completa el onboarding con{" "}
          <code>alexa-ai</code> CLI apuntando a tu MCP público.
        </p>
      </div>
    </section>
  );
}
