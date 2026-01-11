"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Image, Plus, X, Loader2 } from "lucide-react";
import { useState } from "react";

type ImageChoice = {
  id: string;
  value: string;
  label: string;
  imageUrl: string;
  description?: string;
};

interface ImageRankingConfiguratorProps {
  imageChoices: ImageChoice[];
  onChange: (choices: ImageChoice[]) => void;
}

export function ImageRankingConfigurator({
  imageChoices,
  onChange,
}: ImageRankingConfiguratorProps) {
  const t = useI18n();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleLabelChange = (index: number, value: string) => {
    onChange(
      imageChoices.map((c, i) => (i === index ? { ...c, label: value } : c))
    );
  };

  const handleUrlChange = (index: number, value: string) => {
    onChange(
      imageChoices.map((c, i) => (i === index ? { ...c, imageUrl: value } : c))
    );
  };

  const handleRemove = (index: number) => {
    onChange(imageChoices.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([
      ...imageChoices,
      {
        id: crypto.randomUUID(),
        value: `choice_${imageChoices.length + 1}`,
        label: `Image ${imageChoices.length + 1}`,
        imageUrl: "",
      },
    ]);
  };

  const handleFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(imageChoices[index].id);

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/question-image", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      const url = json.url as string;

      onChange(
        imageChoices.map((c, i) => (i === index ? { ...c, imageUrl: url } : c))
      );
    } catch (err) {
      console.error("Image upload error:", err);
      // tu peux ajouter un toast ici si tu veux
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("missions.surveys.addNewQuestion.imageRanking.imagesLabel") ??
          "Images à classer"}
      </label>

      {imageChoices.map((choice, index) => (
        <div
          key={choice.id}
          className="flex items-center gap-3 border rounded-md p-2"
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
            {choice.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={choice.imageUrl}
                alt={choice.label}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image className="w-6 h-6 text-gray-400" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <Input
              value={choice.label}
              placeholder={`Label ${index + 1}`}
              onChange={(e) => handleLabelChange(index, e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                value={choice.imageUrl}
                placeholder={
                  t(
                    "missions.surveys.addNewQuestion.imageRanking.imageUrlPlaceholder"
                  ) || "URL de l'image"
                }
                onChange={(e) => handleUrlChange(index, e.target.value)}
              />

              <label className="inline-flex items-center px-3 py-2 border rounded-md text-xs cursor-pointer">
                {uploadingId === choice.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  (t(
                    "missions.surveys.addNewQuestion.imageRanking.uploadButton"
                  ) ?? "Upload")
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handleFileChange(index, e)}
                />
              </label>
            </div>
          </div>

          {/* Supprimer */}
          <button
            type="button"
            className="text-gray-400 hover:text-red-500"
            onClick={() => handleRemove(index)}
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={handleAdd}
      >
        <Plus size={14} className="mr-1" />
        {t("missions.surveys.addNewQuestion.imageRanking.addImage") ??
          "Ajouter une image"}
      </Button>
    </div>
  );
}
