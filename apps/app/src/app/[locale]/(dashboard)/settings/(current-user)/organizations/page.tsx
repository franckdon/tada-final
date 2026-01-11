import { TabsSettings } from "@/components/settings/tabs-settings";
import UpdateOrganization from "@/components/settings/organization/update";
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";

export const metadata = {
  title: "Organisation | Tada",
};

export default function OrganisationsPage() {
  return (
    <Card className="px-4 py-8 dark:bg-gray-900">
      <CardContent>
        <h1 className="text-2xl font-medium text-gray-800 mb-6">Paramètres</h1>
        <TabsSettings />
        <UpdateOrganization />
      </CardContent>
    </Card>
  );
}
