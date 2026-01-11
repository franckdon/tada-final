import { Header } from "@/components/base/header";
import { Sidebar } from "@/components/base/sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { WorkspaceProvider } from "@/context/workspace-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  let session: any = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (err) {
    console.error("[DashboardLayout] getSession failed:", err);
  }

  const user = session?.user ?? {
    id: "dev-user",
    name: "Dev User",
    email: "dev@example.com",
  };

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={user as any} />
          <main id="dashboard-scroll" className="flex-1 overflow-y-auto p-4">
            <div className="px-2 h-full">{children}</div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
