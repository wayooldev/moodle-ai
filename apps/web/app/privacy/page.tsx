import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Legal
        </p>
        <h1 className="font-display mt-3 text-4xl text-[var(--ink)]">
          Política de privacidad
        </h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Moodle AI, operado por Wayool, trata tus datos para ofrecerte el
            acceso a tu campus, el panel académico y el asistente.
          </p>
          <p>
            Guardamos de forma cifrada las credenciales que tú proporcionas para
            conectar tu campus. No vendemos tu información académica a terceros.
          </p>
          <p>
            Puedes solicitar la actualización o eliminación de tus datos de
            conexión desde la configuración de tu cuenta o contactando a Wayool.
          </p>
          <p>
            Última actualización: 2026. Esta página es un resumen orientativo;
            puede ampliarse conforme el producto evolucione.
          </p>
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
