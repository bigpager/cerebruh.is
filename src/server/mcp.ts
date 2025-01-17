import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "Cerebruh",
  version: "0.1.0",
});

// Add a tool to interact with Memos
server.addTool({
  name: "memos",
  description: "Interact with Memos service",
  parameters: z.object({
    action: z.enum(["create", "read", "update", "delete"]),
    content: z.string().optional(),
    id: z.string().optional(),
  }),
  execute: async (args) => {
    // Implementation will connect to Memos service
    return "Memo operation successful";
  },
});

// Add a tool for Linkwarden
server.addTool({
  name: "linkwarden",
  description: "Manage links and bookmarks",
  parameters: z.object({
    action: z.enum(["save", "get", "delete"]),
    url: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  execute: async (args) => {
    // Implementation will connect to Linkwarden
    return "Link operation successful";
  },
});

// Add a tool for N8N workflows
server.addTool({
  name: "n8n",
  description: "Trigger or manage N8N workflows",
  parameters: z.object({
    workflow: z.string(),
    payload: z.record(z.any()).optional(),
  }),
  execute: async (args) => {
    // Implementation will connect to N8N
    return "Workflow triggered successfully";
  },
});

// Start the server with SSE support for real-time updates
server.start({
  transportType: "sse",
  sse: {
    endpoint: "/mcp",
    port: 3001,  // Using the port from your docker-compose
  },
});

export default server;