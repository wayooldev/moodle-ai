"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ConnectionTestDialog({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connection-test-title"
      aria-describedby="connection-test-desc"
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
            aria-hidden
          />
          <h2
            id="connection-test-title"
            className="font-display mt-5 text-xl text-[var(--ink)]"
          >
            Probando conexión
          </h2>
          <p
            id="connection-test-desc"
            className="mt-2 text-sm leading-relaxed text-[var(--muted)]"
          >
            Estamos contactando tu campus. Si tarda demasiado, puedes cancelar
            e intentarlo de nuevo.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={onCancel}
          >
            Cancelar prueba
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
