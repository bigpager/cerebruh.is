import React, { useEffect, useState } from 'react';

const HEADERS = [
  "Cognitive Infrastructure",
  "My Bot Friend -- user",
  "rm -rf .cache",
  "My Notes",
  "My Journal",
  "Brain2",
  "Brain++"
];

export default function MCPToolsList() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [header, setHeader] = useState("");

  useEffect(() => {
    // Set initial random header
    setHeader(HEADERS[Math.floor(Math.random() * HEADERS.length)]);
  }, []);

  useEffect(() => {
    let mounted = true;
    let retryTimeout;

    async function fetchTools() {
      try {
        // Try API first (which will check KV), fall back to static file
        const response = await fetch('/api/mcp/tools').catch(() => 
          fetch('/mcp-catalog.json')
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        
        const data = await response.json();
        if (mounted) {
          setTools(data.tools || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        if (mounted) {
          setError(err.message);
          // Retry after 5 seconds on error
          retryTimeout = setTimeout(fetchTools, 5000);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTools();
    
    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading MCP tools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!tools?.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">No MCP tools found</div>
      </div>
    );
  }

  return (
      <div>
        <h2 className="text-2xl text-gray-300 font-bold mb-6">{header}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
              <div key={tool.name}
                   className="border rounded-lg p-4 shadow-sm bg-white">
                <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{tool.description}</p>
                <div
                    className="mt-2 text-xs text-gray-500">Version: {tool.version}</div>
              </div>
          ))}
        </div>
      </div>
  );
}