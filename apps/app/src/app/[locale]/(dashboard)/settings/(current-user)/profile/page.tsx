import { PersonalInfoForm } from "@/components/settings/forms/personal-info-form";
import { TabsSettings } from "@/components/settings/tabs-settings";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";
import { headers } from "next/headers";

export const metadata = {
  title: "Profil | Tada",
};

export default async function ProfilePage() {
  const t = await getI18n();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    select: {
      name: true,
      email: true,
      position: true,
      image: true,
      country: true,
      sector: true,
    },
  });

  return (
    <Card className="px-4 py-8 dark:bg-gray-900">
      <CardContent>
        <h1 className="text-2xl font-medium text-gray-800 mb-6">
          {t("settings.title")}
        </h1>
        <TabsSettings />
        <PersonalInfoForm
          user={{
            id: session?.user?.id ?? "",
            name: user?.name ?? "",
            email: user?.email ?? "",
            position: user?.position ?? "",
            country: user?.country ?? "",
            sector: user?.sector ?? "",
            avatarUrl: user?.image ?? "",
          }}
        />
      </CardContent>
    </Card>
  );
}
