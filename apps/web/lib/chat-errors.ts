/** Map API/chat failures to a Spanish user-facing message + technical detail. */

export function friendlyChatError(
  status: number | undefined,
  technical: string
): { message: string; detail: string } {
  const detail = technical.trim() || "Sin detalle técnico";
  const lower = detail.toLowerCase();

  if (status === 401 || /unauthorized/i.test(detail)) {
    return {
      message: "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.",
      detail,
    };
  }
  if (/no longer available|is not found for api version|models\/gemini-2\./i.test(detail)) {
    return {
      message:
        "El modelo de IA configurado ya no está disponible. Actualiza GEMINI_MODEL o contacta al administrador.",
      detail,
    };
  }
  if (status === 404 || /campus not connected/i.test(detail)) {
    return {
      message:
        "Aún no hay un campus conectado. Abre Ajustes y guarda la URL y el token.",
      detail,
    };
  }
  if (status === 429 || /quota|rate/i.test(lower)) {
    return {
      message:
        "Hay demasiadas solicitudes ahora. Espera un momento e inténtalo otra vez.",
      detail,
    };
  }
  if (
    status === 503 ||
    /GOOGLE_GENERATIVE_AI_API_KEY|not configured/i.test(detail)
  ) {
    return {
      message:
        "El asistente no está configurado en este entorno. Revisa la clave del modelo con el administrador.",
      detail,
    };
  }
  if (status === 400 || /security policy|rejected/i.test(lower)) {
    return {
      message:
        "No pude procesar ese mensaje. Pregunta por tus cursos o entregas sin intentar cambiar las reglas del asistente.",
      detail,
    };
  }
  if (/fetch failed|network|failed to fetch/i.test(lower)) {
    return {
      message: "No hay conexión con el servidor. Comprueba tu red e inténtalo de nuevo.",
      detail,
    };
  }

  return {
    message:
      "No pude completar la respuesta. Puedes reintentar en un momento; si sigue fallando, revisa el detalle técnico.",
    detail,
  };
}

export async function chatFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (err) {
    const technical =
      err instanceof Error ? err.message : "Error de red desconocido";
    const { message, detail } = friendlyChatError(undefined, technical);
    throw Object.assign(new Error(message), { detail });
  }

  if (!res.ok) {
    let technical = `HTTP ${res.status}`;
    try {
      const text = await res.clone().text();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { error?: string };
          technical = parsed.error || text;
        } catch {
          technical = text;
        }
      }
    } catch {
      /* keep status */
    }
    const { message, detail } = friendlyChatError(res.status, technical);
    throw Object.assign(new Error(message), { detail });
  }

  return res;
}
