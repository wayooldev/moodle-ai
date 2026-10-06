import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertTone = "success" | "error" | "info";

const toneClass: Record<AlertTone, string> = {
  success:
    "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]",
  error:
    "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]",
  info: "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm leading-relaxed",
        toneClass[tone],
        className
      )}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      <div className={title ? "mt-0.5 opacity-95" : undefined}>{children}</div>
    </div>
  );
}
