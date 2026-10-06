"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-[calc(100vh)] min-h-[calc(100vh)] bg-[var(--bg)]">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
