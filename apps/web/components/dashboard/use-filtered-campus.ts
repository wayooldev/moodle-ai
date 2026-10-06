"use client";

import { useMemo, useState } from "react";
import { useCampusData } from "@/components/dashboard/campus-data-provider";
import type { TaskStatusFilter } from "@/components/dashboard/campus-filters";

export function useFilteredCampus() {
  const { courses, assignments, events, courseName } = useCampusData();
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [query, setQuery] = useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (courseFilter !== "all" && String(c.id) !== courseFilter) return false;
      if (query) {
        const hay = `${c.fullname} ${c.shortname}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [courses, courseFilter, query]);

  const filteredAssignments = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return assignments.filter((a) => {
      if (courseFilter !== "all" && String(a.courseid) !== courseFilter) {
        return false;
      }
      if (query) {
        const hay = `${a.name} ${courseName(a.courseid)}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      if (statusFilter === "upcoming") {
        return !a.duedate || a.duedate >= now;
      }
      if (statusFilter === "overdue") {
        return Boolean(a.duedate && a.duedate < now);
      }
      return true;
    });
  }, [assignments, courseFilter, statusFilter, query, courseName]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (courseFilter !== "all" && String(e.courseid || "") !== courseFilter) {
        return false;
      }
      if (query) {
        const hay = `${e.name} ${courseName(e.courseid)}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [events, courseFilter, query, courseName]);

  return {
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    filteredCourses,
    filteredAssignments,
    filteredEvents,
  };
}
