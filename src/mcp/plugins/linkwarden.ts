import { z } from "zod";
import type { FastMCP } from "fastmcp";

export async function addLinkwardenPlugin(server: FastMCP) {
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
}