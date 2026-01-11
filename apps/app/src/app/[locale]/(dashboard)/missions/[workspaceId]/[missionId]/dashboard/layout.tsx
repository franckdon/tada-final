import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ClientVeltWrapper } from "../../../../client-velt-wrapper";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }

  return (
    <ClientVeltWrapper
      user={
        {
          ...session.user,
          organizationId: session?.session.activeOrganizationId,
        } as any
      }
    >
      {children}
    </ClientVeltWrapper>
  );
}
