//src/middleware.ts
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";

const locales = ["en", "fr"] as const;

const I18nMiddleware = createI18nMiddleware({
  locales: [...locales],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

const publicPaths = new Set([
  "/login",
  "/signup",
  "/impersonate",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/check-email",
  "/workspaces/invitations/accept",
]);

function stripLocale(pathname: string) {
  const segs = pathname.split("/");
  if (segs.length > 1 && locales.includes(segs[1] as (typeof locales)[number])) {
    return "/" + segs.slice(2).join("/");
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  const isDev = process.env.NODE_ENV !== "production";
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  const bypassAuth =
    isDev && (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1" || isLocalHost);

  const pathNoLocale = stripLocale(request.nextUrl.pathname);
  const isPublicPath = publicPaths.has(pathNoLocale);

  // Si bypass auth ou chemin public, laisser i18n gérer
  if (bypassAuth || isPublicPath) {
    return I18nMiddleware(request);
  }

  // Sinon, vérifier la session
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: `${protocol}://${host}`,
      headers: { cookie: request.headers.get("cookie") || "" },
    }
  );

  if (!session) {
    const callback = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(
      `${protocol}://${host}/login?callbackUrl=${encodeURIComponent(callback)}`
    );
  }

  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    // tout sauf assets, api et images statiques
    //"/((?!_next/static|api|_next/image|favicon.ico|.\\.(?:svg|png|jpg|jpeg|gif|webp)$).)",
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
