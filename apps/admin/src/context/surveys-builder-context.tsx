"use client";

import { createContext, useContext, useState } from "react";

interface SurveysBuilderContextType {
  surveys: Survey;
  setSurveys: React.Dispatch<React.SetStateAction<Survey>>;
}

export const SurveysBuilderContext = createContext<
  SurveysBuilderContextType | undefined
>(undefined);

export interface SurveyQuestion {
  type: string;
  name: string;
  title: string;
  isRequired?: boolean;
  choices?: string[];
  rateMin?: number;
  rateMax?: number;
  rateStep?: number;
  minRateDescription?: string;
  maxRateDescription?: string;
  displayRateDescriptionsAsExtremes?: boolean;
  displayMode?: "auto" | "buttons" | "dropdown";
  hasOther?: boolean;
  otherText?: string;
  inputType?: string;
  min?: number;
  max?: number;
  step?: number;
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
