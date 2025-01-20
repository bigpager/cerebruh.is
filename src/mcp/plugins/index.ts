import type { FastMCP } from "fastmcp";
import { addLogseqPlugin } from "./logseq.ts";

export async function addPlugins(server: FastMCP) {
  await addLogseqPlugin(server);
}