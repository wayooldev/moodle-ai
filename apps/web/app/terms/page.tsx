import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl text-[var(--ink)]">
          Términos de uso
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Al usar Moodle AI aceptas utilizar el servicio de forma responsable
            y únicamente con credenciales de campus a las que tengas derecho a
            acceder.
          </p>
          <p>
            El servicio depende de la disponibilidad de tu campus institucional.
            Wayool no garantiza el contenido publicado por tu institución ni
            sustituye las políticas académicas oficiales.
          </p>
          <p>
            Nos reservamos el derecho de suspender cuentas que abusen del
            servicio o intenten comprometer la seguridad de otros usuarios.
          </p>
          <p>© 2026 Wayool. Todos los derechos reservados.</p>
        </div>
        <Link
          href="/"
          className="mt-10 inline-block text-sm font-medium text-[var(--accent)]"
        >
          Volver al inicio
        </Link>
      </article>
      <SiteFooter />
    </>
  );
}
