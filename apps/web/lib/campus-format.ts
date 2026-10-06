export function formatCampusWhen(unix: number | null) {
  if (!unix) return "Sin fecha";
  return new Date(unix * 1000).toLocaleString("es", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function courseInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
