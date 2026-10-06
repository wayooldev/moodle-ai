import { formatCampusWhen } from "@/lib/campus-format";
import type { CampusAssignment } from "@/lib/campus-types";
import { cn } from "@/lib/utils";

export function AssignmentRow({
  assignment,
  courseLabel,
  className,
}: {
  assignment: CampusAssignment;
  courseLabel: string;
  className?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const overdue = Boolean(assignment.duedate && assignment.duedate < now);

  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/35",
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 h-2 w-2 shrink-0 rounded-full",
          overdue ? "bg-[var(--danger)]" : "bg-[var(--success)]"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-medium leading-snug text-[var(--fg)]">
          {assignment.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {courseLabel}
          <span className="mx-1.5 text-[var(--border)]">·</span>
          {formatCampusWhen(assignment.duedate)}
        </p>
        {overdue ? (
          <p className="mt-2 text-xs font-medium text-[var(--danger)]">
            Vencida
          </p>
        ) : null}
      </div>
    </article>
  );
}
