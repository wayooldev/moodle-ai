import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <section className="hero">
      <h1>Moodle AI</h1>
      <p>
        Conecta tu Open LMS con Cursor (MCP) y Alexa+. Guarda tu{" "}
        <code>wstoken</code> de forma cifrada (BYOK) y vincula tu cuenta Alexa
        con OAuth 2.1.
      </p>
      <SignedOut>
        <p className="muted">Inicia sesión para conectar Moodle y preparar Alexa+.</p>
      </SignedOut>
      <SignedIn>
        <Link className="button" href="/dashboard">
          Ir al dashboard
        </Link>
      </SignedIn>
    </section>
  );
}
