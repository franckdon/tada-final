import app from "../src/app";

export default async function handler(req: any, res: any) {
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;

    const url = new URL(req.url, `${proto}://${host}`);

    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    });

    const response = await app.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => res.setHeader(key, value));

    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error("[VERCEL API HANDLER ERROR]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Serverless function crashed", details: String(err) }));
  }
}
