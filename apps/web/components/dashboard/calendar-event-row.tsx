import { CalendarDays } from "lucide-react";
import { formatCampusWhen } from "@/lib/campus-format";
import type { CampusCalendarEvent } from "@/lib/campus-types";
import { cn } from "@/lib/utils";

export function CalendarEventRow({
  event,
  courseLabel,
  className,
}: {
  event: CampusCalendarEvent;
  courseLabel: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/35",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
        <CalendarDays className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium leading-snug text-[var(--fg)]">{event.name}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {courseLabel}
          <span className="mx-1.5 text-[var(--border)]">·</span>
          {formatCampusWhen(event.timestart)}
        </p>
      </div>
    </article>
  );
}
