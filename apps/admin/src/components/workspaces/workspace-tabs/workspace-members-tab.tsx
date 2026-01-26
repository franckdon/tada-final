"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Badge } from "@tada/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";

const formatDate = (d?: Date | string | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
};

export default function WorkspaceMembersTab({
  workspaceId,
  members,
}: {
  workspaceId: string;
  members: any[];
}) {
  if (!members.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-600">
        Aucun membre dans ce workspace.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membre</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Invité par</TableHead>
            <TableHead className="text-right">Ajouté le</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {m.user?.image && <AvatarImage src={m.user.image} />}
                    <AvatarFallback>
                      {m.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {m.user?.name ?? "—"}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {m.user?.email ?? ""}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{m.role ?? "member"}</Badge>
              </TableCell>

              <TableCell>
                <Badge
                  variant={m.status === "active" ? "success" : "secondary"}
                >
                  {m.status ?? "—"}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-700">
                  {m.invitedBy?.name ?? "—"}
                </div>
                <div className="text-xs text-gray-500">
                  {m.invitedBy?.email ?? ""}
                </div>
              </TableCell>

              <TableCell className="text-right text-sm text-gray-600">
                {formatDate(m.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
