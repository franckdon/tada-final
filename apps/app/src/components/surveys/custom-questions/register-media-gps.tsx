"use client";

import React from "react";
import { Serializer, Question } from "survey-core";
import {
  ReactQuestionFactory,
  SurveyQuestionElementBase,
} from "survey-react-ui";

type MediaType = "photo" | "video" | "audio";
type GpsMode = "pin" | "navigate" | "checkin";

/** -----------------------------
 *  MEDIA QUESTION
 *  ----------------------------- */
class QuestionMediaModel extends Question {
  getType() {
    return "media";
  }

  get mediaMode(): "upload" | "stimulus" {
    return (this.getPropertyValue("mediaMode") as any) ?? "upload";
  }

  set mediaMode(val: "upload" | "stimulus") {
    this.setPropertyValue("mediaMode", val);
  }

  get mediaTypes(): MediaType[] {
    return (this.getPropertyValue("mediaTypes") as any) ?? [];
  }

  set mediaTypes(val: MediaType[]) {
    this.setPropertyValue("mediaTypes", val);
  }
  get maxFiles(): number {
    return Number(this.getPropertyValue("maxFiles") ?? 1);
  }

  set maxFiles(val: number) {
    this.setPropertyValue("maxFiles", val);
  }

  get maxSizeMb(): number {
    return Number(this.getPropertyValue("maxSizeMb") ?? 10);
  }

  set maxSizeMb(val: number) {
    this.setPropertyValue("maxSizeMb", val);
  }

  get maxDurationSeconds(): number | undefined {
    const v = this.getPropertyValue("maxDurationSeconds");
    return v === undefined || v === null || v === "" ? undefined : Number(v);
  }
  set maxDurationSeconds(val: number | undefined) {
    this.setPropertyValue("maxDurationSeconds", val);
  }

  get captureRequired(): boolean {
    return Boolean(this.getPropertyValue("captureRequired") ?? false);
  }

  set captureRequired(val: boolean) {
    this.setPropertyValue("captureRequired", val);
  }

  // stimulus
  get stimulusMediaUrl(): string {
    return (this.getPropertyValue("stimulusMediaUrl") as any) ?? "";
  }

  set stimulusMediaUrl(val: string) {
    this.setPropertyValue("stimulusMediaUrl", val);
  }

  get stimulusMediaType(): MediaType {
    return (this.getPropertyValue("stimulusMediaType") as any) ?? "photo";
  }

  set stimulusMediaType(val: MediaType) {
    this.setPropertyValue("stimulusMediaType", val);
  }
}

class SurveyQuestionMedia extends SurveyQuestionElementBase {
  get question(): QuestionMediaModel {
    return this.questionBase as QuestionMediaModel;
  }

  renderStimulus() {
    const q = this.question;
    if (!q.stimulusMediaUrl) {
      return (
        <div className="text-xs text-gray-500">
          Aucun média stimulus configuré (URL manquante).
        </div>
      );
    }

    if (q.stimulusMediaType === "photo") {
      return (
        <img
          src={q.stimulusMediaUrl}
          alt="Stimulus"
          className="w-full max-h-72 object-contain rounded border"
        />
      );
    }

    if (q.stimulusMediaType === "video") {
      return (
        <video
          src={q.stimulusMediaUrl}
          controls
          className="w-full max-h-72 rounded border"
        />
      );
    }

    return <audio src={q.stimulusMediaUrl} controls className="w-full" />;
  }

  renderUploadMock() {
    const q = this.question;

    const accept = [
      q.mediaTypes.includes("photo") ? "image/*" : null,
      q.mediaTypes.includes("video") ? "video/*" : null,
      q.mediaTypes.includes("audio") ? "audio/*" : null,
    ]
      .filter(Boolean)
      .join(",");

    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          {q.captureRequired
            ? "Capture en direct requise."
            : "Upload depuis la galerie autorisé."}{" "}
          Max fichiers: {q.maxFiles}. Taille max: {q.maxSizeMb} MB
          {q.maxDurationSeconds ? ` • Durée max: ${q.maxDurationSeconds}s` : ""}
        </div>

        {/* Preview-only: on simule juste le contrôle */}
        <input
          type="file"
          accept={accept || undefined}
          multiple={q.maxFiles > 1}
          disabled
          className="block w-full text-sm"
        />
        <div className="text-[11px] text-gray-500">
          (Preview client : l’upload réel se fera dans l’app mobile)
        </div>
      </div>
    );
  }

  renderElement() {
    const q = this.question;

    return (
      <div className="rounded-md border bg-white dark:bg-gray-900 p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {q.title}
          </div>
          {q.description && (
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {q.description}
            </div>
          )}
        </div>

        {q.mediaMode === "stimulus" ? (
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
              Média à regarder / écouter
            </div>
            {this.renderStimulus()}

            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              Après consultation, le répondant donnera son avis via les
              questions suivantes (rating/likert/etc.).
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
              Tâche terrain (envoi de média)
            </div>
            {this.renderUploadMock()}
          </div>
        )}
      </div>
    );
  }
}

/** -----------------------------
 *  GPS QUESTION
 *  ----------------------------- */
class QuestionGpsModel extends Question {
  getType() {
    return "gps";
  }

