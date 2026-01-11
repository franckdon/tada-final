"use client";

import { useSurveysBuilder } from "@/context/surveys-builder-context";
import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import { useTheme } from "next-themes";
import "survey-core/i18n/french";
import "survey-core/i18n/english";
import { useCurrentLocale } from "@/locales/client";
import { lightTheme, darkTheme } from "@/constants/surveys-themes";

export function SurveyShow() {
  const [survey, setSurvey] = useState<Model>();
  const { theme } = useTheme();
  const currentLocale = useCurrentLocale();
  const { surveys: surveyJson } = useSurveysBuilder();
  useEffect(() => {
    const surveyModel = new Model(surveyJson);
    surveyModel.applyTheme(theme === "light" ? lightTheme : darkTheme);
    surveyModel.locale = currentLocale;
    setSurvey(surveyModel);
  }, [surveyJson, theme, currentLocale]);

  if (!survey) return null;
  return <Survey model={survey} />;
}
