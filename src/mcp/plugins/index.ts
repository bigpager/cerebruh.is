import type { FastMCP } from "fastmcp";
import { addMemosPlugin } from "./memos.js";
import { addLinkwardenPlugin } from "./linkwarden.js";
import { addN8NPlugin } from "./n8n.js";

export async function addPlugins(server: FastMCP) {
  await addMemosPlugin(server);
  await addLinkwardenPlugin(server);
  await addN8NPlugin(server);
}