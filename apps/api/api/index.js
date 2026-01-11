// apps/api/api/index.js
// Ce fichier sert de handler pour les fonctions serverless sur Vercel.
// - si ton build produit dist/src/app.js → laisse tel quel
// - si ton build produit dist/app.js → remplace par "../dist/app"
const app = require("../dist/app").default;

module.exports = async function handler(req, res) {
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

        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        res.end(buffer);
    } catch (err) {
        console.error("[VERCEL API HANDLER ERROR]", err);

        res.statusCode = 500;
        res.setHeader("content-type", "application/json");
        res.end(
            JSON.stringify({
                error: "Serverless function crashed",
                details: String(err),
            }),
        );
    }
};
