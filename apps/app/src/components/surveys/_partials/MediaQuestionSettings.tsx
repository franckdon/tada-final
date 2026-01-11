"use client";

import { useI18n } from "@/locales/client";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import type {
  MediaQuestionMode,
  MediaType,
} from "@/context/surveys-builder-context";
import { useState } from "react";

interface MediaQuestionSettingsProps {
  mediaMode: "upload" | "stimulus";
  onMediaModeChange: (mode: "upload" | "stimulus") => void;

  stimulusSource: "upload" | "url";
  onStimulusSourceChange: (src: "upload" | "url") => void;

  stimulusMediaUrl: string;
  onStimulusMediaUrlChange: (url: string) => void;

  stimulusMediaType: MediaType;
  onStimulusMediaTypeChange: (type: MediaType) => void;

  stimulusFileName?: string;
  onStimulusFileChange?: (file: File | null) => void;

  mediaTypes: MediaType[];
  onMediaTypesChange: (types: MediaType[]) => void;

  maxFiles: number;
  onMaxFilesChange: (value: number) => void;

  maxSizeMb: number;
  onMaxSizeMbChange: (value: number) => void;

  maxDurationSeconds?: number;
  onMaxDurationSecondsChange: (value: number | undefined) => void;

  captureRequired: boolean;
  onCaptureRequiredChange: (value: boolean) => void;
}

