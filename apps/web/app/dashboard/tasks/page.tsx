"use client";

import { motion } from "framer-motion";
import { useCampusData } from "@/components/dashboard/campus-data-provider";
import { AssignmentRow } from "@/components/dashboard/assignment-row";
import { CampusFilters } from "@/components/dashboard/campus-filters";
import { CampusPageHeader } from "@/components/dashboard/campus-page-header";
import {
  FiltersSkeleton,
  ListSkeleton,
} from "@/components/dashboard/section-skeletons";
import { isSliceLoading, SliceError } from "@/components/dashboard/slice-state";
import { useFilteredCampus } from "@/components/dashboard/use-filtered-campus";
import { Alert } from "@/components/ui/alert";

export default function DashboardTasksPage() {
  const {
    courses,
    assignments,
    assignmentsState,
    assignmentsError,
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
    filteredAssignments,
  } = useFilteredCampus();

  const filtersReady =
    assignmentsState === "ready" ||
    assignmentsState === "error" ||
    assignments.length > 0;

  return (
    <div className="space-y-6">
      <CampusPageHeader
        title="Tareas"
        description="Entregas y actividades filtradas por curso y estado."
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
        />
      ) : (
        <FiltersSkeleton />
      )}

      {assignmentsState === "error" ? (
        <SliceError
          message={
            assignmentsError ||
            "No se pudieron cargar las tareas. Tu token puede no tener permiso para mod_assign_get_assignments."
          }
          onRetry={refresh}
        />
      ) : null}

      {isSliceLoading(assignmentsState, assignments.length > 0) &&
      assignmentsState !== "error" ? (
        <ListSkeleton rows={6} />
      ) : null}

      {(assignmentsState === "ready" ||
        (assignmentsState === "loading" && filteredAssignments.length > 0)) &&
      filteredAssignments.length > 0 ? (
        <motion.ul
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredAssignments.map((a) => (
            <li key={a.id}>
              <AssignmentRow
                assignment={a}
                courseLabel={courseName(a.courseid)}
              />
            </li>
          ))}
        </motion.ul>
      ) : null}

      {assignmentsState === "ready" && filteredAssignments.length === 0 ? (
        <Alert tone="info">
          {assignments.length === 0 ? (
            <>
              El campus no devolvió tareas. Suele pasar si no hay actividades de
              tipo «Tarea» en tus cursos, o si el token de servicios web no incluye
              la función <code className="text-xs">mod_assign_get_assignments</code>
              .
            </>
          ) : (
            <>
              Hay {assignments.length} tarea
              {assignments.length === 1 ? "" : "s"} en total, pero ninguna coincide
              con los filtros actuales. Prueba «Todas» en estado o limpia la
              búsqueda.
            </>
          )}
        </Alert>
      ) : null}
    </div>
  );
}
