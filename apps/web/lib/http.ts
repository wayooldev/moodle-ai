export async function readJsonBody<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.ok
        ? "Respuesta vacía del servidor"
        : `Error del servidor (${res.status})`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Error del servidor (${res.status})`);
  }
}
