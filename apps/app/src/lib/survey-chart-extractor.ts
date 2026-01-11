// src/lib/survey-chart-extractor.ts
import type { VisualizationId } from "./chart-types";
import {
  getVisualizationSettingsForQuestionType,
  type QuestionTypeDashboard,
} from "./question-vizualisation";
import {
  generateChartConfig,
  generateBooleanChartConfig,
  type QuestionData,
  type SurveyData,
} from "./utils";

// même alias que dans utils
type QuestionType = QuestionTypeDashboard;

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export function extractAllQuestionsDataWithConfig(
  surveyResponses: SurveyData
): QuestionData[] {
  const questionsData: QuestionData[] = [];

  Object.entries(surveyResponses.questions_responses).forEach(
    ([question, questionData]: [string, any]) => {
      const questionType = questionData.type as QuestionType;
      const participantsCount = questionData.responses.length;

      const { defaultChart, allowedCharts } =
        getVisualizationSettingsForQuestionType(questionType);

      switch (questionType) {
        //
        // DROPDOWN → bar / column / pie / table
        //
        case "dropdown": {
          const answerCounts: Record<string, number> = {};

          questionData.responses.forEach((response: any) => {
            const answer = response.answer;
            answerCounts[answer] = (answerCounts[answer] || 0) + 1;
          });

          const chartData = Object.entries(answerCounts).map(
            ([label, value]) => ({
              label,
              value,
            })
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart,
            allowed_chart: allowedCharts,
            participants_responded: participantsCount,
            data: chartData,
            config: generateChartConfig(chartData),
            rawResponses: questionData.responses,
          });
          break;
        }

        //
        // TEXT / COMMENT → table uniquement
        //
        case "text":
        case "comment": {
          const textResponses = questionData.responses.map(
            (response: any) => response.answer
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart, // "table"
            allowed_chart: allowedCharts, // ["table"]
            participants_responded: participantsCount,
            data: textResponses,
            config: {},
            rawResponses: questionData.responses,
          });
          break;
        }

        //
        // CHECKBOX → bar / column / stacked_column / pie / table / turf
        //
        case "checkbox": {
          const checkboxCounts: Record<string, number> = {};

          questionData.responses.forEach((response: any) => {
            const answers = Array.isArray(response.answer)
              ? response.answer
              : [response.answer];

            answers.forEach((answer: string) => {
              checkboxCounts[answer] = (checkboxCounts[answer] || 0) + 1;
            });
          });

          const checkboxChartData = Object.entries(checkboxCounts).map(
            ([label, value]) => ({ label, value })
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart,
            allowed_chart: allowedCharts,
            participants_responded: participantsCount,
            data: checkboxChartData,
            config: generateChartConfig(checkboxChartData),
            rawResponses: questionData.responses,
          });
          break;
        }

        //
        // BOOLEAN → pie / bar / column / table
        //
        case "boolean": {
          const booleanCounts: Record<string, number> = {};

          questionData.responses.forEach((response: any) => {
            const answer = response.answer ? "Oui" : "Non";
            booleanCounts[answer] = (booleanCounts[answer] || 0) + 1;
          });

          const booleanChartData = Object.entries(booleanCounts).map(
            ([label, value]) => ({ label, value })
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart, // "pie"
            allowed_chart: allowedCharts,
            participants_responded: participantsCount,
            data: booleanChartData,
            config: generateBooleanChartConfig(booleanChartData),
            rawResponses: questionData.responses,
          });
          break;
        }

        //
        // RATING → stacked_bar / bar / column / stacked_column / table
        //
        case "rating": {
          const ratings = questionData.responses
            .map((response: any) => parseInt(response.answer, 10))
            .filter((r: number) => !isNaN(r));

          if (ratings.length === 0) {
            questionsData.push({
              question,
              type: questionType,
              chart_type: defaultChart, // "stacked_bar"
              allowed_chart: allowedCharts,
              participants_responded: participantsCount,
              data: [],
              config: {},
              rawResponses: questionData.responses,
            });
            break;
          }

          const minRating = Math.min(...ratings);
          const maxRating = Math.max(...ratings);

          const ratingData = [
            {
              category: "Évaluation",
              ...Object.fromEntries(
                Array.from({ length: maxRating - minRating + 1 }, (_, i) => {
                  const rating = minRating + i;
                  return [rating.toString(), 0];
                })
              ),
            } as Record<string, number | string>,
          ];

          questionData.responses.forEach((response: any) => {
            const rating = response.answer.toString();
            if (rating in ratingData[0]) {
              (ratingData[0] as any)[rating]++;
            }
          });

          const ratingConfig: ChartConfig = {};
          const ratingKeys: string[] = [];

          for (let i = minRating; i <= maxRating; i++) {
            const key = i.toString();
            ratingKeys.push(key);
            ratingConfig[key] = {
              label: `${i} étoile${i > 1 ? "s" : ""}`,
              color: `hsl(var(--chart-${((i - minRating) % 10) + 1}))`,
            };
          }

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart,
            allowed_chart: allowedCharts,
            participants_responded: participantsCount,
            data: ratingData as any,
            config: ratingConfig,
            primaryKeys: ratingKeys,
            min: minRating,
            max: maxRating,
            rawResponses: questionData.responses,
          });
          break;
        }

        //
        // FILE + types non gérés (gps, matrix, etc.) → on transforme en texte lisible
        //
        case "file":
        default: {
          const textResponses = questionData.responses.map((response: any) => {
            const ans = response.answer;

            if (ans == null) return "";

            // simple : string / number / boolean
            if (
              typeof ans === "string" ||
              typeof ans === "number" ||
              typeof ans === "boolean"
            ) {
              return String(ans);
            }

            // array : ex. file: ["url1", "url2"]
            if (Array.isArray(ans)) {
              return ans
                .map((v) =>
                  typeof v === "string" ||
                  typeof v === "number" ||
                  typeof v === "boolean"
                    ? String(v)
                    : JSON.stringify(v)
                )
                .join(", ");
            }

            // objet : gps, matrix, etc.
            if (typeof ans === "object") {
              // cas GPS { lat, long, label }
              if ("label" in ans && typeof (ans as any).label === "string") {
                return (ans as any).label;
              }

              // cas MATRIX { "Prix": "Neutre", "Qualité": "Satisfait", ... }
              const entries = Object.entries(ans);
              return entries
                .map(
                  ([k, v]) =>
                    `${k}: ${typeof v === "string" ? v : String(v)}`
                )
                .join(" | ");
            }

            return "";
          });

          questionsData.push({
            question,
            type: questionType,
            chart_type: defaultChart, // "table"
            allowed_chart: allowedCharts, // ["table"]
            participants_responded: participantsCount,
            data: textResponses,
            config: {},
            rawResponses: questionData.responses,
          });
          break;
        }
      }
    }
  );

  return questionsData;
}
