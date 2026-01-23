// apps/api/api/index.js
const app = require("./dist/app").default;

console.log("[API] app module =", require.resolve("../dist/app")); // ou ./dist/app selon option
const fs = require("fs");
console.log("[CWD]", process.cwd());
console.log("[DIR api/dist exists?]", fs.existsSync(__dirname + "/dist"));
console.log("[FILE api/dist/app.js exists?]", fs.existsSync(__dirname + "/dist/app.js"));

module.exports = async function handler(req, res) {
    try {
        const proto = req.headers["x-forwarded-proto"] || "https";
        const host = req.headers.host;

        const url = new URL(req.url, `${proto}://${host}`);

        const hasBody = req.method !== "GET" && req.method !== "HEAD";

        const request = new Request(url.toString(), {
            method: req.method,
            headers: req.headers,
            body: hasBody ? req : undefined,
            duplex: hasBody ? "half" : undefined,
        });

        const response = await app.fetch(request);

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
