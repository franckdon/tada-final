"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Label } from "@tada/ui/components/label";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import { useI18n } from "@/locales/client";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  createBoard: (name: string) => void;
  isLoading: boolean;
}

export function CreateBoardModal({
  isOpen,
  onClose,
  createBoard,
  isLoading,
}: CreateBoardModalProps) {
  const t = useI18n();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
    }
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>{t("missions.boards.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-8">
          <div>
            <Label className="text-sm/5 font-medium ">
              {t("missions.boards.name")}
            </Label>
            <Input
              required
              autoFocus
              type="text"
              className=""
              placeholder={t("missions.boards.title")}
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            className="w-full"
            disabled={isLoading}
            onClick={() => createBoard(name)}
          >
            {isLoading ? t("common.loading") : t("missions.boards.add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
