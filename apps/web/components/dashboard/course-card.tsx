import { courseInitials } from "@/lib/campus-format";
import type { CampusCourse } from "@/lib/campus-types";
import { cn } from "@/lib/utils";

export function CourseCard({
  course,
  className,
}: {
  course: CampusCourse;
  className?: string;
}) {
  const initials = courseInitials(course.fullname);
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]/45 hover:bg-[var(--surface-2)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent)]/10 blur-2xl transition group-hover:bg-[var(--accent)]/20"
      />
      <div className="relative flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] font-display text-sm text-[var(--accent)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium leading-snug text-[var(--fg)]">
            {course.fullname}
          </h3>
          {course.shortname ? (
            <p className="mt-1 inline-flex rounded-md border border-[var(--border)] bg-[var(--bg)]/40 px-2 py-0.5 text-xs text-[var(--muted)]">
              {course.shortname}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
