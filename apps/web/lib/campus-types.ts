export type CampusSite = {
  sitename: string | null;
  fullname: string | null;
  username: string | null;
};

export type CampusCourse = {
  id: number;
  fullname: string;
  shortname: string;
};

export type CampusAssignment = {
  id: number;
  name: string;
  courseid: number;
  duedate: number | null;
};

export type CampusCalendarEvent = {
  id: number;
  name: string;
  timestart: number | null;
  courseid: number | null;
};

export type LoadSlice = "idle" | "loading" | "ready" | "error";
