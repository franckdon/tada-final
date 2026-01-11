import { PasswordChangeForm } from "@/components/settings/forms/password-change-form";
import { TabsSettings } from "@/components/settings/tabs-settings";
import { getI18n } from "@/locales/server";
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";

export const metadata = {
  title: "Mot de passe | Tada",
};

export default async function PasswordPage() {
  const t = await getI18n();
  return (
    <Card className="px-4 py-8 dark:bg-gray-900">
      <CardContent>
        <h1 className="text-2xl font-medium text-gray-800 mb-6">
          {t("settings.title")}
        </h1>
        <TabsSettings />
        <PasswordChangeForm />
      </CardContent>
    </Card>
  );
}
