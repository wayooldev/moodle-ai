"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CampusCredentialsForm } from "@/components/campus-credentials-form";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Primer paso
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--fg)]">
          Conecta tu campus
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Indica la dirección de tu campus y tu token de acceso. Lo guardamos
          cifrado y solo lo usamos para tus cursos, tareas y el asistente.
        </p>
      </motion.div>
      <motion.div
        className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-6 backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <CampusCredentialsForm
          onSuccess={() => {
            router.replace("/dashboard");
            router.refresh();
          }}
        />
      </motion.div>
    </section>
  );
}
