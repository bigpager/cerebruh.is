import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const memosTools = (server: FastMCP) => {
  server.addTool({
    name: "memos.create",
    description: "Create a new memo",
    parameters: z.object({
      content: z.string(),
      visibility: z.enum(['private', 'public']).default('private'),
      tags: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      try {
        // TODO: Implement memo creation
        logger.info('Creating memo:', args);
        return "Memo created successfully";
      } catch (error) {
        logger.error('Failed to create memo:', error);
        throw error;
      }
    },
  });
};