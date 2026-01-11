// Copie des fonctions utilitaires depuis l'app principale pour génération des graphiques

export interface QuestionData {
  question: string;
  type: string;
  chart_type: string;
  allowed_chart: string[];
  participants_responded: number;
  data:
    | Array<{
        label: string;
        value: number;
      }>
    | Array<any>
    | string[]
    | string;
  config: ChartConfig;
  primaryKeys?: string[];
  min?: number;
  max?: number;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Types pour les données de la base de données
interface PrismaSurveyResponse {
  id: string;
  responses: any; // JSON
  age: number;
  gender: string;
  location: any; // JSON
  status: string;
}

interface PrismaSurvey {
  id: string;
  name: string;
  questions: any; // JSON
  response: PrismaSurveyResponse[];
}

interface PrismaMission {
  id: string;
  name: string;
  survey: PrismaSurvey[];
}

type QuestionType =
  | "dropdown"
  | "text"
  | "checkbox"
  | "comment"
  | "boolean"
  | "rating"
  | "file";

interface QuestionDataRaw {
  type: QuestionType;
  isRequired?: boolean;
  responses: SurveyResponse[];
}

interface SurveyMetadata {
  total_responses: number;
  collection_period: string;
  locations_covered: string[];
  age_range: string;
  gender_distribution: {
    male: number;
    female: number;
  };
  response_rate: string;
}

export interface SurveyData {
  survey_title: string;
  questions_responses: Record<string, QuestionDataRaw>;
  metadata: SurveyMetadata;
}

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface BaseResponse {
  response_id: string;
  location: Location;
  age: string;
  sex: "male" | "female";
}

type ResponseAnswer = string | boolean | number | string[];

interface SurveyResponse extends BaseResponse {
  answer: ResponseAnswer;
}

export function generateChartConfig(
  data: Array<{ label: string; value: number }>
): ChartConfig {
  const config: ChartConfig = {};

  // Predefined color variables that can be used
  const colorVariables = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
  ];

  data.forEach((item, index) => {
    config[item.label] = {
      label: item.label,
      color:
        colorVariables[index % colorVariables.length] || "hsl(var(--chart-1))",
    };
  });

  // Add default value config
  config.value = {
    label: "value",
    color: "hsl(var(--chart-1))",
  };

  return config;
}

export function generateBooleanChartConfig(
  data: Array<{ label: string; value: number }>
): ChartConfig {
  const config: ChartConfig = {};

  data.forEach((item) => {
    const colorKey = item.label.toLowerCase();
    config[item.label] = {
      label: item.label,
      color:
        item.label === "Oui" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
    };
    // Add CSS variable for fill
    config[colorKey] = {
      label: item.label,
      color:
        item.label === "Oui" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
    };
  });

  // Add default value config
  config.value = {
    label: "value",
    color: "hsl(var(--chart-1))",
  };

  return config;
}

export function extractAllQuestionsDataWithConfig(
  surveyResponses: SurveyData
): QuestionData[] {
  const questionsData: QuestionData[] = [];

  Object.entries(surveyResponses.questions_responses).forEach(
    ([question, questionData]: [string, any]) => {
      const questionType = questionData.type;
      const participantsCount = questionData.responses.length;

      switch (questionType) {
        case "dropdown":
          // Use the dropdown function logic
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
            chart_type: "BarChartHorizontalCard",
            allowed_chart: [
              "BarChartHorizontalCard",
              "PieChart",
              "BarChartVerticalCard",
            ],
            participants_responded: participantsCount,
            data: chartData,
            config: generateChartConfig(chartData),
          });
          break;

        case "text":
          // Collect all text responses
          const textResponses = questionData.responses.map(
            (response: any) => response.answer
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: "ArrayChartCard",
            allowed_chart: ["ArrayChartCard"],
            participants_responded: participantsCount,
            data: textResponses, // Return array of strings
            config: {},
          });
          break;

        case "checkbox":
          // Use the checkbox function logic for multiple choices
          const checkboxCounts: Record<string, number> = {};

          questionData.responses.forEach((response: any) => {
            // response.answer is an array for checkbox questions
            const answers = Array.isArray(response.answer)
              ? response.answer
              : [response.answer];

            answers.forEach((answer: string) => {
              checkboxCounts[answer] = (checkboxCounts[answer] || 0) + 1;
            });
          });

          const checkboxChartData = Object.entries(checkboxCounts).map(
            ([label, value]) => ({
              label,
              value,
            })
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: "BarChartHorizontalCard",
            allowed_chart: ["BarChartHorizontalCard", "PieChart"],
            participants_responded: participantsCount,
            data: checkboxChartData,
            config: generateChartConfig(checkboxChartData),
          });
          break;

        case "comment":
          // Collect all comment responses
          const commentResponses = questionData.responses.map(
            (response: any) => response.answer
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: "ArrayChartCard",
            allowed_chart: ["ArrayChartCard"],
            participants_responded: participantsCount,
            data: commentResponses, // Return array of strings
            config: {},
          });
          break;

        case "boolean":
          // Use the boolean function logic similar to dropdown
          const booleanCounts: Record<string, number> = {};

          questionData.responses.forEach((response: any) => {
            const answer = response.answer ? "Oui" : "Non";
            booleanCounts[answer] = (booleanCounts[answer] || 0) + 1;
          });

          const booleanChartData = Object.entries(booleanCounts).map(
            ([label, value]) => ({
              label,
              value,
              fill: `var(--color-${label.toLowerCase()})`,
            })
          );

          questionsData.push({
            question,
            type: questionType,
            chart_type: "PieChart",
            allowed_chart: ["PieChart", "BarChartHorizontalCard"],
            participants_responded: participantsCount,
            data: booleanChartData,
            config: generateBooleanChartConfig(booleanChartData),
          });
          break;

        case "rating":
          // Find min and max ratings from responses
          const ratings = questionData.responses.map((response: any) =>
            parseInt(response.answer, 10)
          );
          const minRating = Math.min(...ratings);
          const maxRating = Math.max(...ratings);

          // Initialize rating data structure based on actual min/max
          const ratingData = [
            {
              category: "Évaluation",
              ...Object.fromEntries(
                Array.from({ length: maxRating - minRating + 1 }, (_, i) => {
                  const rating = minRating + i;
                  return [rating.toString(), 0];
                })
              ),
            },
          ];

          // Count ratings
          questionData.responses.forEach((response: any) => {
            const rating = response.answer.toString();
            if (
              ratingData[0]![rating as keyof (typeof ratingData)[0]] !==
              undefined
            ) {
              (ratingData[0] as any)[rating]++;
            }
          });

          // Generate config for actual rating range
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
            chart_type: "BarChartHorizontalStackedCard",
            allowed_chart: [
              "BarChartHorizontalStackedCard",
              "BarChartHorizontalCard",
              "LineChart",
              "BarChartVerticalCard",
            ],
            participants_responded: participantsCount,
            data: ratingData as unknown as Array<{
              label: string;
              value: number;
            }>,
            config: ratingConfig,
            primaryKeys: ratingKeys,
            min: minRating,
            max: maxRating,
          });
          break;

        case "file":
          questionsData.push({
            question,
            type: questionType,
            chart_type: "not implemented",
            allowed_chart: [],
            participants_responded: participantsCount,
            data: "not implemented",
            config: {},
          });
          break;

        default:
          questionsData.push({
            question,
            type: questionType,
            chart_type: "not implemented",
            allowed_chart: [],
            participants_responded: participantsCount,
            data: "not implemented",
            config: {},
          });
          break;
      }
    }
  );

  return questionsData;
}

