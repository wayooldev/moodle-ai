"use client";

import { CampusDataProvider } from "@/components/dashboard/campus-data-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CampusDataProvider>
      <DashboardShell>{children}</DashboardShell>
    </CampusDataProvider>
  );
}
