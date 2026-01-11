// apps/api/api/index.js
const { openapi } = require("../dist/openapi");

module.exports = async function handler(req, res) {
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    // Construct the full URL
    const url = new URL(req.url, `${proto}://${host}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    });

    const response = await openapi.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));

    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error("[VERCEL API HANDLER ERROR]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Serverless function crashed", details: String(err) }));
  }
};
