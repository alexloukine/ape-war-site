const GITHUB_RELEASE_URL = "https://github.com/alexloukine/ape-war-site/releases/download/assets-v4/Chimp.War.data.gz";

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const response = await fetch(GITHUB_RELEASE_URL, {
      headers: { "User-Agent": "Cloudflare-Worker" },
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "gzip",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  },
};
