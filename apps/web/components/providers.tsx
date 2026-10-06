"use client";

import { SettingsProvider } from "@/components/settings-dialog";
import { ToastProvider } from "@/components/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </ToastProvider>
  );
}
