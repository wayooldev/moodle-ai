"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { useSettingsDialog } from "@/components/settings-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/courses", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/dashboard/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/dashboard/chat", label: "Asistente", icon: Sparkles },
];

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { openSettings } = useSettingsDialog();

  const displayName =
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Estudiante";
  const imageUrl = user?.imageUrl;

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--deep)] transition-[width] duration-200",
        collapsed ? "w-[4.25rem]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-[var(--border)] px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed ? (
          <Link href="/dashboard" className="font-display text-lg text-[var(--ink)]">
            Moodle AI
          </Link>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--surface-2)] text-[var(--fg)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--surface)]",
                collapsed && "justify-center"
              )}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--accent)]">
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              )}
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--fg)]">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs text-[var(--muted)]">
                    Mi cuenta
                  </span>
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={openSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Ajustes del campus
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">Volver al inicio</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton>
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
