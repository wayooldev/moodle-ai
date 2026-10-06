"use client";

import { motion } from "framer-motion";
import { useCampusData } from "@/components/dashboard/campus-data-provider";
import { CalendarEventRow } from "@/components/dashboard/calendar-event-row";
import { CampusFilters } from "@/components/dashboard/campus-filters";
import { CampusPageHeader } from "@/components/dashboard/campus-page-header";
import {
  FiltersSkeleton,
  ListSkeleton,
} from "@/components/dashboard/section-skeletons";
import { isSliceLoading, SliceError } from "@/components/dashboard/slice-state";
import { useFilteredCampus } from "@/components/dashboard/use-filtered-campus";
import { Alert } from "@/components/ui/alert";

export default function DashboardCalendarPage() {
  const {
    courses,
    events,
    eventsState,
    eventsError,
    eventsSource,
    courseName,
    refresh,
  } = useCampusData();
  const {
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    filteredEvents,
  } = useFilteredCampus();

  const filtersReady =
    eventsState === "ready" ||
    eventsState === "error" ||
    events.length > 0;

  return (
    <div className="space-y-6">
      <CampusPageHeader
        title="Calendario"
        description="Eventos y fechas importantes de tu campus."
      />

      {filtersReady ? (
        <CampusFilters
          courses={courses}
          courseFilter={courseFilter}
          onCourseFilter={setCourseFilter}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          query={query}
          onQuery={setQuery}
          showStatusFilter={false}
        />
      ) : (
        <FiltersSkeleton />
      )}

      {eventsState === "error" ? (
        <SliceError
          message={eventsError || "No se pudo cargar el calendario."}
          onRetry={refresh}
        />
      ) : null}

      {isSliceLoading(eventsState, events.length > 0) &&
      eventsState !== "error" ? (
        <ListSkeleton rows={5} />
      ) : null}

      {(eventsState === "ready" ||
        (eventsState === "loading" && filteredEvents.length > 0)) &&
      filteredEvents.length > 0 ? (
        <motion.ul
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredEvents.map((e) => (
            <li key={`${e.id}-${e.timestart}`}>
              <CalendarEventRow
                event={e}
                courseLabel={courseName(e.courseid)}
              />
            </li>
          ))}
        </motion.ul>
      ) : null}

      {eventsState === "ready" && filteredEvents.length === 0 ? (
        <Alert tone="info">
          {events.length === 0 ? (
            <>
              No hay eventos en el rango (aprox. última semana + 60 días), o el
              sitio no expone las APIs de calendario al token (
              <code className="text-xs">core_calendar_*</code>
              ).
              {eventsSource === "fallback_empty" ? (
                <span className="mt-1 block text-[var(--muted)]">
                  El campus respondió sin datos de calendario.
                </span>
              ) : null}
              {eventsError ? (
                <span className="mt-1 block text-xs opacity-80">{eventsError}</span>
              ) : null}
            </>
          ) : (
            <>
              Hay {events.length} evento{events.length === 1 ? "" : "s"}, pero
              ninguno coincide con los filtros. Limpia curso o búsqueda.
            </>
          )}
        </Alert>
      ) : null}
    </div>
  );
}
