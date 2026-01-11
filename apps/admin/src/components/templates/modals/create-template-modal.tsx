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
import { useEffect, useState } from "react";

type Props = {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  createTemplate: (data: {
    name: string;
    type: string;
    internal: boolean;
  }) => void;
  isLoading: boolean;
};

export function CreateTemplateModal({
  onOpenChange,
  isOpen,
  createTemplate,
  isLoading,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [internal, setInternal] = useState(false);

  const resetForm = () => {
    setName("");
    setType("");
    setInternal(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-auto">
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTemplate({ name, type, internal });
              }}
              className="space-y-4 md:space-y-6"
            >
              <div>
                <Label className="text-sm/5 font-medium">Nom du template</Label>
                <Input
                  required
                  autoFocus
                  type="text"
                  placeholder="Nom du template"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-sm/5 font-medium">
                  Type de template
                </Label>
                <Input
                  required
                  type="text"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-sm/5 font-medium">
                  Template interne ?
                </Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={internal ? "true" : "false"}
                  onChange={(e) => setInternal(e.target.value === "true")}
                  disabled={isLoading}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Create"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
