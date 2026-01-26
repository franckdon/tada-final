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
import Link from "next/link";
import { EyeIcon } from "lucide-react";
import { Button } from "@tada/ui/components/button";

const formatDate = (d?: Date | string | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
};

export default function WorkspaceMissionsTab({
  workspaceId,
  missions,
}: {
  workspaceId: string;
  missions: any[];
}) {
  if (!missions.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-600">
        Aucune mission associée à ce workspace.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Publication</TableHead>
            <TableHead className="text-right">Créée le</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {missions.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500">
                  {m.organization?.name ?? "—"}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{m.type ?? "—"}</Badge>
              </TableCell>

              <TableCell>
                <Badge variant="secondary">{m.status ?? "—"}</Badge>
              </TableCell>

              <TableCell>
                <Badge variant={m.isPublish ? "success" : "secondary"}>
                  {m.isPublish ? "Publiée" : "Non publiée"}
                </Badge>
                {m.publishAt ? (
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(m.publishAt)}
                  </div>
                ) : null}
              </TableCell>

              <TableCell className="text-right text-sm text-gray-600">
                {formatDate(m.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/missions/${m.id}`}>
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
