"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionTestDialog } from "@/components/connection-test-dialog";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJsonBody } from "@/lib/http";

const PLACEHOLDER_URL = "https://moodle.example.com";

type Props = {
  initialUrl?: string;
  initialLabel?: string;
  submitLabel?: string;
  /** When true, token may be left blank to keep the saved one. */
  tokenOptional?: boolean;
  onSuccess?: () => void;
};

function isAbortError(err: unknown) {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

export function CampusCredentialsForm({
  initialUrl = PLACEHOLDER_URL,
  initialLabel = "Mi campus",
  submitLabel = "Guardar y conectar",
  tokenOptional = false,
  onSuccess,
}: Props) {
  const toast = useToast();
  const testAbortRef = useRef<AbortController | null>(null);
  const [moodleUrl, setMoodleUrl] = useState(initialUrl);
  const [wstoken, setWstoken] = useState("");
  const [label, setLabel] = useState(initialLabel);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setMoodleUrl(initialUrl);
    setLabel(initialLabel);
  }, [initialUrl, initialLabel]);

  function cancelTest() {
    testAbortRef.current?.abort();
    testAbortRef.current = null;
    setTesting(false);
    toast.push({
      tone: "info",
      title: "Prueba cancelada",
      message: "Detuvimos el intento de conexión.",
      durationMs: 3200,
    });
  }

  async function testConnection() {
    if (testing) return;
    if (!wstoken.trim()) {
      toast.error(
        tokenOptional
          ? "Para probar la conexión escribe el token (no lo mostramos por seguridad)."
          : "Indica el token de acceso para probar la conexión.",
        "Falta el token"
      );
      return;
    }
    setTesting(true);

    const controller = new AbortController();
    testAbortRef.current = controller;

    try {
      const res = await fetch("/api/moodle/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodleUrl, wstoken }),
        signal: controller.signal,
      });
      const data = await readJsonBody<{
        ok?: boolean;
        error?: string;
        site?: { sitename?: string; username?: string };
      }>(res);
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo conectar");
      }
      toast.success(
        `${data.site?.sitename || "Campus"} · ${data.site?.username || "usuario"}`,
        "Conexión OK"
      );
    } catch (err) {
      if (isAbortError(err)) return;
      const message =
        err instanceof Error ? err.message : "Error de conexión";
      toast.error(message, "No se pudo conectar");
    } finally {
      if (testAbortRef.current === controller) {
        testAbortRef.current = null;
      }
      setTesting(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (testing) return;
    if (!wstoken.trim() && !tokenOptional) {
      toast.error(
        "Indica el token de acceso para conectar el campus.",
        "Falta el token"
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/moodle/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodleUrl, wstoken, label }),
      });
      const data = await readJsonBody<{ ok?: boolean; error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar");
      }
      setWstoken("");
      toast.success(
        "Tus datos se guardaron de forma segura.",
        "Campus conectado"
      );
      if (onSuccess) {
        window.setTimeout(() => onSuccess(), 400);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      toast.error(message, "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={onSave}>
        <div className="space-y-2">
          <Label htmlFor="moodleUrl">Moodle URL</Label>
          <Input
            id="moodleUrl"
            value={moodleUrl}
            onChange={(e) => setMoodleUrl(e.target.value)}
            placeholder={PLACEHOLDER_URL}
            required
            disabled={testing || saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Etiqueta</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={testing || saving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessToken">Token de acceso</Label>
          <Input
            id="accessToken"
            type="password"
            value={wstoken}
            onChange={(e) => setWstoken(e.target.value)}
            required={!tokenOptional}
            autoComplete="off"
            placeholder={tokenOptional ? "•••••••• (guardado)" : undefined}
            disabled={testing || saving}
          />
          <p className="text-xs text-[var(--muted)]">
            {tokenOptional
              ? "Por seguridad no mostramos el token guardado. Déjalo vacío para conservarlo, o escribe uno nuevo para reemplazarlo."
              : "Usa el token de servicios web de tu campus (no la contraseña de inicio de sesión)."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={testing || saving}
            onClick={testConnection}
          >
            {testing ? "Probando…" : "Probar conexión"}
          </Button>
          <Button type="submit" disabled={testing || saving}>
            {saving ? "Guardando…" : submitLabel}
          </Button>
        </div>
      </form>

      <ConnectionTestDialog open={testing} onCancel={cancelTest} />
    </>
  );
}
