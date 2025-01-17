import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // First try KV for real-time updates
  const KV_NAMESPACE = 'CEREBRUH_MCP';
  const env = request.cf?.env;
  
  try {
    if (env?.KV && env.KV[KV_NAMESPACE]) {
      const kvCatalog = await env.KV[KV_NAMESPACE].get('tools-catalog');
      if (kvCatalog) {
        return new Response(kvCatalog, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Fall back to static catalog
    const staticCatalog = await fetch(new URL('/mcp-catalog.json', request.url));
    return new Response(await staticCatalog.text(), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error serving MCP catalog:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch tools catalog'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};