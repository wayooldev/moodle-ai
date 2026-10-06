"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-4.25rem)]">
        <Image
          src="/campus-hero.jpg"
          alt="Patio de un campus universitario al amanecer"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--hero-veil)" }}
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:pb-20 md:justify-center md:pb-24">
          <motion.p
            className="font-display text-5xl text-white sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Moodle AI
          </motion.p>
          <motion.h1
            className="mt-5 max-w-xl text-xl font-medium text-white/92 sm:text-2xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
          >
            Tu semestre, organizado en un solo lugar.
          </motion.h1>
          <motion.p
            className="mt-4 max-w-lg text-base leading-relaxed text-white/75"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            Conecta tu campus, revisa cursos y entregas, y pregunta a un
            asistente que conoce tu agenda académica.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg">Empezar ahora</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-white/5 text-white hover:bg-white/10"
                >
                  Crear cuenta
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--accent)] px-8 text-base font-medium text-[var(--accent-fg)] transition hover:opacity-90"
              >
                Ir a mi campus
              </Link>
            </SignedIn>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Cómo funciona
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-4xl text-[var(--ink)] md:text-5xl">
              Tres pasos para sentir el control del semestre.
            </h2>
          </motion.div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Conecta tu campus",
                body: "Ingresa la dirección de tu Moodle y tu token de acceso. Lo guardamos cifrado solo para ti.",
              },
              {
                step: "02",
                title: "Ve tu panorama",
                body: "Cursos, tareas y calendario en una vista clara, con filtros por materia y fecha.",
              },
              {
                step: "03",
                title: "Pregunta sin fricción",
                body: "El asistente responde sobre tus entregas, horarios y cursos con el contexto de tu cuenta.",
              },
            ].map((item, i) => (
              <motion.li
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <p className="font-display text-5xl text-[var(--accent)]/35">
                  {item.step}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              En tu día a día
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-4xl text-[var(--ink)] md:text-5xl">
              Todo lo que miras en el LMS, más cerca.
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                title: "Panel de cursos",
                body: "Una lista limpia de lo que estás cursando, sin perderte entre menús del campus.",
              },
              {
                title: "Entregas a tiempo",
                body: "Tareas con fechas claras y filtros para ver lo próximo o lo que ya venció.",
              },
              {
                title: "Agenda académica",
                body: "Eventos y recordatorios del calendario de tu campus, en una sola lectura.",
              },
              {
                title: "Asistente del semestre",
                body: "Pregunta en lenguaje natural: qué tienes esta semana, qué falta por entregar, qué curso es cuál.",
              },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <h3 className="font-display text-2xl text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Pensado para estudiar
            </p>
            <h2 className="font-display mt-3 text-4xl text-[var(--ink)] md:text-5xl">
              Menos pestañas. Más claridad.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)]">
              Moodle AI no reemplaza tu campus: lo vuelve legible. Ideal si
              estudias en Moodle u Open LMS y quieres un espacio propio para
              planear la semana.
            </p>
          </motion.div>
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Ejemplo de conversación
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="ml-8 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-[var(--fg)]">
                ¿Qué entregas tengo esta semana?
              </div>
              <div className="mr-6 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-[var(--muted)]">
                Tienes 3 tareas próximas: Ensayo de Historia el jueves, Quiz de
                Álgebra el viernes y el foro de Diseño el domingo.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[var(--deep)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <motion.h2
            className="font-display text-4xl md:text-5xl"
            {...fadeUp}
            transition={{ duration: 0.45 }}
          >
            Listo cuando tu semestre lo esté.
          </motion.h2>
          <motion.p
            className="mx-auto mt-4 max-w-xl text-base text-white/70"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.4 }}
          >
            Crea tu cuenta, conecta el campus y entra a tu panel en minutos.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14, duration: 0.4 }}
          >
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90"
                >
                  Crear cuenta gratis
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  Ya tengo cuenta
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--accent)] px-8 text-base font-medium text-[var(--accent-fg)]"
              >
                Abrir mi campus
              </Link>
            </SignedIn>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