export function convertPrismaSurveyToSurveyData(
  mission: PrismaMission
): SurveyData {
  if (!mission.survey || mission.survey.length === 0) {
    throw new Error("No survey found in mission");
  }

  const survey = mission.survey[0]; // Assuming one survey per mission
  const surveyResponses = survey?.response || [];

  if (!surveyResponses || surveyResponses.length === 0) {
    throw new Error("No responses found in survey");
  }

  // Initialize questions_responses structure
  const questionsResponses: Record<string, QuestionDataRaw> = {};

  // Get all unique questions from all responses and their types
  const allQuestions = new Map<string, QuestionType>();
  surveyResponses.forEach((response: PrismaSurveyResponse) => {
    const responseAnswers =
      typeof response.responses === "string"
        ? JSON.parse(response.responses)
        : response.responses;

    Object.entries(responseAnswers).forEach(
      ([question, questionData]: [string, any]) => {
        if (
          questionData &&
          typeof questionData === "object" &&
          questionData.type
        ) {
          allQuestions.set(question, questionData.type as QuestionType);
        }
      }
    );
  });

  // Initialize each question in questionsResponses
  allQuestions.forEach((questionType, question) => {
    questionsResponses[question] = {
      type: questionType,
      isRequired: false,
      responses: [],
    };
  });

  // Process survey responses
  surveyResponses.forEach((response: PrismaSurveyResponse) => {
    const responseAnswers =
      typeof response.responses === "string"
        ? JSON.parse(response.responses)
        : response.responses;

    // Parse location
    const location =
      typeof response.location === "string"
        ? JSON.parse(response.location)
        : response.location;

    const baseResponse = {
      response_id: response.id,
      location: {
        lat: location?.lat || 0,
        lng: location?.lng || location?.long || 0,
        label: location?.label || "Unknown",
      },
      age: response.age.toString(),
      sex:
        response.gender === "male" || response.gender === "female"
          ? (response.gender as "male" | "female")
          : "male", // default fallback
    };

    // Add each answer to its corresponding question
    Object.entries(responseAnswers).forEach(
      ([question, questionData]: [string, any]) => {
        if (
          questionsResponses[question] &&
          questionData &&
          typeof questionData === "object"
        ) {
          questionsResponses[question]!.responses.push({
            ...baseResponse,
            answer: questionData.answer as ResponseAnswer,
          });
        }
      }
    );
  });

  // Calculate metadata
  const uniqueLocations = [
    ...new Set(
      surveyResponses.map((r) => {
        const loc =
          typeof r.location === "string" ? JSON.parse(r.location) : r.location;
        return loc?.label || "Unknown";
      })
    ),
  ];

  const ages = surveyResponses.map((r) => r.age).filter((age) => age > 0);
  const ageRange =
    ages.length > 0
      ? `${Math.min(...ages)}-${Math.max(...ages)} years`
      : "Unknown";

  const genderCounts = surveyResponses.reduce(
    (acc, r) => {
      if (r.gender === "male") acc.male++;
      else if (r.gender === "female") acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

  // Create collection period (you might want to get this from createdAt timestamps)
  const collectionPeriod = "Recent responses"; // Placeholder

  const metadata: SurveyMetadata = {
    total_responses: surveyResponses.length,
    collection_period: collectionPeriod,
    locations_covered: uniqueLocations,
    age_range: ageRange,
    gender_distribution: genderCounts,
    response_rate: "100%", // Assuming all responses are valid
  };

  return {
    survey_title: survey?.name || mission.name,
    questions_responses: questionsResponses,
    metadata,
  };
}