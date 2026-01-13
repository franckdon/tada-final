// apps/api/src/app.ts
import { openapi } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { mobileAuthRoutes } from "./routes/v1/mobile/auth.routes";
import { mobileUserRoutes } from "./routes/v1/mobile/user.routes";

import { sendMail } from "./lib/mailer/sendMail";
import { mobileMissionsRoutes } from "./routes/v1/mobile/missions.routes";
import { mobileMissionDetailsRoutes } from "./routes/v1/mobile/missions.details.routes";
import { mobileSurveysRoutes } from "./routes/v1/mobile/surveys/surveys.routes";
import { mobileMissionSurveysRoutes } from "./routes/v1/mobile/missions.surveys.routes";
import { mobileSurveyResponsesRoutes } from "./routes/v1/mobile/surveys/responses.routes";
import { mobileSupportRoutes } from "./routes/v1/mobile/support/support.routes";
import { mobileAccountRoutes } from "./routes/v1/mobile/account/account.routes";
import { mobilePayoutAccountsRoutes } from "./routes/v1/mobile/payout-accounts/payout-accounts.routes";

export const app = openapi;

/**
 * Beautiful landing page for GET /
 * - Zero dependency
 * - Fast, responsive, dark/light friendly
 * - Auto-detects base URL from the request
 */
