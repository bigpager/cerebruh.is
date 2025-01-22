import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';

// Mock the logseq API
const mockShowMsg = jest.fn();
const mockGetBlock = jest.fn();
const mockGetCurrentBlock = jest.fn();
const mockRegisterSlashCommand = jest.fn();
const mockOnInputSelectionEnd = jest.fn();

global.logseq = {
  Editor: {
    onInputSelectionEnd: mockOnInputSelectionEnd,
    registerSlashCommand: mockRegisterSlashCommand,
    getBlock: mockGetBlock,
    getCurrentBlock: mockGetCurrentBlock,
  },
  UI: {
    showMsg: mockShowMsg,
  },
} as any;

// Mock fetch
global.fetch = jest.fn();

import '../src/index';

describe('Cerebruh Logseq Plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Block observation', () => {
    it('should send block changes to MCP', async () => {
      const mockBlock = {
        uuid: '123',
        content: 'New content',
        page: { name: 'test-page' }
      } as BlockEntity;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'memory-123' })
      });

      // Trigger the block change handler
      const handler = mockOnInputSelectionEnd.mock.calls[0][0];
      await handler({ uuid: '123' });

      // Since we're using debounce, we need to advance timers
      jest.runAllTimers();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/observe',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('New content')
        })
      );
    });

    it('should handle MCP errors gracefully', async () => {
      const mockBlock = {
        uuid: '123',
        content: 'Test content'
      } as BlockEntity;

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      mockGetBlock.mockResolvedValueOnce(mockBlock);

      const handler = mockOnInputSelectionEnd.mock.calls[0][0];
      await handler({ uuid: '123' });
      jest.runAllTimers();

      // Should not crash and should log error
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Slash command', () => {
    it('should capture current block immediately', async () => {
      const mockBlock = {
        uuid: '123',
        content: 'Slash command test',
        page: { name: 'test-page' }
      } as BlockEntity;

      mockGetCurrentBlock.mockResolvedValueOnce(mockBlock);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'memory-123' })
      });

      // Find and execute the slash command handler
      const slashCommandName = mockRegisterSlashCommand.mock.calls[0][0];
      const handler = mockRegisterSlashCommand.mock.calls[0][1];
      expect(slashCommandName).toBe('cerebruh');

      await handler();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/observe',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Slash command test')
        })
      );
      expect(mockShowMsg).toHaveBeenCalledWith('Block captured by Cerebruh');
    });

    it('should handle errors during slash command execution', async () => {
      const mockBlock = {
        uuid: '123',
        content: 'Error test'
      } as BlockEntity;

      mockGetCurrentBlock.mockResolvedValueOnce(mockBlock);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const handler = mockRegisterSlashCommand.mock.calls[0][1];
      await handler();

      expect(mockShowMsg).toHaveBeenCalledWith('Failed to capture block', 'error');
    });
  });
});