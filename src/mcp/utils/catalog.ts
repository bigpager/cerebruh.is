import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Define the tool metadata schema
const ToolMetadata = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  path: z.string(),
});

export type Tool = z.infer<typeof ToolMetadata>;

export interface Catalog {
  tools: Tool[];
  lastUpdated: number;
}

const TOOLS_DIR = path.join(process.cwd(), 'src', 'mcp', 'tools');

export async function generateToolCatalog(): Promise<Catalog> {
  const tools: Tool[] = [];
  const entries = await readdir(TOOLS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    try {
      const metadataPath = path.join(TOOLS_DIR, entry.name, 'metadata.json');
      const metadataContent = await readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      // Validate and transform the metadata
      const tool = ToolMetadata.parse({
        ...metadata,
        path: path.join(TOOLS_DIR, entry.name),
      });

      tools.push(tool);
    } catch (error) {
      console.warn(`Failed to load metadata for tool ${entry.name}:`, error);
      continue;
    }
  }

  return {
    tools,
    lastUpdated: Date.now(),
  };
}

// Cache the catalog with a TTL
let cachedCatalog: Catalog | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5000; // 5 seconds

export async function getCatalog(): Promise<Catalog> {
  const now = Date.now();
  if (cachedCatalog && now - lastCacheUpdate < CACHE_TTL) {
    return cachedCatalog;
  }

  cachedCatalog = await generateToolCatalog();
  lastCacheUpdate = now;
  return cachedCatalog;
}