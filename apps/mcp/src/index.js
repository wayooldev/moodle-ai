import "dotenv/config";
import { randomUUID } from "node:crypto";
import express from "express";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { requireMcpAuth } from "./auth.js";
import { mountOauthRoutes } from "./oauth.js";

const PORT = Number(process.env.PORT || 3000);

if (!process.env.MCP_API_KEY) {
  console.error("MCP_API_KEY is required");
  process.exit(1);
}

const legacySseTransports = new Map();
const streamableSessions = new Map();

function createMcpServer(moodle) {
  const server = new McpServer({
    name: "moodle-ai-mcp",
    version: "0.2.0",
  });

  server.tool(
    "get_site_info",
    "Return Open LMS / Moodle site information for the authenticated user's token",
    {},
    async () => {
      const data = await moodle.getSiteInfo();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.tool(
    "get_enrolled_courses",
    "List courses enrolled for the token user (or a specific userid)",
    {
      userid: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Moodle user id; defaults to the token owner"),
    },
    async ({ userid }) => {
      let uid = userid;
      if (!uid) {
        const site = await moodle.getSiteInfo();
        uid = site.userid;
      }
      const data = await moodle.getEnrolledCourses(uid);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.tool(
    "get_course_contents",
    "Get sections and modules for a course",
    {
      courseid: z.number().int().positive().describe("Moodle course id"),
    },
    async ({ courseid }) => {
      const data = await moodle.getCourseContents(courseid);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.tool(
    "get_user_assignments",
    "Get assignment activities for one or more courses",
    {
      courseids: z
        .array(z.number().int().positive())
        .min(1)
        .describe("List of Moodle course ids"),
    },
    async ({ courseids }) => {
      const data = await moodle.getUserAssignments(courseids);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  return server;
}

function jsonNotFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

const app = express();
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: false }));

mountOauthRoutes(app);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "moodle-ai-mcp",
    transports: ["streamable-http:/mcp", "legacy-sse:/sse"],
    oauth: true,
  });
});

app.post("/register", jsonNotFound);
app.get("/register", jsonNotFound);

app.post("/sse", (_req, res) => {
  res.status(405).json({
    error: "Legacy SSE uses GET /sse. Streamable HTTP uses POST /mcp.",
    streamableHttpEndpoint: "/mcp",
  });
});

app.get("/sse", requireMcpAuth, async (req, res) => {
  try {
    const transport = new SSEServerTransport("/messages", res);
    legacySseTransports.set(transport.sessionId, transport);
    transport.onclose = () => {
      legacySseTransports.delete(transport.sessionId);
    };
    const server = createMcpServer(req.auth.moodle);
    await server.connect(transport);
  } catch (err) {
    console.error("Legacy SSE setup failed", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "SSE setup failed" });
    }
  }
});

app.post("/messages", requireMcpAuth, async (req, res) => {
  const sessionId = req.query.sessionId;
  if (typeof sessionId !== "string" || !sessionId) {
    res.status(400).json({ error: "Missing sessionId" });
    return;
  }
  const transport = legacySseTransports.get(sessionId);
  if (!transport) {
    res.status(400).json({ error: "Unknown session" });
    return;
  }
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (err) {
    console.error("Legacy message handling failed", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Message handling failed" });
    }
  }
});

async function handleStreamableMcpPost(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  try {
    const existing = sessionId ? streamableSessions.get(sessionId) : undefined;
    let transport;

    if (existing) {
      transport = existing.transport;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          streamableSessions.set(sid, {
            transport,
            moodle: req.auth.moodle,
          });
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) streamableSessions.delete(sid);
      };
      const server = createMcpServer(req.auth.moodle);
      await server.connect(transport);
    } else if (sessionId) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Session not found" },
        id: null,
      });
      return;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Streamable MCP POST failed", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
}

async function handleStreamableMcpSession(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ error: "Missing MCP-Session-Id" });
    return;
  }
  const entry = streamableSessions.get(sessionId);
  if (!entry) {
    res.status(404).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Session not found" },
      id: null,
    });
    return;
  }
  try {
    await entry.transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Streamable MCP session request failed", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

app.post("/mcp", requireMcpAuth, handleStreamableMcpPost);
app.get("/mcp", requireMcpAuth, handleStreamableMcpSession);
app.delete("/mcp", requireMcpAuth, handleStreamableMcpSession);

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `moodle-ai-mcp listening on ${PORT} (MCP /mcp + OAuth Alexa+ metadata/token)`
  );
});