export function MediaQuestionSettings({
  mediaMode,
  onMediaModeChange,
  stimulusSource,
  onStimulusSourceChange,
  stimulusMediaUrl,
  onStimulusMediaUrlChange,
  stimulusMediaType,
  onStimulusMediaTypeChange,
  stimulusFileName,
  onStimulusFileChange,

  mediaTypes,
  onMediaTypesChange,
  maxFiles,
  onMaxFilesChange,
  maxSizeMb,
  onMaxSizeMbChange,
  maxDurationSeconds,
  onMaxDurationSecondsChange,
  captureRequired,
  onCaptureRequiredChange,
}: MediaQuestionSettingsProps) {
  const t = useI18n();
  const [uploading, setUploading] = useState(false);

  const toggleMediaType = (type: MediaType) => {
    onMediaTypesChange(
      mediaTypes.includes(type)
        ? mediaTypes.filter((t) => t !== type)
        : [...mediaTypes, type]
    );
  };

  const setPreset = (
    preset: "photo_direct" | "video_direct" | "audio_direct" | "short_videos"
  ) => {
    onMediaModeChange("upload");

    switch (preset) {
      case "photo_direct":
        onMediaTypesChange(["photo"]);
        onCaptureRequiredChange(true);
        onMaxFilesChange(1);
        onMaxDurationSecondsChange(undefined);
        onMaxSizeMbChange(10);
        break;
      case "video_direct":
        onMediaTypesChange(["video"]);
        onCaptureRequiredChange(true);
        onMaxFilesChange(1);
        onMaxDurationSecondsChange(120);
        onMaxSizeMbChange(100);
        break;
      case "audio_direct":
        onMediaTypesChange(["audio"]);
        onCaptureRequiredChange(true);
        onMaxFilesChange(1);
        onMaxDurationSecondsChange(180);
        onMaxSizeMbChange(50);
        break;
      case "short_videos":
        onMediaTypesChange(["video"]);
        onCaptureRequiredChange(true);
        onMaxFilesChange(3);
        onMaxDurationSecondsChange(30);
        onMaxSizeMbChange(50);
        break;
    }
  };

  async function uploadStimulus(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/uploads/stimulus-media", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Upload failed");

      // ✅ on hydrate toutes les infos
      onStimulusMediaUrlChange(json.url);
      onStimulusMediaTypeChange(json.mediaType);
      onStimulusSourceChange("upload");

      // pour afficher le nom
      onStimulusFileChange?.(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Mode d’interaction média (côté répondant) */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          {t("missions.surveys.addNewQuestion.mediaMode.title", {
            defaultValue: "Type d’interaction média",
          })}
        </span>
        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mediaMode"
              value="upload"
              checked={mediaMode === "upload"}
              onChange={() => onMediaModeChange("upload")}
            />
            <span>
              {t("missions.surveys.addNewQuestion.mediaMode.upload", {
                defaultValue: "L’utilisateur envoie un média",
              })}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mediaMode"
              value="stimulus"
              checked={mediaMode === "stimulus"}
              onChange={() => onMediaModeChange("stimulus")}
            />
            <span>
              {t("missions.surveys.addNewQuestion.mediaMode.stimulus", {
                defaultValue: "L’utilisateur regarde un média fourni",
              })}
            </span>
          </label>
        </div>
      </div>

      {/* Presets rapides (uniquement si l'utilisateur doit uploader un média) */}
      {mediaMode === "upload" && (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            {t("missions.surveys.addNewQuestion.mediaPresets.title", {
              defaultValue: "Presets rapides",
            })}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset("photo_direct")}
            >
              📷 Photo en direct (obligatoire)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset("video_direct")}
            >
              🎥 Vidéo en direct
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset("audio_direct")}
            >
              🎤 Audio verbal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreset("short_videos")}
            >
              🎬 Minis séquences vidéo
            </Button>
          </div>
        </div>
      )}

      {/* Types de média que le répondant peut envoyer */}
      {mediaMode === "upload" && (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">
            {t("missions.surveys.addNewQuestion.mediaTypes")}
          </span>
          <div className="flex flex-wrap gap-3 text-sm">
            {(["photo", "video", "audio"] as MediaType[]).map((mType) => (
              <label key={mType} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mediaTypes.includes(mType)}
                  onChange={() => toggleMediaType(mType)}
                />
                <span>{mType}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Média stimulus fourni par Streetbees / le client */}
      {mediaMode === "stimulus" && (
        <div className="space-y-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            {t("missions.surveys.addNewQuestion.stimulus.title", {
              defaultValue: "Média stimulus à afficher au répondant",
            })}
          </span>

          {/* Source du média : Upload ou URL */}
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-1">
              {t("missions.surveys.addNewQuestion.stimulus.sourceLabel", {
                defaultValue: "Source du média stimulus",
              })}
            </span>
            <div className="space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stimulusSource"
                  value="upload"
                  checked={stimulusSource === "upload"}
                  onChange={() => onStimulusSourceChange("upload")}
                />
                <span>
                  {t("missions.surveys.addNewQuestion.stimulus.sourceUpload", {
                    defaultValue: "Importer un fichier depuis mon ordinateur",
                  })}
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stimulusSource"
                  value="url"
                  checked={stimulusSource === "url"}
                  onChange={() => onStimulusSourceChange("url")}
                />
                <span>
                  {t("missions.surveys.addNewQuestion.stimulus.sourceUrl", {
                    defaultValue: "Utiliser une URL existante (S3, CDN, …)",
                  })}
                </span>
              </label>
            </div>
          </div>

          {/* Si source = upload → input file */}
          {stimulusSource === "upload" && (
            <div className="space-y-2">
              <label className="block text-sm mb-1">
                {t("missions.surveys.addNewQuestion.stimulus.uploadLabel", {
                  defaultValue: "Fichier média à uploader",
                })}
              </label>
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadStimulus(file);
                }}
              />

              {uploading && (
                <p className="text-xs text-gray-500">Upload en cours…</p>
              )}

              {stimulusFileName && (
                <p className="text-xs text-gray-500">
                  {t(
                    "missions.surveys.addNewQuestion.stimulus.selectedFileLabel",
                    {
                      defaultValue: "Fichier sélectionné :",
                    }
                  )}{" "}
                  <span className="font-medium">{stimulusFileName}</span>
                </p>
              )}
            </div>
          )}

          {/* Si source = URL → champ texte */}
          {stimulusSource === "url" && (
            <div>
              <label className="block text-sm mb-1">
                {t("missions.surveys.addNewQuestion.stimulus.urlLabel", {
                  defaultValue: "URL du média (image / vidéo / audio)",
                })}
              </label>
              <Input
                type="text"
                value={stimulusMediaUrl}
                placeholder="https://..."
                onChange={(e) => onStimulusMediaUrlChange(e.target.value)}
              />
            </div>
          )}

          {/* Type du média stimulus */}
          <div>
            <label className="block text-sm mb-1">
              {t("missions.surveys.addNewQuestion.stimulus.typeLabel", {
                defaultValue: "Type du média stimulus",
              })}
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={stimulusMediaType}
              onChange={(e) =>
                onStimulusMediaTypeChange(e.target.value as MediaType)
              }
            >
              <option value="photo">Photo</option>
              <option value="video">Vidéo</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      )}

      {/* Contraintes d’upload (uniquement si le répondant UPLOAD) */}
      {mediaMode === "upload" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">
                {t("missions.surveys.addNewQuestion.maxFiles")}
              </label>
              <Input
                type="number"
                min={1}
                value={maxFiles}
                onChange={(e) =>
                  onMaxFilesChange(parseInt(e.target.value || "1", 10))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                {t("missions.surveys.addNewQuestion.maxSizeMb")}
              </label>
              <Input
                type="number"
                min={1}
                value={maxSizeMb}
                onChange={(e) =>
                  onMaxSizeMbChange(parseInt(e.target.value || "1", 10))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Durée max par média (sec)
              </label>
              <Input
                type="number"
                min={1}
                value={maxDurationSeconds ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    onMaxDurationSecondsChange(undefined);
                    return;
                  }
                  onMaxDurationSecondsChange(parseInt(raw, 10));
                }}
              />
            </div>
          </div>

          {/* Capture en direct obligatoire */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              id="captureRequired"
              checked={captureRequired}
              onChange={() => onCaptureRequiredChange(!captureRequired)}
            />
            <label htmlFor="captureRequired">
              {t("missions.surveys.addNewQuestion.captureRequired")}
            </label>
          </div>
        </>
      )}
    </div>
  );
}
