"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CampusCredentialsForm } from "@/components/campus-credentials-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsContextValue = {
  openSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moodleUrl, setMoodleUrl] = useState("https://moodle.example.com");
  const [label, setLabel] = useState("Mi campus");
  const [hasToken, setHasToken] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  const openSettings = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/moodle/status")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.moodleUrl) setMoodleUrl(String(data.moodleUrl));
        if (data.label) setLabel(String(data.label));
        setHasToken(Boolean(data.connected || data.hasToken));
        setLoadKey((n) => n + 1);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const ctx = useMemo(() => ({ openSettings }), [openSettings]);

  return (
    <SettingsContext.Provider value={ctx}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="settings-title"
                  className="font-display text-xl text-[var(--fg)]"
                >
                  Ajustes del campus
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Actualiza la URL del campus y tu token de acceso.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <CampusCredentialsForm
                key={loadKey}
                initialUrl={moodleUrl}
                initialLabel={label}
                tokenOptional={hasToken}
                submitLabel="Guardar cambios"
                onSuccess={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      ) : null}
    </SettingsContext.Provider>
  );
}

export function useSettingsDialog() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettingsDialog must be used within SettingsProvider");
  }
  return ctx;
}

/** Legacy topbar trigger (marketing layout). */
export function SettingsDialogButton() {
  const { openSettings } = useSettingsDialog();
  return (
    <Button type="button" variant="ghost" size="sm" onClick={openSettings}>
      Ajustes
    </Button>
  );
}
