import Link from "next/link";

const sitemap = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Campus" },
  { href: "/onboarding", label: "Conectar campus" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/terms", label: "Términos" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl text-[var(--ink)]">Moodle AI</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            El hogar digital de tu campus: cursos, entregas y un asistente que
            entiende tu semestre.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f93a8]">
            Mapa del sitio
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {sitemap.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f93a8]">
            Legal
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/privacy">Política de privacidad</Link>
            </li>
            <li>
              <Link href="/terms">Términos de uso</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-[#8fa0b3] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Wayool. Todos los derechos reservados.</p>
          <p>Hecho para estudiantes y campus Moodle / Open LMS.</p>
        </div>
      </div>
    </footer>
  );
}
