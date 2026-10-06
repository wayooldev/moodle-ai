"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCampusData } from "@/components/dashboard/campus-data-provider";
import { CampusPageHeader } from "@/components/dashboard/campus-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LoadSlice } from "@/lib/campus-types";

function StatCard({
  label,
  value,
  href,
  state,
}: {
  label: string;
  value: number;
  href: string;
  state: LoadSlice;
}) {
  if (state === "loading" || state === "idle") {
    return <Skeleton className="h-24 rounded-xl" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
        className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]/40"
      >
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {label}
        </p>
        <p className="font-display mt-2 text-3xl text-[var(--ink)]">
          {state === "error" ? "—" : value}
        </p>
        {state === "error" ? (
          <p className="mt-1 text-xs text-[var(--danger)]">Error al cargar</p>
        ) : null}
      </Link>
    </motion.div>
  );
}

export default function DashboardOverviewPage() {
  const {
    courses,
    coursesState,
    assignments,
    assignmentsState,
    events,
    eventsState,
  } = useCampusData();

  return (
    <div className="space-y-8">
      <CampusPageHeader title="Resumen" />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Cursos"
          value={courses.length}
          href="/dashboard/courses"
          state={coursesState}
        />
        <StatCard
          label="Tareas"
          value={assignments.length}
          href="/dashboard/tasks"
          state={assignmentsState}
        />
        <StatCard
          label="Eventos"
          value={events.length}
          href="/dashboard/calendar"
          state={eventsState}
        />
      </div>

      <motion.section
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <h2 className="font-display text-xl text-[var(--ink)]">
          ¿Qué quieres hacer?
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Explora cada sección desde el menú lateral o entra directo al asistente.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/courses"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Ver cursos
          </Link>
          <Link href="/dashboard/chat" className={cn(buttonVariants())}>
            Abrir asistente
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
