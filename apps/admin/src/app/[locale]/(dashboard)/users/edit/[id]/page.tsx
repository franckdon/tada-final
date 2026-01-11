import { UserForm } from "@/components/users/user-form";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@tada/ui/components/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@tada/ui/components/button";

export const metadata = {
  title: "Modifier un utilisateur | Tada",
};

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    return <p>Utilisateur introuvable</p>;
  }

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
          <CardTitle className="text-2xl font-bold">
            Modifier l'utilisateur
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <UserForm mode="edit" model="superAdmin" initialData={user} />
        </CardContent>
      </Card>
    </div>
  );
}