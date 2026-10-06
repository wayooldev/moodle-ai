export type NormalizedAssignment = {
  id: number;
  name: string;
  courseid: number;
  duedate: number | null;
  allowsubmissionsfromdate: number | null;
  cutoffdate: number | null;
  intro: string | null;
};

export type NormalizedCalendarEvent = {
  id: number;
  name: string;
  description: string | null;
  timestart: number | null;
  timeduration: number;
  courseid: number | null;
  eventtype: string | null;
  modulename: string | null;
};

export type MoodleClient = {
  getSiteInfo: () => Promise<Record<string, any>>;
  getEnrolledCourses: (userid: number) => Promise<any>;
  getCourseContents: (courseid: number) => Promise<any>;
  getUserAssignments: (courseids: number[]) => Promise<any>;
  getAssignmentsNormalized: (
    courseids: number[]
  ) => Promise<NormalizedAssignment[]>;
  getCalendarEvents: (opts?: {
    timestart?: number;
    timeend?: number;
  }) => Promise<{
    events: NormalizedCalendarEvent[];
    source: string;
  }>;
  testConnection: () => Promise<{
    sitename: string | null;
    username: string | null;
    userid: number | null;
    release: string | null;
  }>;
};

export function normalizeAssignments(raw: unknown): NormalizedAssignment[];
export function normalizeCalendarEvents(
  raw: unknown
): NormalizedCalendarEvent[];
export function createMoodleClient(overrides?: {
  baseUrl?: string;
  token?: string;
}): MoodleClient;