app.get("/", (c) => {
  const url = new URL(c.req.url);
  const origin = url.origin;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <title>Tada Mobile API</title>
  <meta name="description" content="Tada Mobile API — OpenAPI docs, health checks, and endpoints." />

  <style>
    :root{
      --bg: #070A12;
      --panel: rgba(255,255,255,.06);
      --panel2: rgba(255,255,255,.08);
      --border: rgba(255,255,255,.12);
      --text: rgba(255,255,255,.92);
      --muted: rgba(255,255,255,.68);
      --muted2: rgba(255,255,255,.55);
      --shadow: 0 18px 60px rgba(0,0,0,.55);
      --radius: 18px;
      --radius2: 14px;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

      --c1: 102, 126, 234; /* indigo */
      --c2: 236, 72, 153;  /* pink */
      --c3: 34, 211, 238;  /* cyan */
    }

    @media (prefers-color-scheme: light) {
      :root{
        --bg: #F7F8FF;
        --panel: rgba(0,0,0,.04);
        --panel2: rgba(0,0,0,.05);
        --border: rgba(0,0,0,.10);
        --text: rgba(0,0,0,.90);
        --muted: rgba(0,0,0,.66);
        --muted2: rgba(0,0,0,.52);
        --shadow: 0 18px 60px rgba(10,15,35,.12);
      }
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      color: var(--text);
      background:
        radial-gradient(1000px 500px at 15% 10%, rgba(var(--c1), .22), transparent 55%),
        radial-gradient(900px 520px at 85% 0%, rgba(var(--c2), .18), transparent 52%),
        radial-gradient(900px 520px at 80% 90%, rgba(var(--c3), .16), transparent 55%),
        var(--bg);
      overflow-x: hidden;
    }

    a { color: inherit; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .wrap { max-width: 1100px; margin: 0 auto; padding: 44px 18px 70px; }

    .top {
      display:flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: linear-gradient(180deg, var(--panel2), var(--panel));
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .brand {
      display:flex;
      align-items:center;
      gap: 10px;
      font-weight: 700;
      letter-spacing: .2px;
    }

    .logo {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background:
        linear-gradient(135deg, rgba(var(--c1),.95), rgba(var(--c2),.9));
      box-shadow: 0 10px 30px rgba(var(--c2), .22);
      position: relative;
      overflow: hidden;
    }
    .logo:after {
      content:"";
      position:absolute;
      inset:-40%;
      background:
        radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 45%),
        radial-gradient(circle at 70% 70%, rgba(255,255,255,.18), transparent 40%);
      transform: rotate(25deg);
    }

    .nav {
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .pill {
      display:inline-flex;
      align-items:center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.02);
      color: var(--text);
      font-weight: 600;
      font-size: 13px;
    }
    .pill span {
      font-family: var(--mono);
      font-weight: 700;
      font-size: 12px;
      color: var(--muted);
    }

    .hero {
      margin-top: 22px;
      display:grid;
      grid-template-columns: 1.2fr .8fr;
      gap: 18px;
      align-items: stretch;
    }

    @media (max-width: 920px) {
      .hero { grid-template-columns: 1fr; }
      .nav { justify-content: flex-start; }
    }

    .card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: linear-gradient(180deg, var(--panel2), var(--panel));
      box-shadow: var(--shadow);
      padding: 22px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .card:before {
      content:"";
      position:absolute;
      inset:-1px;
      background:
        radial-gradient(900px 320px at 15% 10%, rgba(var(--c1), .20), transparent 55%),
        radial-gradient(900px 320px at 85% 0%, rgba(var(--c2), .16), transparent 55%);
      opacity: .7;
      pointer-events: none;
      mask: linear-gradient(#000, transparent 70%);
    }

    .kicker {
      display:inline-flex;
      align-items:center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.03);
      color: var(--muted);
      font-weight: 700;
      font-size: 12px;
      letter-spacing: .25px;
      position: relative;
      z-index: 1;
    }

    h1 {
      margin: 14px 0 10px;
      font-size: clamp(30px, 4vw, 44px);
      line-height: 1.08;
      letter-spacing: -0.02em;
      position: relative;
      z-index: 1;
    }

    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      position: relative;
      z-index: 1;
      font-size: 15px;
    }

    .actions {
      margin-top: 18px;
      display:flex;
      gap: 12px;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }

    .btn {
      display:inline-flex;
      align-items:center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid var(--border);
      font-weight: 800;
      font-size: 14px;
      background: rgba(255,255,255,.03);
      transition: transform .08s ease, background .2s ease;
      user-select: none;
    }
    .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.06); }
    .btn.primary {
      background: linear-gradient(135deg, rgba(var(--c1),.95), rgba(var(--c2),.92));
      border-color: rgba(255,255,255,.12);
      color: white;
      box-shadow: 0 16px 44px rgba(var(--c2), .18);
    }
    .btn.primary:hover { background: linear-gradient(135deg, rgba(var(--c1),1), rgba(var(--c2),.98)); }

    .grid {
      margin-top: 18px;
      display:grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 920px){
      .grid{ grid-template-columns: 1fr; }
    }

    .mini {
      border: 1px solid var(--border);
      border-radius: var(--radius2);
      background: rgba(255,255,255,.02);
      padding: 14px;
    }

    .mini h3 {
      margin: 0 0 8px;
      font-size: 14px;
      letter-spacing: .2px;
    }
    .mini p { font-size: 13px; color: var(--muted2); }

    .mono {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .side {
      display:flex;
      flex-direction: column;
      gap: 14px;
      height: 100%;
    }

    .code {
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.55;
      color: var(--text);
      border-radius: var(--radius2);
      border: 1px solid var(--border);
      background: rgba(0,0,0,.22);
      padding: 14px;
      overflow: auto;
      white-space: pre;
    }
    @media (prefers-color-scheme: light) {
      .code { background: rgba(255,255,255,.55); }
    }

    .footer {
      margin-top: 22px;
      padding: 16px 2px 0;
      color: var(--muted2);
      font-size: 12px;
      display:flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tag {
      display:inline-flex;
      align-items:center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.02);
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="brand">
        <div class="logo" aria-hidden="true"></div>
        <div>
          <div style="font-size:14px;">Tada Mobile API</div>
          <div class="mono">${origin}</div>
        </div>
      </div>

      <div class="nav">
        <a class="pill" href="/docs" title="Swagger UI">
          Docs <span>/docs</span>
        </a>
        <a class="pill" href="/openapi.json" title="OpenAPI JSON">
          OpenAPI <span>/openapi.json</span>
        </a>
        <a class="pill" href="/health" title="Health check">
          Health <span>/health</span>
        </a>
      </div>
    </div>

    <div class="hero">
      <div class="card">
        <div class="kicker">API Gateway • Hono • OpenAPI</div>
        <h1>Welcome to the Tada Mobile API.</h1>
        <p>
          This endpoint serves as the public entry point for your mobile backend. Use the links above to access Swagger UI,
          the OpenAPI specification, and operational health checks.
        </p>

        <div class="actions">
          <a class="btn primary" href="/docs">Open Swagger UI</a>
          <a class="btn" href="/openapi.json">View OpenAPI JSON</a>
          <a class="btn" href="/health">Check Health</a>
        </div>

        <div class="grid">
          <div class="mini">
            <h3>Base URL</h3>
            <div class="mono">${origin}</div>
            <p>Use this origin as the base URL for your mobile apps and services.</p>
          </div>
          <div class="mini">
            <h3>Version</h3>
            <div class="mono">v1 • Mobile</div>
            <p>All public endpoints are namespaced under <span class="mono">/v1/mobile</span>.</p>
          </div>
          <div class="mini">
            <h3>Status</h3>
            <div class="mono" id="status">Checking...</div>
            <p>Live health probe fetched from <span class="mono">/health</span>.</p>
          </div>
        </div>
      </div>

      <div class="side">
        <div class="card">
          <div class="kicker">Quick start</div>
          <p style="margin-top:10px;">Test the API from your terminal:</p>
          <div class="code">curl -s ${origin}/health | jq</div>

          <p style="margin-top:12px;">Example auth endpoint base:</p>
          <div class="code">POST ${origin}/v1/mobile/auth/...</div>

          <div class="footer">
            <span class="tag">Node 20</span>
            <span class="tag">Serverless-ready</span>
            <span class="tag">OpenAPI 3.0.3</span>
          </div>
        </div>

        <div class="card">
          <div class="kicker">Helpful links</div>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
            <a class="btn" href="/docs">Swagger UI</a>
            <a class="btn" href="/openapi.json">OpenAPI JSON</a>
            <a class="btn" href="/health">Health check</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    (async () => {
      const el = document.getElementById("status");
      try {
        const res = await fetch("/health", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data && data.ok === true) {
          el.textContent = "OK ✓";
        } else {
          el.textContent = "Degraded";
        }
      } catch (e) {
        el.textContent = "Offline";
      }
    })();
  </script>
</body>
</html>`;

  return c.html(html);
});

// Health
app.get("/health", (c) => c.json({ ok: true }));

// Debug mail route (Hono)
app.post("/debug/mail", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as any));
    const to = typeof body?.to === "string" ? body.to.trim() : "";

    if (!to) {
      return c.json({ ok: false, error: "Missing 'to' in JSON body" }, 400);
    }

    await sendMail({
      to,
      subject: "Test SMTP",
      html: "<p>Hello</p>",
    });

    return c.json({ ok: true });
  } catch (err: any) {
    console.error("[DEBUG MAIL] failed", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
    });

    return c.json(
      {
        ok: false,
        error: err?.message ?? "Mail send failed",
        code: err?.code,
        response: err?.code,
        response: err?.response,
      },
      500,
    );
  }
});

// Routes API
app.route("/v1/mobile/auth", mobileAuthRoutes);
app.route("/v1/mobile/user", mobileUserRoutes);
app.route("/v1/mobile/missions", mobileMissionsRoutes);
app.route("/v1/mobile/missions", mobileMissionDetailsRoutes);
app.route("/v1/mobile/surveys", mobileSurveysRoutes);
app.route("/v1/mobile/missions", mobileMissionSurveysRoutes);
app.route("/v1/mobile/surveys", mobileSurveyResponsesRoutes);

// new routes
app.route("/v1/mobile/support", mobileSupportRoutes);
app.route("/v1/mobile/account", mobileAccountRoutes);
app.route("/v1/mobile/payout-accounts", mobilePayoutAccountsRoutes);

// Swagger UI
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);

// JSON OpenAPI
app.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    title: "Tada Mobile API",
    version: "1.0.0",
  },
});

export default app;