  get gpsMode(): GpsMode {
    return (this.getPropertyValue("gpsMode") as any) ?? "pin";
  }
  set gpsMode(val: GpsMode) {
    this.setPropertyValue("gpsMode", val);
  }

  get targetLocation():
    | { lat: number; lng: number; label?: string }
    | undefined {
    return this.getPropertyValue("targetLocation") as any;
  }
  set targetLocation(
    val: { lat: number; lng: number; label?: string } | undefined
  ) {
    this.setPropertyValue("targetLocation", val);
  }

  get maxDistanceMeters(): number | undefined {
    const v = this.getPropertyValue("maxDistanceMeters");
    return v === undefined || v === null || v === "" ? undefined : Number(v);
  }
  set maxDistanceMeters(val: number | undefined) {
    this.setPropertyValue("maxDistanceMeters", val);
  }

  get gpsToleranceMeters(): number | undefined {
    const v = this.getPropertyValue("gpsToleranceMeters");
    return v === undefined || v === null || v === "" ? undefined : Number(v);
  }
  set gpsToleranceMeters(val: number | undefined) {
    this.setPropertyValue("gpsToleranceMeters", val);
  }

  get minTimeOnSiteSeconds(): number | undefined {
    const v = this.getPropertyValue("minTimeOnSiteSeconds");
    return v === undefined || v === null || v === "" ? undefined : Number(v);
  }
  set minTimeOnSiteSeconds(val: number | undefined) {
    this.setPropertyValue("minTimeOnSiteSeconds", val);
  }

  get requiresPathTracking(): boolean {
    return Boolean(this.getPropertyValue("requiresPathTracking") ?? false);
  }
  set requiresPathTracking(val: boolean) {
    this.setPropertyValue("requiresPathTracking", val);
  }
}

class SurveyQuestionGps extends SurveyQuestionElementBase {
  get question(): QuestionGpsModel {
    return this.questionBase as QuestionGpsModel;
  }

  renderElement() {
    const q = this.question;
    const loc = q.targetLocation;

    const mapsUrl =
      loc?.lat !== undefined && loc?.lng !== undefined
        ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}`
        : undefined;

    const modeLabel =
      q.gpsMode === "navigate"
        ? "Rends-toi à ce lieu (itinéraire)"
        : q.gpsMode === "checkin"
          ? "Check-in sur place (présence requise)"
          : "Pin automatique de ta localisation";

    return (
      <div className="rounded-md border bg-white dark:bg-gray-900 p-4">
        <div className="mb-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {q.title}
          </div>
          {q.description && (
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {q.description}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">
            {modeLabel}
          </div>

          {q.gpsMode !== "pin" && (
            <div className="rounded border p-3 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {loc?.label || "Point d’intérêt"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {loc?.lat?.toFixed?.(6)}, {loc?.lng?.toFixed?.(6)}
              </div>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-xs underline text-blue-600"
                >
                  Ouvrir dans Google Maps
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-200">
            {q.maxDistanceMeters !== undefined && (
              <div className="rounded border p-2">
                Distance max: <b>{q.maxDistanceMeters} m</b>
              </div>
            )}
            {q.gpsToleranceMeters !== undefined && (
              <div className="rounded border p-2">
                Tolérance GPS: <b>{q.gpsToleranceMeters} m</b>
              </div>
            )}
            {q.minTimeOnSiteSeconds !== undefined && (
              <div className="rounded border p-2">
                Temps sur place: <b>{q.minTimeOnSiteSeconds}s</b>
              </div>
            )}
            {q.requiresPathTracking && (
              <div className="rounded border p-2">
                Tracking trajet: <b>activé</b>
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500">
            (Preview client : le tracking / validation GPS réels se font sur
            mobile)
          </div>
        </div>
      </div>
    );
  }
}

/** -----------------------------
 *  Registration
 *  ----------------------------- */
let registered = false;

export function registerMediaAndGpsQuestions() {
  if (registered) return;
  registered = true;

  // MEDIA
  Serializer.addClass(
    "media",
    [
      { name: "mediaMode", default: "upload" },
      { name: "mediaTypes", default: [] },
      { name: "maxFiles:number", default: 1 },
      { name: "maxSizeMb:number", default: 10 },
      { name: "maxDurationSeconds:number", default: undefined },
      { name: "captureRequired:boolean", default: false },
      { name: "stimulusSource", default: "url" },
      { name: "stimulusMediaUrl" },
      { name: "stimulusMediaType", default: "photo" },
    ],
    () => new QuestionMediaModel(""),
    "question"
  );

  ReactQuestionFactory.Instance.registerQuestion("media", (props) => {
    return React.createElement(SurveyQuestionMedia, props);
  });

  // GPS
  Serializer.addClass(
    "gps",
    [
      { name: "gpsMode", default: "pin" },
      { name: "targetLocation" },
      { name: "maxDistanceMeters:number" },
      { name: "minTimeOnSiteSeconds:number" },
      { name: "gpsToleranceMeters:number" },
      { name: "requiresPathTracking:boolean", default: false },
    ],
    () => new QuestionGpsModel(""),
    "question"
  );

  ReactQuestionFactory.Instance.registerQuestion("gps", (props) => {
    return React.createElement(SurveyQuestionGps, props);
  });
}
