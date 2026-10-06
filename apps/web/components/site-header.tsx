"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { SettingsDialogButton } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        Moodle AI
      </Link>
      <nav>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Crear cuenta</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            Campus
          </Link>
          <SettingsDialogButton />
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
