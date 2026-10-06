"use client";

import { useCampusData } from "@/components/dashboard/campus-data-provider";
import { HeaderSkeleton } from "@/components/dashboard/section-skeletons";

export function CampusPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { site, siteState } = useCampusData();

  if (siteState === "loading" && !site) {
    return <HeaderSkeleton />;
  }

  return (
    <header>
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
        Tu campus
      </p>
      <h1 className="font-display mt-1 text-3xl text-[var(--ink)] md:text-4xl">
        {title === "Resumen" ? site?.sitename || title : title}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)] md:text-base">
        {description ||
          (site?.fullname || site?.username
            ? `Conectado como ${site.fullname || site.username}`
            : "Cursos, tareas y calendario de tu campus")}
      </p>
    </header>
  );
}
