import { z } from "zod";
import type { FastMCP } from "fastmcp";

export async function addN8NPlugin(server: FastMCP) {
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
}