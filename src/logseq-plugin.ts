// logseq-plugin.ts
import { logseq as LSPlugin } from "@logseq/libs/dist/LSPlugin";

class CerebruhLogseqPlugin {
  private lastBlockContent: Map<string, string> = new Map();

  async onload() {
    // Listen to block focus events
    LSPlugin.Editor.onInputSelectionEnd(async (event) => {
      const block = await LSPlugin.Editor.getBlock(event.uuid);
      if (!block) return;

      const previousContent = this.lastBlockContent.get(block.uuid);
      const currentContent = block.content;

      if (previousContent !== currentContent) {
        await this.sendToMCP({
          type: 'block',
          content: currentContent,
          context: {
            source: `logseq-block-${block.uuid}`,
            timestamp: Date.now()
          }
        });

        this.lastBlockContent.set(block.uuid, currentContent);
      }
    });

    // Also listen to real-time editor changes
    LSPlugin.Editor.registerSlashCommand(
      'cerebruh-capture',
      async () => {
        const block = await LSPlugin.Editor.getCurrentBlock();
        if (!block) return;

        // Capture current block immediately
        await this.sendToMCP({
          type: 'text',
          content: block.content,
          context: {
            source: `logseq-command-${block.uuid}`,
            timestamp: Date.now()
          }
        });
      }
    );
  }

  private async sendToMCP(observation: any) {
    // Send to your MCP server
    await fetch('http://localhost:3001/mcp/observe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation)
    });
  }
}// logseq-plugin.ts
import { logseq as LSPlugin } from "@logseq/libs/dist/LSPlugin";

class CerebruhLogseqPlugin {
  private lastBlockContent: Map<string, string> = new Map();

  async onload() {
    // Listen to block focus events
    LSPlugin.Editor.onInputSelectionEnd(async (event) => {
      const block = await LSPlugin.Editor.getBlock(event.uuid);
      if (!block) return;

      const previousContent = this.lastBlockContent.get(block.uuid);
      const currentContent = block.content;

      if (previousContent !== currentContent) {
        await this.sendToMCP({
          type: 'block',
          content: currentContent,
          context: {
            source: `logseq-block-${block.uuid}`,
            timestamp: Date.now()
          }
        });

        this.lastBlockContent.set(block.uuid, currentContent);
      }
    });

    // Also listen to real-time editor changes
    LSPlugin.Editor.registerSlashCommand(
      'cerebruh-capture',
      async () => {
        const block = await LSPlugin.Editor.getCurrentBlock();
        if (!block) return;

        // Capture current block immediately
        await this.sendToMCP({
          type: 'text',
          content: block.content,
          context: {
            source: `logseq-command-${block.uuid}`,
            timestamp: Date.now()
          }
        });
      }
    );
  }

  private async sendToMCP(observation: any) {
    // Send to your MCP server
    await fetch('http://localhost:3001/mcp/observe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation)
    });
  }
}