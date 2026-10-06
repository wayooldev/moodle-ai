"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatFetch } from "@/lib/chat-errors";
import { cn } from "@/lib/utils";

function ThinkingIndicator() {
  return (
    <div
      className="mr-8 flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted)]"
      aria-live="polite"
      aria-label="El asistente está pensando"
    >
      <Sparkles className="h-3.5 w-3.5 animate-pulse text-[var(--accent)]" />
      <span>Pensando</span>
      <span className="inline-flex gap-0.5">
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </span>
    </div>
  );
}

function ChatError({
  message,
  detail,
}: {
  message: string;
  detail?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Alert tone="error" title="No se pudo responder">
      <p>{message}</p>
      {detail ? (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {open ? "Ocultar detalle" : "Ver detalle técnico"}
          </button>
          {open ? (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-[var(--danger-border)] bg-black/25 p-2 text-[11px] leading-relaxed whitespace-pre-wrap text-[var(--fg)]/90">
              {detail}
            </pre>
          ) : null}
        </div>
      ) : null}
    </Alert>
  );
}

export function CampusChat({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [errorDetail, setErrorDetail] = useState<string | undefined>();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: chatFetch,
      }),
    []
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
    onError: (err) => {
      const detail =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail?: unknown }).detail || "")
          : err.message;
      setErrorDetail(detail || err.message);
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const showThinking =
    status === "submitted" ||
    (status === "streaming" &&
      !messages.some(
        (m) =>
          m.role === "assistant" &&
          m.parts.some((p) => p.type === "text" && p.text.trim())
      ));

  return (
    <div
      className={cn(
        "flex h-full min-h-[420px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]/70",
        className
      )}
    >
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !busy ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <p className="max-w-md text-sm text-[var(--muted)]">
              Prueba con: «¿Qué cursos tengo?», «¿Qué entregas me faltan?» o
              «¿Hay algo en el calendario esta semana?»
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-8 rounded-lg bg-[var(--accent)]/15 px-3 py-2 text-sm"
                : "mr-8 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm"
            }
          >
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {message.role === "user" ? "Tú" : "Asistente"}
            </p>
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                );
              }
              if (part.type.startsWith("tool-")) {
                return (
                  <p
                    key={`${message.id}-${i}`}
                    className="mt-1 text-xs text-[var(--muted)]"
                  >
                    Consultando campus…
                  </p>
                );
              }
              return null;
            })}
          </div>
        ))}

        {showThinking ? <ThinkingIndicator /> : null}

        {error ? (
          <ChatError
            message={error.message}
            detail={errorDetail || error.message}
          />
        ) : null}
      </div>

      <form
        className="flex gap-2 border-t border-[var(--border)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          clearError?.();
          setErrorDetail(undefined);
          sendMessage({ text });
          setInput("");
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="¿Qué cursos tengo esta semana?"
          aria-label="Mensaje al asistente"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !input.trim()}>
          {busy ? "…" : "Enviar"}
        </Button>
      </form>
    </div>
  );
}
