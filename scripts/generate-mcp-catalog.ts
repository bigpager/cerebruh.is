import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const ToolMetadata = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
});

async function ensureDirectoryExists(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function generateCatalog() {
  const TOOLS_DIR = path.join(process.cwd(), 'src', 'mcp', 'tools');
  const PUBLIC_DIR = path.join(process.cwd(), 'public');
  const tools = [];
  
  try {
    // Ensure public directory exists
    await ensureDirectoryExists(PUBLIC_DIR);

    const entries = await readdir(TOOLS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      try {
        const metadataPath = path.join(TOOLS_DIR, entry.name, 'metadata.json');
        const metadataContent = await readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        // Validate metadata
        const tool = ToolMetadata.parse(metadata);
        tools.push({
          ...tool,
          id: entry.name,
          path: `/mcp/tools/${entry.name}`
        });
      } catch (error) {
        console.warn(`Failed to load metadata for tool ${entry.name}:`, error);
      }
    }

    // Write catalog to public directory for static access
    const catalogPath = path.join(PUBLIC_DIR, 'mcp-catalog.json');
    await writeFile(catalogPath, JSON.stringify({ 
      tools,
      generated: new Date().toISOString()
    }, null, 2));

    console.log(`Generated catalog with ${tools.length} tools`);
  } catch (error) {
    console.error('Failed to generate catalog:', error);
    process.exit(1);
  }
}

generateCatalog().catch(console.error);