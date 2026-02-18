// apps/app/src/app/[locale]/workspaces/[workspaceId]/invoices/page.tsx
import { WorkspaceInvoicesClient } from "@/components/invoices/workspace-invoices-client";

export const metadata = { title: "Factures | Tada" };

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="p-8 bg-white">
      <WorkspaceInvoicesClient workspaceId={workspaceId} />
    </div>
  );
}
