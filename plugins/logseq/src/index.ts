import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';

const cerebruhPlugin = () => {
  function debounce<T extends (...args: any[]) => any>(
    fn: T,
    ms: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  const mcpEndpoint = 'http://localhost:3001';
  let isPluginLoaded = false;

  async function testMCPConnection() {
    try {
      const response = await fetch(`${mcpEndpoint}/health`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      console.log('MCP server is reachable');
      return true;
    } catch (error) {
      console.error('MCP server connection test failed:', error);
      return false;
    }
  }

  async function observeBlock(block: BlockEntity, immediate = false) {
    try {
      console.log('Attempting to send block to MCP:', {
        content: block.content,
        endpoint: mcpEndpoint
      });

      const response = await fetch(`${mcpEndpoint}/observe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'block',
          content: block.content,
          context: {
            source: `logseq-block-${block.uuid}`,
            timestamp: Date.now(),
            page: block.page?.name,
            properties: block.properties
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('MCP server response:', data);

      if (immediate) {
        if (data.id) {
          logseq.UI.showMsg('Block successfully captured by Cerebruh', 'success');
        } else {
          logseq.UI.showMsg('Block captured but no ID returned', 'warning');
        }
      }
    } catch (error) {
      console.error('Error sending block to MCP:', error);
      if (immediate) {
        logseq.UI.showMsg('Failed to send block to MCP server', 'error');
      }
    }
  }

  const debouncedObserve = debounce(observeBlock, 1000);

  async function captureCurrentBlock() {
    const block = await logseq.Editor.getCurrentBlock();
    if (block) {
      await observeBlock(block, true);
    } else {
      logseq.UI.showMsg('No block selected', 'warning');
    }
  }

  function setupHandlers() {
    if (isPluginLoaded) {
      console.log('Handlers already set up, skipping...');
      return;
    }

    // Regular input handling
    logseq.Editor.onInputSelectionEnd(async (event) => {
      const block = await logseq.Editor.getBlock(event.uuid);
      if (!block) return;
      await debouncedObserve(block);
    });

    // Slash command
    logseq.Editor.registerSlashCommand('cb', captureCurrentBlock);

    // Keyboard shortcut for capturing current block
    // Using Ctrl+Alt+C (or Cmd+Alt+C on Mac)
    logseq.App.registerCommandShortcut(
      { binding: 'mod+alt+c' },
      async () => {
        await captureCurrentBlock();
      }
    );

    // Keyboard shortcut for capturing and adding a specific tag
    // Using Ctrl+Alt+T (or Cmd+Alt+T on Mac)
    logseq.App.registerCommandShortcut(
      { binding: 'mod+alt+t' },
      async () => {
        const block = await logseq.Editor.getCurrentBlock();
        if (block) {
          const newContent = block.content + ' #cerebruh-captured';
          await logseq.Editor.updateBlock(block.uuid, newContent);
          await observeBlock(block, true);
        }
      }
    );

    // Example of handling specific UI interactions
    // This attaches a handler to the whole UI
    logseq.App.registerCommandPalette(
      {
        key: 'cerebruh-capture',
        label: 'Cerebruh: Capture current block',
        keybinding: {
          binding: 'mod+alt+c',
          mode: 'global'  // Works even when not editing
        }
      },
      captureCurrentBlock
    );

    isPluginLoaded = true;
  }

  async function onload() {
    console.log('Cerebruh MCP plugin loading...');
    
    const isMCPReachable = await testMCPConnection();
    if (!isMCPReachable) {
      logseq.UI.showMsg('Warning: Cannot connect to MCP server', 'warning');
    }

    setupHandlers();
    console.log('Cerebruh MCP plugin loaded successfully');
  }

  logseq.ready(onload).catch(console.error);
};

export default cerebruhPlugin();