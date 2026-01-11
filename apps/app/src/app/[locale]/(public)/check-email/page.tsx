import { Icons } from "@/components/icons";
import { getScopedI18n } from "@/locales/server";
import { Button } from "@tada/ui/components/button";
import { Card, CardContent } from "@tada/ui/components/card";
import Link from "next/link";

export default async function CheckEmailPage() {
  const t = await getScopedI18n("auth.verifyEmail");

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-primary">
              <Icons.mail className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="mt-4 text-gray-600">{t("description")}</p>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-500">{t("checkEmail")}</p>
              <Button variant="outline" asChild>
                <Link href="/login">{t("backToSignIn")}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
