"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateBoardModal } from "../modals/create-board-modal";
import { useAction } from "next-safe-action/hooks";
import { createBoardAction } from "@/actions/boards/create-board-action";
import { useRouter } from "next/navigation";

interface AddBoardButtonProps {
  missionId: string;
  organizationId: string;
}

export function AddBoardButton({
  missionId,
  organizationId,
}: AddBoardButtonProps) {
  const t = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const createBoard = useAction(createBoardAction, {
    onSuccess: ({ data }) => {
      setIsOpen(false);
      router.push(`/missions/${organizationId}/${missionId}/${data?.data?.id}`);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <div className="flex items-center justify-between p-4 pb-3 ">
      <div className="flex items-center">
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          {t("missions.boards.add")}
        </Button>
      </div>

      <CreateBoardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        createBoard={(name) => {
          createBoard.execute({
            name: name,
            organizationId,
            missionId,
          });
        }}
        isLoading={createBoard.status === "executing"}
      />
    </div>
  );
}
