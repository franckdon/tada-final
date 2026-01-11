"use client";

import { useI18n } from "@/locales/client";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { useMemo, useState } from "react";

type HeatmapConfig = {
  stimulusSource: "upload" | "url";
  stimulusImageUrl?: string;
  stimulusImage?: { bucket: string; path: string; publicUrl: string };
  allowMultipleClicks?: boolean;
  maxClicks?: number;
  collectReason?: boolean;
};

type Props = {
  value: HeatmapConfig;
  onChange: (next: HeatmapConfig) => void;
};

export function HeatmapQuestionSettings({ value, onChange }: Props) {
  const t = useI18n();
  const [uploading, setUploading] = useState(false);

  const previewUrl = useMemo(() => {
    return value.stimulusSource === "url"
      ? value.stimulusImageUrl
      : value.stimulusImage?.publicUrl;
  }, [value]);

  const set = (patch: Partial<HeatmapConfig>) =>
    onChange({ ...value, ...patch });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      // Tu peux créer /api/uploads/heatmap-stimulus (recommandé)
      // ou réutiliser /api/uploads/question-image si tu veux.
      const res = await fetch("/api/uploads/heatmap-stimulus", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      // json = { url, bucket, path, publicUrl }
      set({
        stimulusSource: "upload",
        stimulusImageUrl: undefined,
        stimulusImage: {
          bucket: json.bucket,
          path: json.path,
          publicUrl: json.publicUrl ?? json.url,
        },
      });
    } finally {
      setUploading(false);
    }
  };

  const clearStimulus = () => {
    set({
      stimulusImageUrl: "",
      stimulusImage: undefined,
    });
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {t("missions.surveys.addNewQuestion.heatmap.title", {
              defaultValue: "Heatmap (clic sur zone d’intérêt)",
            })}
          </p>
          <p className="text-xs text-gray-500">
            {t("missions.surveys.addNewQuestion.heatmap.desc", {
              defaultValue:
                "Le répondant clique sur l’image. On enregistre les coordonnées (x,y) en pourcentage.",
            })}
          </p>
        </div>

        {previewUrl ? (
          <button
            type="button"
            className="text-gray-400 hover:text-red-500"
            onClick={clearStimulus}
            title="Supprimer le stimulus"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Source stimulus */}
      <div className="space-y-2">
        <span className="block text-xs font-medium text-gray-600">
          {t("missions.surveys.addNewQuestion.heatmap.source", {
            defaultValue: "Image stimulus",
          })}
        </span>

        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapStimulusSource"
              checked={value.stimulusSource === "upload"}
              onChange={() => set({ stimulusSource: "upload" })}
            />
            <span>
              {t("missions.surveys.addNewQuestion.heatmap.sourceUpload", {
                defaultValue: "Uploader une image",
              })}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="heatmapStimulusSource"
              checked={value.stimulusSource === "url"}
              onChange={() => set({ stimulusSource: "url" })}
            />
            <span>
              {t("missions.surveys.addNewQuestion.heatmap.sourceUrl", {
                defaultValue: "Utiliser une URL",
              })}
            </span>
          </label>
        </div>

        {value.stimulusSource === "url" ? (
          <div className="space-y-2">
            <Input
              value={value.stimulusImageUrl ?? ""}
              placeholder="https://..."
              onChange={(e) => set({ stimulusImageUrl: e.target.value })}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-xs border rounded-md px-3 py-2 cursor-pointer w-fit">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  {t("missions.surveys.addNewQuestion.heatmap.uploadBtn", {
                    defaultValue: "Choisir une image",
                  })}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="border rounded-md p-2 bg-gray-50">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="stimulus"
            className="w-full max-h-64 object-contain rounded"
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-gray-400">
            {t("missions.surveys.addNewQuestion.heatmap.noPreview", {
              defaultValue: "Aucun stimulus sélectionné",
            })}
          </div>
        )}
      </div>

      {/* Comportement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!value.allowMultipleClicks}
            onChange={() => {
              const next = !value.allowMultipleClicks;
              set({
                allowMultipleClicks: next,
                maxClicks: next ? (value.maxClicks ?? 3) : 1,
              });
            }}
          />
          <span>
            {t("missions.surveys.addNewQuestion.heatmap.multiple", {
              defaultValue: "Autoriser plusieurs clics",
            })}
          </span>
        </label>

        <div>
          <label className="block text-sm mb-1">
            {t("missions.surveys.addNewQuestion.heatmap.maxClicks", {
              defaultValue: "Nombre max de clics",
            })}
          </label>
          <Input
            type="number"
            min={1}
            value={value.allowMultipleClicks ? (value.maxClicks ?? 3) : 1}
            disabled={!value.allowMultipleClicks}
            onChange={(e) =>
              set({ maxClicks: parseInt(e.target.value || "1", 10) })
            }
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!value.collectReason}
            onChange={() => set({ collectReason: !value.collectReason })}
          />
          <span>
            {t("missions.surveys.addNewQuestion.heatmap.reason", {
              defaultValue: "Demander une explication (texte)",
            })}
          </span>
        </label>
      </div>

      {/* (Optionnel) Bouton pour ouvrir un modal secondaire “zones avancées” */}
      {/* <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // plus tard: ouvrir un Dialog interne si tu veux définir des zones (rect/polygon)
            // pour l’instant, heatmap libre = ok.
          }}
        >
          {t("missions.surveys.addNewQuestion.heatmap.advancedZones", {
            defaultValue: "Zones avancées (optionnel)",
          })}
        </Button>
      </div> */}
    </div>
  );
}
