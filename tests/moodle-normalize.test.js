import { describe, expect, it } from "vitest";
import {
  normalizeAssignments,
  normalizeCalendarEvents,
} from "../packages/moodle/index.js";

describe("moodle normalize", () => {
  it("flattens assignments with duedate", () => {
    const out = normalizeAssignments({
      courses: [
        {
          id: 10,
          assignments: [
            { id: 1, name: "Essay", course: 10, duedate: 1700000000 },
            { id: 2, name: "Quiz", course: 10, duedate: 0 },
          ],
        },
      ],
    });
    expect(out).toHaveLength(2);
    expect(out[0].duedate).toBe(1700000000);
    expect(out[1].duedate).toBeNull();
  });

  it("normalizes calendar events and tolerates empty", () => {
    expect(normalizeCalendarEvents(null)).toEqual([]);
    const events = normalizeCalendarEvents({
      events: [{ id: 9, name: "Class", timestart: 100, courseid: 3 }],
    });
    expect(events[0]).toMatchObject({
      id: 9,
      name: "Class",
      timestart: 100,
      courseid: 3,
    });
  });
});
