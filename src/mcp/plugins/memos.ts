import { z } from "zod";
import type { FastMCP } from "fastmcp";

export async function addMemosPlugin(server: FastMCP) {
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
}