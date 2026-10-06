"use client";

import { motion } from "framer-motion";
import { useCampusData } from "@/components/dashboard/campus-data-provider";
import { CampusFilters } from "@/components/dashboard/campus-filters";
import { CampusPageHeader } from "@/components/dashboard/campus-page-header";
import { CourseCard } from "@/components/dashboard/course-card";
import {
  CourseGridSkeleton,
  FiltersSkeleton,
} from "@/components/dashboard/section-skeletons";
import { isSliceLoading, SliceError } from "@/components/dashboard/slice-state";
import { useFilteredCampus } from "@/components/dashboard/use-filtered-campus";

export default function DashboardCoursesPage() {
  const { courses, coursesState, refresh } = useCampusData();
  const {
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    filteredCourses,
  } = useFilteredCampus();

  const filtersReady =
    coursesState === "ready" ||
    coursesState === "error" ||
    courses.length > 0;

  return (
    <div className="space-y-6">
      <CampusPageHeader
        title="Cursos"
        description="Todos tus cursos del campus en un solo lugar."
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

      {coursesState === "error" ? (
        <SliceError
          message="No se pudieron cargar los cursos."
          onRetry={refresh}
        />
      ) : null}

      {isSliceLoading(coursesState, courses.length > 0) &&
      coursesState !== "error" ? (
        <CourseGridSkeleton />
      ) : null}

      {coursesState === "ready" || (coursesState === "loading" && courses.length > 0) ? (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </motion.div>
      ) : null}

      {coursesState === "ready" && filteredCourses.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No hay cursos con estos filtros.
        </p>
      ) : null}
    </div>
  );
}
