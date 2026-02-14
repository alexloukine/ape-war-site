const DATA_FILES = {
  "/ChimpWar.data.unityweb": "https://github.com/alexloukine/ape-war-site/releases/download/assets-v12/Chimp.War.data.unityweb",
  "/OWBuild.data.unityweb": "https://github.com/alexloukine/ape-war-site/releases/download/assets-v13/OW.Build.data.unityweb",
};

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

    const url = new URL(request.url);
    const githubUrl = DATA_FILES[url.pathname];

    if (!githubUrl) {
      // Default to new build data file for backwards compatibility
      const fallbackUrl = DATA_FILES["/OWBuild.data.unityweb"];
      const response = await fetch(fallbackUrl, {
        headers: { "User-Agent": "Cloudflare-Worker" },
      });
      return new Response(response.body, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Encoding": "br",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    const response = await fetch(githubUrl, {
      headers: { "User-Agent": "Cloudflare-Worker" },
    });

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "br",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  },
};
