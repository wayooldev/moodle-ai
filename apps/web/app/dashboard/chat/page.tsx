"use client";

import { Sparkles } from "lucide-react";
import { CampusChat } from "@/components/campus-chat";

export default function DashboardChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[820px] flex-col gap-4">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h1 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
            Asistente
          </h1>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Pregunta por cursos, entregas y tu agenda.
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <CampusChat className="h-full min-h-0" />
      </div>
    </div>
  );
}
