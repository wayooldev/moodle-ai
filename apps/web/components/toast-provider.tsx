"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  title?: string;
  message: string;
};

type ToastInput = {
  tone?: ToastTone;
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastContextValue = {
  push: (input: ToastInput) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  success:
    "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]",
  error:
    "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]",
  info: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--fg)]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const tone = input.tone ?? "info";
      setItems((prev) => [
        ...prev,
        {
          id,
          tone,
          title: input.title,
          message: input.message,
        },
      ]);
      const duration = input.durationMs ?? (tone === "error" ? 6000 : 4200);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message, title = "Listo") =>
        push({ tone: "success", title, message }),
      error: (message, title = "Algo salió mal") =>
        push({ tone: "error", title, message }),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {items.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
              toneClass[toast.tone]
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {toast.title ? (
                  <p className="text-sm font-semibold">{toast.title}</p>
                ) : null}
                <p className="text-sm leading-relaxed opacity-95">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
              >
                Cerrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
