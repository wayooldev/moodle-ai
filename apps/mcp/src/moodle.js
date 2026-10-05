import axios from "axios";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * @param {{ baseUrl?: string, token?: string }} [overrides]
 */
export function createMoodleClient(overrides = {}) {
  const baseUrl = (overrides.baseUrl || requireEnv("MOODLE_URL")).replace(/\/$/, "");
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
  };
}
