"use client";

import { createContext, useContext, useState } from "react";

export type MediaType = "photo" | "video" | "audio";
export type GpsMode = "pin" | "navigate" | "checkin";
export type MediaQuestionMode = "upload" | "stimulus" | "upload_and_stimulus";

export type ImageChoice = {
  id: string; // interne, stable (pour drag & drop, tracking)
  value: string; // ce qui sera renvoyé dans la réponse ("concept_a")
  label: string; // ex : "Concept A – fond bleu"
  imageUrl: string; // URL finale (S3 / Supabase / etc.)
  description?: string; // optionnel, pour des infos supplémentaires
};

export type HeatmapTarget =
  | { kind: "rect"; rect: { x: number; y: number; w: number; h: number } }
  | { kind: "polygon"; points: { x: number; y: number }[] };

export type HeatmapConfig = {
  stimulusSource: "upload" | "url";
  stimulusImageUrl?: string; // si url
  stimulusImage?: {
    bucket: string;
    path: string;
    publicUrl: string;
  }; // si upload (optionnel)
  allowMultipleClicks?: boolean; // 1 click ou plusieurs
  maxClicks?: number; // si multiple
  collectReason?: boolean; // champ texte après clic
  targets?: HeatmapTarget[]; // optionnel si tu veux des zones définies
};

interface SurveysBuilderContextType {
  surveys: Survey;
  setSurveys: React.Dispatch<React.SetStateAction<Survey>>;
}

export const SurveysBuilderContext = createContext<
  SurveysBuilderContextType | undefined
>(undefined);

export interface SurveyQuestion {
  type: string; // "radiogroup", "checkbox", "rating", "file", "matrix", "text", ...
  name: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  imageChoices?: ImageChoice[];

  // catégorie logique
  category?:
    | "single_choice"
    | "multiple_choice"
    | "likert"
    | "numeric_scale"
    | "slider"
    | "matrix"
    | "open"
    | "rating"
    | "image_ranking"
    | "media"
    | "gps"
    | "section"
    | "image_ranking"
    | "ranking"
    | "heatmap";

  // choix
  choices?: string[];
  allowMultiple?: boolean;
  randomizeChoices?: boolean;
  hasOther?: boolean;
  otherText?: string;

  // rating / échelles
  rateMin?: number;
  rateMax?: number;
  rateStep?: number;
  minRateDescription?: string;
  maxRateDescription?: string;
  displayRateDescriptionsAsExtremes?: boolean;
  displayMode?: "auto" | "buttons" | "dropdown";

  // input / numérique
  inputType?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  maxLength?: number;

  // matrice / classement
  rows?: string[];
  columns?: string[];
  allowRowReorder?: boolean;

  // 📸 média
  mediaTypes?: MediaType[];
  maxDurationSeconds?: number;
  maxSizeMb?: number;
  maxFiles?: number;
  captureRequired?: boolean;

  mediaMode?: MediaQuestionMode; // "upload", "stimulus", "upload_and_stimulus"
  stimulusSource?: "upload" | "url";
  stimulusMediaUrl?: string;
  stimulusMediaType?: MediaType;

  // 🎯 heatmap
  heatmap?: HeatmapConfig;

  // 📍 GPS
  gpsMode?: GpsMode;
  targetLocation?: {
    lat: number;
    lng: number;
    label?: string;
  };
  maxDistanceMeters?: number;
  minTimeOnSiteSeconds?: number;
  requiresPathTracking?: boolean;
  gpsToleranceMeters?: number;

  // logique
  visibleIf?: string;
  enableIf?: string;
  requiredIf?: string;

  // sections
  isSectionTitle?: boolean;
  sectionId?: string;
  sectionTitle?: string;
}

interface SurveyPage {
  name: string;
  title?: string;
  description?: string;
  elements: SurveyQuestion[];
  visibleIf?: string;
  navigationButtonsVisibility?: "show" | "hide" | "inherit";
}

export interface Survey {
  title: string;
  description?: string;
  logo?: string;
  logoHeight?: number;
  logoWidth?: number;
  logoFit?: "none" | "contain" | "cover" | "fill";
  pages: SurveyPage[];
  showProgressBar?: "top" | "bottom" | "both" | "off";
  showQuestionNumbers?: "on" | "onPage" | "off";
  showPageNumbers?: boolean;
  showPageTitles?: boolean;
  showCompletedPage?: boolean;
  completedHtml?: string;
  locale?: string;
  questionsOrder?: "initial" | "random";
}

export function SurveysBuilderProvider({
  children,
  defaultSurvey,
}: {
  children: React.ReactNode;
  defaultSurvey?: Survey;
}) {
  const [surveys, setSurveys] = useState<Survey>(
    defaultSurvey && Object.keys(defaultSurvey).length > 0
      ? defaultSurvey
      : {
          title: "",
          description: "",
          pages: [
            {
              name: "page1",
              elements: [],
            },
          ],
        }
  );
  return (
    <SurveysBuilderContext.Provider value={{ surveys, setSurveys }}>
      {children}
    </SurveysBuilderContext.Provider>
  );
}

export function useSurveysBuilder() {
  const context = useContext(SurveysBuilderContext);
  if (!context) {
    throw new Error(
      "useSurveysBuilder must be used within a SurveysBuilderProvider"
    );
  }
  return context;
}
