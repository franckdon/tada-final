"use client";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Check, Edit2, Loader2, X } from "lucide-react";
import { useState } from "react";

export const EditableTitle = ({
  field,
  value,
  defaultValue,
  editingField,
  setEditingField,
  setEditValue,
  editValue,
  onUpdateMetadata,
}: {
  field: string;
  value: string | number | undefined;
  defaultValue: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  setEditValue: (value: string) => void;
  editValue: string;
  onUpdateMetadata?: (field: string, value: string) => Promise<void>;
}) => {
  const isEditing = editingField === field;
  const [displayValue, setDisplayValue] = useState(value ?? defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditingField(null);
    setEditValue("");
  };

  const handleSave = async (field: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onUpdateMetadata) {
      try {
        setIsLoading(true);
        setDisplayValue(editValue);
        await onUpdateMetadata(field, editValue);
        setEditingField(null);
        setEditValue("");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="text-2xl font-medium h-auto py-1 w-64"
          disabled={isLoading}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleSave(field, e)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative inline-flex items-center">
      <h2 className="mt-4 text-2xl font-medium text-gray-800">{value}</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(field, String(displayValue))}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
