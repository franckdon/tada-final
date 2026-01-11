"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";

import { useI18n } from "@/locales/client";
import LeftSection from "@/components/auth/left-section";

type ResolveResponse = {
  ok: true;
  token: string;
  email: string;
  hasAccount: boolean;
  workspace: { id: string; slug: string; name: string };
};

export default function AcceptInvitationClient() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? "fr";

  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [resolvingError, setResolvingError] = useState<string | null>(null);
  const [data, setData] = useState<ResolveResponse | null>(null);

  // Password form (only when hasAccount === false)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const passwordMatch = password.length > 0 && password === confirmPassword;
  const canSubmitPassword =
    password.length >= 8 && passwordMatch && !submitting;

  // Resolve invitation
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (!token) {
          setResolvingError(t("auth.invitation.errors.missingToken"));
          setLoading(false);
          return;
        }

        const r = await fetch(
          `/api/workspaces/invitations/resolve?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );

        const payload = await r.json().catch(() => null);

        if (!r.ok) {
          const msg =
            payload?.error || t("auth.invitation.errors.resolveFailed");
          if (!cancelled) setResolvingError(msg);
          return;
        }

        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setResolvingError(t("auth.invitation.errors.network"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  // If account exists => try accept, else go login
  useEffect(() => {
    if (!data?.hasAccount) return;

    (async () => {
      try {
        const acceptRes = await fetch("/api/workspaces/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: data.token }),
        });

        if (acceptRes.ok) {
          const out = await acceptRes.json();
          router.replace(`/${locale}/workspaces/${out.workspaceId}/settings`);
          return;
        }

        if (acceptRes.status === 401) {
          const callbackUrl = `/${locale}/invitations/accept?token=${encodeURIComponent(
            data.token
          )}`;

          router.replace(
            `/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          );
          return;
        }

        const err = await acceptRes.json().catch(() => null);
        setResolvingError(
          err?.error || t("auth.invitation.errors.acceptFailed")
        );
      } catch {
        setResolvingError(t("auth.invitation.errors.network"));
      }
    })();
  }, [data, locale, router, t]);

  const handleCreateAccountAndJoin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!data) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const r = await fetch("/api/workspaces/invitations/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.token,
          password,
          confirmPassword,
        }),
      });

      const payload = await r.json().catch(() => null);

      console.log("[INVITE_COMPLETE]", r.status, payload);

      if (!r.ok) {
        setSubmitError(
          payload?.error || t("auth.invitation.errors.completeFailed")
        );
        return;
      }

      router.replace(`/${locale}/workspaces/${payload.workspaceId}/settings`);
    } catch {
      setSubmitError(t("auth.invitation.errors.network"));
    } finally {
      setSubmitting(false);
    }
  };

  // UI blocks
  const headerTitle = useMemo(() => {
    if (!data) return t("auth.invitation.titleDefault");
    return t("auth.invitation.title", { workspace: data.workspace.name });
  }, [data, t]);

  const headerSubtitle = useMemo(() => {
    if (!data) return t("auth.invitation.subtitleDefault");
    if (data.hasAccount) return t("auth.invitation.subtitleExisting");
    return t("auth.invitation.subtitleNew", { email: data.email });
  }, [data, t]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left marketing section */}
      <LeftSection />

      {/* Right form section */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-start justify-center">
        <div className="max-w-md w-full pt-20">
          <Image
            src="/logos/tada.svg"
            alt="Tada"
            width={1}
            height={1}
            className="h-6 md:h-10 w-auto mb-20"
          />

          <h1 className="text-2xl md:text-3xl font-sora font-bold">
            {headerTitle}
          </h1>
          <h2 className="text-[#48505E] mb-2">{headerSubtitle}</h2>

          {/* Loading */}
          {loading && (
            <div className="mt-4 p-3 text-sm text-gray-600 bg-gray-50 rounded-md">
              {t("auth.invitation.loading")}
            </div>
          )}

          {/* Resolve error */}
          {!loading && resolvingError && (
            <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {resolvingError}
            </div>
          )}

          {/* If has account: explain + link */}
          {!loading && data?.hasAccount && !resolvingError && (
            <div className="mt-6 space-y-4">
              <div className="p-3 text-sm text-gray-600 bg-gray-50 rounded-md">
                {t("auth.invitation.existingHint")}
              </div>

              <Button
                className="w-full bg-primary"
                onClick={() => {
                  const callbackUrl = `/${locale}/invitations/accept?token=${encodeURIComponent(
                    data.token
                  )}`;
                  router.replace(
                    `/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  );
                }}
              >
                {t("auth.invitation.goToLogin")}
              </Button>
            </div>
          )}

          {/* If no account: password set form */}
          {!loading && data && !data.hasAccount && !resolvingError && (
            <>
              {submitError && (
                <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {submitError}
                </div>
              )}

              <form
                onSubmit={handleCreateAccountAndJoin}
                className="space-y-4 md:space-y-6 mt-5"
              >
                <div>
                  <Label className="text-sm/5 font-medium text-[#48505E]">
                    {t("auth.invitation.password")}
                  </Label>
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.invitation.passwordPlaceholder")}
                    disabled={submitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t("auth.invitation.passwordHint")}
                  </p>
                </div>

                <div>
                  <Label className="text-sm/5 font-medium text-[#48505E]">
                    {t("auth.invitation.confirmPassword")}
                  </Label>
                  <Input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t(
                      "auth.invitation.confirmPasswordPlaceholder"
                    )}
                    disabled={submitting}
                  />
                  {confirmPassword.length > 0 && !passwordMatch && (
                    <p className="mt-2 text-sm text-red-500">
                      {t("auth.invitation.passwordMismatch")}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary"
                  disabled={!canSubmitPassword}
                >
                  {submitting
                    ? t("auth.invitation.creating")
                    : t("auth.invitation.submit")}
                </Button>

                <p className="text-gray-400 mt-2 text-center text-sm">
                  {t("auth.invitation.alreadyHaveAccount")}{" "}
                  <Link
                    href={`/${locale}/login`}
                    className="text-primary font-semibold"
                  >
                    {t("auth.invitation.loginLink")}
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
