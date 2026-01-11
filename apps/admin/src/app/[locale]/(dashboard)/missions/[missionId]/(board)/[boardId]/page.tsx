import { LayoutBoard } from "@/components/missions/boards/layout-board";
import { BoardBuilderProvider } from "@/context/board-builder-context";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { orgId: string; missionId: string; boardId: string };
}) {
  const board = await prisma.project.findUnique({
    where: {
      id: params.boardId,
      organizationId: params.orgId,
    },
    include: {
      charts: true,
    },
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <BoardBuilderProvider board={board}>
        <LayoutBoard />
      </BoardBuilderProvider>
    </div>
  );
}
