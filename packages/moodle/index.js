import axios from "axios";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Normalize Moodle assignment payloads into a flat list with due dates.
 * @param {unknown} raw
 * @returns {Array<{
 *   id: number;
 *   name: string;
 *   courseid: number;
 *   duedate: number | null;
 *   allowsubmissionsfromdate: number | null;
 *   cutoffdate: number | null;
 *   intro: string | null;
 * }>}
 */
export function normalizeAssignments(raw) {
  const courses = raw && typeof raw === "object" ? raw.courses : null;
  if (!Array.isArray(courses)) return [];

  /** @type {ReturnType<typeof normalizeAssignments>} */
  const out = [];
  for (const course of courses) {
    const courseid = Number(course?.id) || 0;
    const assignments = Array.isArray(course?.assignments)
      ? course.assignments
      : [];
    for (const a of assignments) {
      const duedate = Number(a?.duedate);
      out.push({
        id: Number(a?.id) || 0,
        name: String(a?.name || "Assignment"),
        courseid: Number(a?.course) || courseid,
        duedate: Number.isFinite(duedate) && duedate > 0 ? duedate : null,
        allowsubmissionsfromdate:
          Number(a?.allowsubmissionsfromdate) > 0
            ? Number(a.allowsubmissionsfromdate)
            : null,
        cutoffdate:
          Number(a?.cutoffdate) > 0 ? Number(a.cutoffdate) : null,
        intro: typeof a?.intro === "string" ? a.intro : null,
      });
    }
  }
  return out;
}

/**
 * Normalize calendar / action events into a stable shape.
 * @param {unknown} raw
 */
export function normalizeCalendarEvents(raw) {
  const events = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray(raw.events)
      ? raw.events
      : [];

  return events.map((e) => {
    const timestart = Number(e?.timestart);
    return {
      id: Number(e?.id) || 0,
      name: String(e?.name || "Event"),
      description: typeof e?.description === "string" ? e.description : null,
      timestart: Number.isFinite(timestart) ? timestart : null,
      timeduration: Number(e?.timeduration) || 0,
      courseid: Number(e?.course?.id || e?.courseid) || null,
      eventtype: typeof e?.eventtype === "string" ? e.eventtype : null,
      modulename: typeof e?.modulename === "string" ? e.modulename : null,
    };
  });
}

/**
 * @param {{ baseUrl?: string, token?: string }} [overrides]
 */
export function createMoodleClient(overrides = {}) {
  const baseUrl = (overrides.baseUrl || requireEnv("MOODLE_URL")).replace(
    /\/$/,
    ""
  );
  const token = overrides.token || requireEnv("MOODLE_TOKEN");

  async function call(wsfunction, params = {}) {
    const body = new URLSearchParams();
    body.set("wstoken", token);
    body.set("wsfunction", wsfunction);
    body.set("moodlewsrestformat", "json");

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            for (const [k, v] of Object.entries(item)) {
              body.set(`${key}[${index}][${k}]`, String(v));
            }
          } else {
            body.set(`${key}[${index}]`, String(item));
          }
        });
      } else if (typeof value === "object") {
        for (const [k, v] of Object.entries(value)) {
          body.set(`${key}[${k}]`, String(v));
        }
      } else {
        body.set(key, String(value));
      }
    }

    const { data } = await axios.post(
      `${baseUrl}/webservice/rest/server.php`,
      body.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000,
      }
    );

    if (data && typeof data === "object" && data.exception) {
      throw new Error(
        `Moodle error (${data.errorcode || "unknown"}): ${data.message || data.exception}`
      );
    }
    return data;
  }

  return {
    getSiteInfo: () => call("core_webservice_get_site_info"),
    getEnrolledCourses: (userid) =>
      call("core_enrol_get_users_courses", { userid }),
    getCourseContents: (courseid) =>
      call("core_course_get_contents", { courseid }),
    getUserAssignments: async (courseids) => {
      return call("mod_assign_get_assignments", { courseids });
    },
    getAssignmentsNormalized: async (courseids) => {
      const raw = await call("mod_assign_get_assignments", { courseids });
      return normalizeAssignments(raw);
    },
    /**
     * Best-effort calendar/action events between unix timestamps.
     * Falls back to empty list when the site lacks the function.
     */
    getCalendarEvents: async ({ timestart, timeend } = {}) => {
      const start =
        typeof timestart === "number"
          ? timestart
          : Math.floor(Date.now() / 1000) - 7 * 86400;
      const end =
        typeof timeend === "number"
          ? timeend
          : start + 60 * 86400;

      try {
        const data = await call("core_calendar_get_calendar_events", {
          options: {
            userevents: 1,
            siteevents: 1,
          },
          events: {
            eventids: [],
            courseids: [],
            groupids: [],
            categoryids: [],
          },
        });
        const normalized = normalizeCalendarEvents(data).filter((e) => {
          if (e.timestart == null) return false;
          return e.timestart >= start && e.timestart <= end;
        });
        return { events: normalized, source: "core_calendar_get_calendar_events" };
      } catch {
        // Open LMS / restricted tokens often expose action events instead.
      }

      try {
        const data = await call(
          "core_calendar_get_action_events_by_timesort",
          {
            timesortfrom: start,
            timesortto: end,
            limitnum: 50,
          }
        );
        return {
          events: normalizeCalendarEvents(data),
          source: "core_calendar_get_action_events_by_timesort",
        };
      } catch {
        return { events: [], source: "fallback_empty" };
      }
    },
    testConnection: async () => {
      const site = await call("core_webservice_get_site_info");
      return {
        sitename: site?.sitename || null,
        username: site?.username || null,
        userid: site?.userid || null,
        release: site?.release || null,
      };
    },
  };
}
