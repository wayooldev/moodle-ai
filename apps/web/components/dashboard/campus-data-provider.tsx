"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readJsonBody } from "@/lib/http";
import type {
  CampusAssignment,
  CampusCalendarEvent,
  CampusCourse,
  CampusSite,
  LoadSlice,
} from "@/lib/campus-types";

type CampusDataContextValue = {
  site: CampusSite | null;
  siteState: LoadSlice;
  courses: CampusCourse[];
  coursesState: LoadSlice;
  coursesError: string | null;
  assignments: CampusAssignment[];
  assignmentsState: LoadSlice;
  assignmentsError: string | null;
  events: CampusCalendarEvent[];
  eventsState: LoadSlice;
  eventsError: string | null;
  eventsSource: string | null;
  courseName: (id: number | null) => string;
  refresh: () => void;
};

const CampusDataContext = createContext<CampusDataContextValue | null>(null);

export function CampusDataProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<CampusSite | null>(null);
  const [siteState, setSiteState] = useState<LoadSlice>("idle");
  const [courses, setCourses] = useState<CampusCourse[]>([]);
  const [coursesState, setCoursesState] = useState<LoadSlice>("idle");
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<CampusAssignment[]>([]);
  const [assignmentsState, setAssignmentsState] = useState<LoadSlice>("idle");
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [events, setEvents] = useState<CampusCalendarEvent[]>([]);
  const [eventsState, setEventsState] = useState<LoadSlice>("idle");
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsSource, setEventsSource] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function loadSite() {
      setSiteState("loading");
      try {
        const res = await fetch("/api/moodle/site");
        const data = await readJsonBody<CampusSite & { error?: string }>(res);
        if (!res.ok) throw new Error(data.error || "No se pudo cargar el campus");
        if (!cancelled) {
          setSite(data);
          setSiteState("ready");
        }
      } catch {
        if (!cancelled) {
          setSite(null);
          setSiteState("error");
        }
      }
    }

    async function loadCourses() {
      setCoursesState("loading");
      setCoursesError(null);
      try {
        const res = await fetch("/api/moodle/courses");
        const data = await readJsonBody<{ courses?: CampusCourse[]; error?: string }>(
          res
        );
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar cursos");
        if (!cancelled) {
          setCourses(data.courses || []);
          setCoursesState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setCourses([]);
          setCoursesError(
            err instanceof Error ? err.message : "No se pudieron cargar cursos"
          );
          setCoursesState("error");
        }
      }
    }

    async function loadAssignments() {
      setAssignmentsState("loading");
      setAssignmentsError(null);
      try {
        const res = await fetch("/api/moodle/assignments");
        const data = await readJsonBody<{
          assignments?: CampusAssignment[];
          error?: string;
        }>(res);
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar tareas");
        if (!cancelled) {
          setAssignments(data.assignments || []);
          setAssignmentsState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setAssignments([]);
          setAssignmentsError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar tareas"
          );
          setAssignmentsState("error");
        }
      }
    }

    async function loadCalendar() {
      setEventsState("loading");
      setEventsError(null);
      try {
        const res = await fetch("/api/moodle/calendar");
        const data = await readJsonBody<{
          events?: CampusCalendarEvent[];
          source?: string;
          error?: string;
        }>(res);
        if (!res.ok) throw new Error(data.error || "No se pudo cargar calendario");
        if (!cancelled) {
          setEvents(data.events || []);
          setEventsSource(data.source || null);
          if (data.error) setEventsError(data.error);
          setEventsState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setEvents([]);
          setEventsSource(null);
          setEventsError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el calendario"
          );
          setEventsState("error");
        }
      }
    }

    void loadSite();
    void loadCourses();
    void loadAssignments();
    void loadCalendar();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const courseName = useMemo(() => {
    const map = new Map(courses.map((c) => [c.id, c.fullname]));
    return (id: number | null) =>
      id ? map.get(id) || `Curso ${id}` : "General";
  }, [courses]);

  const value = useMemo(
    () => ({
      site,
      siteState,
      courses,
      coursesState,
      coursesError,
      assignments,
      assignmentsState,
      assignmentsError,
      events,
      eventsState,
      eventsError,
      eventsSource,
      courseName,
      refresh,
    }),
    [
      site,
      siteState,
      courses,
      coursesState,
      coursesError,
      assignments,
      assignmentsState,
      assignmentsError,
      events,
      eventsState,
      eventsError,
      eventsSource,
      courseName,
      refresh,
    ]
  );

  return (
    <CampusDataContext.Provider value={value}>
      {children}
    </CampusDataContext.Provider>
  );
}

export function useCampusData() {
  const ctx = useContext(CampusDataContext);
  if (!ctx) {
    throw new Error("useCampusData must be used within CampusDataProvider");
  }
  return ctx;
}
