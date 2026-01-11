import { UserForm } from "@/components/users/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@tada/ui/components/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@tada/ui/components/button";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Nouvel Utilisateur | Tada",
};

export default function NewUserPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600 dark:text-white" />
            Créer un nouvel utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UserForm mode="create" model="superAdmin" />
        </CardContent>
      </Card>
    </div>
  );
}
