// src/lib/question-visualization.ts
import type { VisualizationId } from "./chart-types";

// Doit rester synchronisé avec ce que tu normalises dans convertPrismaSurveyToSurveyData
export type QuestionTypeDashboard =
  | "dropdown"
  | "text"
  | "checkbox"
  | "comment"
  | "boolean"
  | "rating"
  | "file";

export interface QuestionVisualizationSettings {
  defaultChart: VisualizationId;
  allowedCharts: VisualizationId[];
}

/**
 * Mapping centralisé : pour chaque type de question,
 * - quel type de graphique par défaut ?
 * - quels types sont autorisés dans le sélecteur ?
 */
export function getVisualizationSettingsForQuestionType(
  type: QuestionTypeDashboard
): QuestionVisualizationSettings {
  switch (type) {
    //
    // LISTE / DROPDOWN
    //
    case "dropdown":
      return {
        defaultChart: "bar",
        allowedCharts: ["bar", "column", "pie", "table"],
      };

    //
    // TEXTE / COMMENTAIRE
    //
    case "text":
    case "comment":
      return {
        defaultChart: "table",
        allowedCharts: ["table"],
      };

    //
    // CHECKBOX (multi-sélection)
    //
    case "checkbox":
      return {
        defaultChart: "bar",
        allowedCharts: [
          "bar",
          "column",
          "stacked_column",
          "pie",
          "table",
          "turf",
        ],
      };

    //
    // BOOLEAN
    //
    case "boolean":
      return {
        defaultChart: "pie",
        allowedCharts: ["pie", "bar", "column", "table"],
      };

    //
    // RATING / ÉCHELLE
    //
    case "rating":
      return {
        // même choix que ton implémentation actuelle
        defaultChart: "stacked_bar",
        // 🔧 IMPORTANT :
        // j’ai enlevé "chart" ici, car dans ton chart-types.ts
        // tu as commenté la visualisation "chart"
        // (elle n’existe plus dans VisualizationId).
        allowedCharts: [
          "stacked_bar",
          "bar",
          "column",
          "stacked_column",
          "table",
        ],
      };

    //
    // FILE / AUTRES (gps, matrix, etc. normalisés en "file")
    //
    case "file":
    default:
      return {
        defaultChart: "table",
        allowedCharts: ["table"],
      };
  }
}
