import { useI18n } from "@/locales/client";
import React from "react";

export function TipsAICard() {
  const t = useI18n();
  return (
    <div className="bg-blue-50 p-5 max-w-lg">
      <div className="flex items-start mb-2">
        <div className="text-blue-500 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-blue-700 font-medium">
          {t("missions.ai.tipsAiCard.intro")}
        </p>
      </div>

      <ul className="space-y-3 text-blue-600 ml-6">
        <li className="flex items-start">
          <div className="min-w-[6px] h-[6px] rounded-full bg-blue-600 mt-2 mr-2" />
          <p>
            <span className="font-medium">
              {t("missions.ai.tipsAiCard.provide")}
            </span>{" "}
            {t("missions.ai.tipsAiCard.provideDetail")}
          </p>
        </li>

        <li className="flex items-start">
          <div className="min-w-[6px] h-[6px] rounded-full bg-blue-600 mt-2 mr-2" />
          <p>
            <span className="font-medium">
              {t("missions.ai.tipsAiCard.askMe")}
            </span>{" "}
            {t("missions.ai.tipsAiCard.askMeDetail")}
          </p>
        </li>

        <li className="flex items-start">
          <div className="min-w-[6px] h-[6px] rounded-full bg-blue-600 mt-2 mr-2" />
          <p>
            <span className="font-medium">
              {t("missions.ai.tipsAiCard.youCanChange")}
            </span>{" "}
            {t("missions.ai.tipsAiCard.youCanChangeDetail")}
          </p>
        </li>
      </ul>
    </div>
  );
}
