import { describe, expect, test } from '@jest/globals';
import { generateToolCatalog } from '../../src/mcp/utils/catalog';
import { readFileSync } from 'fs';
import path from 'path';

describe('MCP Tool Catalog', () => {
  test('generates catalog from tools directory', async () => {
    const catalog = await generateToolCatalog();
    expect(catalog).toBeDefined();
    expect(Array.isArray(catalog.tools)).toBe(true);
  });

  test('includes required metadata for each tool', async () => {
    const catalog = await generateToolCatalog();
    for (const tool of catalog.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('version');
      expect(tool).toHaveProperty('path');
    }
  });

  test('updates when tools directory changes', async () => {
    const initialCatalog = await generateToolCatalog();
    const updatedCatalog = await generateToolCatalog();
    expect(updatedCatalog.lastUpdated).toBeGreaterThanOrEqual(initialCatalog.lastUpdated);
  });
});