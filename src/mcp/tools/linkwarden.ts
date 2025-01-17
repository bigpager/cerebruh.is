import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const linkwardenTools = (server: FastMCP) => {
  server.addTool({
    name: "linkwarden.save",
    description: "Save a new link",
    parameters: z.object({
      url: z.string().url(),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      try {
        // TODO: Implement link saving
        logger.info('Saving link:', args);
        return "Link saved successfully";
      } catch (error) {
        logger.error('Failed to save link:', error);
        throw error;
      }
    },
  });
};