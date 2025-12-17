// Cloudflare Worker to proxy Unity data file with CORS headers
// Deploy this to: apewar-data.alexander-loukine.workers.dev

const GITHUB_RELEASE_URL = "https://github.com/alexloukine/ape-war-site/releases/download/assets-v2/Chimp%20War.data.unityweb";

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    try {
      // Fetch from GitHub releases
      const response = await fetch(GITHUB_RELEASE_URL, {
        headers: {
          "User-Agent": "Cloudflare-Worker",
        },
      });

      if (!response.ok) {
        return new Response(`Failed to fetch: ${response.status}`, { status: response.status });
      }

      // Create new response with CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, max-age=31536000",
        },
      });

      return newResponse;
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};
