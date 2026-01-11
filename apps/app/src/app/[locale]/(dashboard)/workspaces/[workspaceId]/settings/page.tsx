//src/app/[locale]/(dashboard)/workspaces/[workspaceId]/settings/page.tsx
"use client";

import { useParams } from "next/navigation";
import { WorkspaceSettings } from "@/components/workspaces/workspace-settings";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ locale: string; workspaceId: string }>();

  const workspaceId = params.workspaceId;

  return <WorkspaceSettings workspaceId={workspaceId} />;
}
