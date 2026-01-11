"use client";

import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import MDEditor from "@uiw/react-md-editor";
import { useEffect, useState } from "react";

interface AddTextChartProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, value: string) => void;
}

export default function AddTextChart({
  isOpen,
  onClose,
  onAdd,
}: AddTextChartProps) {
  const [value, setValue] = useState<string | undefined>("");
  const [title, setTitle] = useState<string | undefined>("");

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setTitle("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle>Add markdown widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <MDEditor
            preview="edit"
            maxHeight={300}
            minHeight={100}
            visibleDragbar
            overflow={false}
            value={value}
            onChange={setValue}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onAdd(title || "", value || "")}
            disabled={!title || !value}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
