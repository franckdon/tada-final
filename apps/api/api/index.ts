// apps/api/api/index.ts
import { openapi } from "../src/openapi";

export default async function handler(req: any, res: any) {
  const host = req.headers.host;
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const base = host?.includes("localhost") ? `http://${host}` : `${proto}://${host}`;

  const url = new URL(req.url, base);

  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as any,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
  });

  const response = await openapi.fetch(request);

  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const buf = Buffer.from(await response.arrayBuffer());
  res.send(buf);
}
