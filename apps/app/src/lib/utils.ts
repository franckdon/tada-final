import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { VisualizationId } from "./chart-types";
import { getVisualizationSettingsForQuestionType, QuestionTypeDashboard } from "./question-vizualisation";
import { extractAllQuestionsDataWithConfig } from "./survey-chart-extractor";

export { extractAllQuestionsDataWithConfig } from "./survey-chart-extractor";


export function stripSpecialCharacters(inputString: string) {
  // Use a regular expression to replace all non-alphanumeric characters except hyphen, space, dot,and parentheses with an empty string
  return inputString?.replace(/[^a-zA-Z0-9\s.()-]/g, "");
}

type Locale = "en" | "fr";

export function timeAgo(date: Date, locale: Locale = "en"): string {
  const localeMap = {
    en: enUS,
    fr: fr,
  };

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: localeMap[locale],
  });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // biome-ignore lint/complexity/useArrowFunction: <explanation>
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function capitalizeFirstLetter(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isMac() {
  // Check the modern userAgentData API
  if (navigator.userAgent?.includes("Mac")) {
    return true;
  }

  // Fallback to the older navigator.platform API
  if (navigator.platform) {
    return navigator.platform?.toLowerCase().includes("mac");
  }

  // Final fallback: Parse the userAgent string
  if (navigator.userAgent) {
    return navigator.userAgent?.toLowerCase().includes("mac");
  }

  // Default to false if no information is available
  return false;
}

export function getNumericKeysDescending<
  T extends Record<string, string | number>
>(array: T[]): string[] {
  if (array.length === 0) return [];

  // Prendre le premier objet comme référence pour les clés
  const firstObject = array[0];

  // Filtrer les clés qui ont des valeurs numériques et créer des paires [clé, valeur]
  const numericKeyValuePairs = Object.entries(firstObject!)
    .filter(([_, value]) => typeof value === "number")
    .map(([key, value]) => ({ key, value: value as number }));

  // Trier par valeur décroissante et extraire les clés
  return numericKeyValuePairs
    .sort((a, b) => b.value - a.value)
    .map((item) => item.key);
}

interface Participant {
  sexe: string;
  age: string;
}

interface AgeGroupCount {
  age: string;
  male: number;
  female: number;
}

export function extractSexAndAge(surveyResponses: any): Participant[] {
  const sexAgeData: Participant[] = [];
  const processedIds = new Set<string>();

  // Iterate through all questions and their responses
  Object.values(surveyResponses.questions_responses).forEach(
    (question: any) => {
      question.responses.forEach((response: any) => {
        // Avoid duplicates by checking response_id
        if (!processedIds.has(response.response_id)) {
          sexAgeData.push({
            sexe: response.sex,
            age: response.age,
          });
          processedIds.add(response.response_id);
        }
      });
    }
  );

  return sexAgeData;
}

export function getAverageAge(participants: Participant[]): number {
  if (participants.length === 0) return 0;

  const validAges = participants
    .map((participant) => parseInt(participant.age, 10))
    .filter((age) => !isNaN(age));

  if (validAges.length === 0) return 0;

  const sum = validAges.reduce((total, age) => total + age, 0);
  return Math.round(sum / validAges.length); // Return as integer
}

const ageRanges = [
  "14-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65-99",
];

function findAgeRange(age: string): string | null {
  const numericAge = parseInt(age, 10);
  if (isNaN(numericAge)) return null;

  for (const range of ageRanges) {
    const [min, max] = range.split("-").map((num) => parseInt(num, 10));
    if (numericAge >= min! && numericAge <= max!) {
      return range;
    }
  }
  return null;
}

export function groupParticipantsByAge(
  participants: Participant[]
): AgeGroupCount[] {
  const ageMap: Record<string, { male: number; female: number }> = {};

  // Initialize all age ranges with zero counts
  for (const range of ageRanges) {
    ageMap[range] = { male: 0, female: 0 };
  }

  for (const { age, sexe } of participants) {
    const ageRange = findAgeRange(age);
    if (ageRange && (sexe === "male" || sexe === "female")) {
      ageMap[ageRange]![sexe]++;
    }
  }

  return Object.entries(ageMap)
    .filter(([, counts]) => counts.male > 0 || counts.female > 0)
    .map(([age, counts]) => ({
      age,
      male: counts.male,
      female: counts.female,
    }));
}

export interface QuestionData {
  question: string;
  type: string;
  chart_type: VisualizationId;
  allowed_chart: VisualizationId[];
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
  insights?: any;
  insightsUpdatedAt?: Date | null;
  chartId?: string;

  rawResponses?: any[];
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
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

export interface SurveyData {
  survey_title: string;
  questions_responses: Record<string, QuestionDataRaw>;
  metadata: SurveyMetadata;
}


interface StatisticalSummary {
  survey_info: {
    title: string;
    period: string;
    total_participants: number;
    locations: string[];
    response_rate: string;
  };
  demographics: {
    average_age: number;
    gender_distribution: {
      male_percentage: number;
      female_percentage: number;
    };
  };
  questions_stats: {
    dropdown: Array<{
      question: string;
      responses: Array<{
        option: string;
        count: number;
        percentage: number;
      }>;
    }>;
    boolean: Array<{
      question: string;
      yes_count: number;
      yes_percentage: number;
      no_count: number;
      no_percentage: number;
    }>;
    rating: Array<{
      question: string;
      average: number;
      min: number;
      max: number;
      distribution: Array<{
        rating: number;
        count: number;
        percentage: number;
      }>;
    }>;
    checkbox: Array<{
      question: string;
      total_selections: number;
      options: Array<{
        option: string;
        count: number;
        percentage: number;
      }>;
    }>;
    text_comment: Array<{
      question: string;
      type: "text" | "comment";
      response_count: number;
      sample_responses: string[];
      common_themes?: string[];
    }>;
  };
}

// Types pour les données de sondage
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

interface TextResponse extends BaseResponse {
  answer: string;
}

interface BooleanResponse extends BaseResponse {
  answer: boolean;
}

interface RatingResponse extends BaseResponse {
  answer: number;
}

interface CheckboxResponse extends BaseResponse {
  answer: string[];
}

interface FileResponse extends BaseResponse {
  answer: string;
}

type ResponseAnswer = string | boolean | number | string[];

interface SurveyResponse extends BaseResponse {
  answer: ResponseAnswer;
}

type QuestionType = QuestionTypeDashboard;

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

export function generateStatisticalSummary(
  surveyResponses: SurveyData
): StatisticalSummary {
  const questionsData = extractAllQuestionsDataWithConfig(surveyResponses);
  const participants = extractSexAndAge(surveyResponses);
  const averageAge = getAverageAge(participants);

  // Calculate gender distribution
  const maleCount = participants.filter((p) => p.sexe === "male").length;
  const femaleCount = participants.filter((p) => p.sexe === "female").length;
  const totalParticipants = surveyResponses.metadata.total_responses;

  const summary: StatisticalSummary = {
    survey_info: {
      title: surveyResponses.survey_title,
      period: surveyResponses.metadata.collection_period,
      total_participants: totalParticipants,
      locations: surveyResponses.metadata.locations_covered,
      response_rate: surveyResponses.metadata.response_rate,
    },
    demographics: {
      average_age: averageAge,
      gender_distribution: {
        male_percentage: Math.round((maleCount / totalParticipants) * 100),
        female_percentage: Math.round((femaleCount / totalParticipants) * 100),
      },
    },
    questions_stats: {
      dropdown: [],
      boolean: [],
      rating: [],
      checkbox: [],
      text_comment: [],
    },
  };

  // Process each question
  questionsData.forEach((question) => {
    switch (question.type as QuestionType) {
      case "dropdown": {
        const dropdownData = question.data as Array<{
          label: string;
          value: number;
        }>;
        summary.questions_stats.dropdown.push({
          question: question.question,
          responses: dropdownData.map((item) => ({
            option: item.label,
            count: item.value,
            percentage: Math.round(
              (item.value / question.participants_responded) * 100
            ),
          })),
        });
        break;
      }

      case "boolean": {
        const booleanData = question.data as Array<{
          label: string;
          value: number;
        }>;
        const yesData = booleanData.find((item) => item.label === "Oui");
        const noData = booleanData.find((item) => item.label === "Non");

        summary.questions_stats.boolean.push({
          question: question.question,
          yes_count: yesData?.value || 0,
          yes_percentage: Math.round(
            ((yesData?.value || 0) / question.participants_responded) * 100
          ),
          no_count: noData?.value || 0,
          no_percentage: Math.round(
            ((noData?.value || 0) / question.participants_responded) * 100
          ),
        });
        break;
      }

      case "rating": {
        const questionData =
          surveyResponses.questions_responses[question.question];
        const ratingResponses =
          questionData?.responses?.map((r: any) => parseInt(r.answer, 10)) ||
          [];

        if (ratingResponses.length === 0) break;

        const average =
          ratingResponses.reduce(
            (sum: number, rating: number) => sum + rating,
            0
          ) / ratingResponses.length;
        const min = Math.min(...ratingResponses);
        const max = Math.max(...ratingResponses);

        const ratingCounts: Record<number, number> = {};
        ratingResponses.forEach((rating: number) => {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });

        const distribution = Object.entries(ratingCounts).map(
          ([rating, count]) => ({
            rating: parseInt(rating, 10),
            count,
            percentage: Math.round((count / ratingResponses.length) * 100),
          })
        );

        summary.questions_stats.rating.push({
          question: question.question,
          average: Math.round(average * 100) / 100,
          min,
          max,
          distribution,
        });
        break;
      }

      case "checkbox": {
        const checkboxData = question.data as Array<{
          label: string;
          value: number;
        }>;
        const totalSelections = checkboxData.reduce(
          (sum, item) => sum + item.value,
          0
        );

        if (totalSelections === 0) {
          summary.questions_stats.checkbox.push({
            question: question.question,
            total_selections: 0,
            options: [],
          });
          break;
        }

        summary.questions_stats.checkbox.push({
          question: question.question,
          total_selections: totalSelections,
          options: checkboxData.map((item) => ({
            option: item.label,
            count: item.value,
            percentage: Math.round((item.value / totalSelections) * 100),
          })),
        });
        break;
      }

      case "text":
      case "comment": {
        const textData = question.data as string[];

        const sampleResponses = textData.slice(0, Math.min(5, textData.length));

        const commonThemes = extractCommonThemes(textData);

        summary.questions_stats.text_comment.push({
          question: question.question,
          type: question.type as "text" | "comment",
          response_count: textData.length,
          sample_responses: sampleResponses,
          common_themes: commonThemes,
        });
        break;
      }
    }
  });

  return summary;
}

// Helper function to extract common themes from text responses
function extractCommonThemes(responses: string[]): string[] {
  // Simple keyword extraction - can be enhanced
  const commonWords = [
    "qualité",
    "prix",
    "disponibilité",
    "goût",
    "marque",
    "distribution",
    "promotion",
  ];
  const themes: string[] = [];

  commonWords.forEach((word) => {
    const count = responses.filter((response) =>
      response.toLowerCase().includes(word.toLowerCase())
    ).length;

    if (count >= Math.ceil(responses.length * 0.2)) {
      // If word appears in 20%+ of responses
      themes.push(word);
    }
  });

  return themes;
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

export function convertPrismaSurveyToSurveyData(
  mission: PrismaMission
): SurveyData {
  if (!mission.survey || mission.survey.length === 0) {
    throw new Error("No survey found in mission");
  }

  const survey = mission.survey[0]; 
  const surveyResponses = survey?.response || [];

  if (!surveyResponses || surveyResponses.length === 0) {
    return {
      survey_title: survey?.name || mission.name,
      questions_responses: {},
      metadata: {
        total_responses: 0,
        collection_period: "N/A",
        locations_covered: [],
        age_range: "N/A",
        gender_distribution: { male: 0, female: 0 },
        response_rate: "0%",
      },
    };
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
      const rawType = String(questionData.type).toLowerCase();

      let normalizedType: QuestionType;
      switch (rawType) {
        case "dropdown":
        case "radiogroup":
          normalizedType = "dropdown";
          break;
        case "text":
          normalizedType = "text";
          break;
        case "checkbox":
          normalizedType = "checkbox";
          break;
        case "comment":
          normalizedType = "comment";
          break;
        case "boolean":
          normalizedType = "boolean";
          break;
        case "rating":
          normalizedType = "rating";
          break;
        case "file":
          normalizedType = "file";
          break;
        default:
          normalizedType = "file";
          break;
      }

      allQuestions.set(question, normalizedType);
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
