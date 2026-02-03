"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import Link from "next/link";
import { Edit } from "lucide-react";

export default function WorkspaceProfileCard({
  workspace,
}: {
  workspace: any;
}) {
  const plan = workspace.workspacePlanSubscription;

  return (
    <div className="rounded-lg border bg-white shadow-sm p-6 text-center">
      <Avatar className="mx-auto h-24 w-24">
        {workspace.logo && <AvatarImage src={workspace.logo} />}
        <AvatarFallback>
          {workspace.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <h2 className="mt-4 text-2xl font-medium">{workspace.name}</h2>
      <p className="text-sm text-gray-500">{workspace.slug}</p>

      <div className="mt-4 flex justify-center gap-2">
        <Badge variant="secondary">
          {workspace.organization?.name ?? "No organization"}
        </Badge>

        {plan && (
          <Badge variant={plan.status === "active" ? "success" : "secondary"}>
            {plan.planCode.toUpperCase()}
          </Badge>
        )}
      </div>
    </div>
  );
}
