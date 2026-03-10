import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { VisualizationId } from "./chart-types";
import type { QuestionTypeDashboard } from "./question-vizualisation";
import { extractAllQuestionsDataWithConfig } from "./survey-chart-extractor";

export { extractAllQuestionsDataWithConfig } from "./survey-chart-extractor";

/* ---------------------------------- Basics --------------------------------- */

export function stripSpecialCharacters(inputString: string) {
  return inputString?.replace(/[^a-zA-Z0-9\s.()-]/g, "");
}

type Locale = "en" | "fr";

export function timeAgo(date: Date, locale: Locale = "en"): string {
  const localeMap = { en: enUS, fr };
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: localeMap[locale],
  });
}

// biome-ignore lint/suspicious/noExplicitAny: legacy
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
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
  if (typeof navigator === "undefined") return false;

  if (navigator.userAgent?.includes("Mac")) return true;
  if (navigator.platform) return navigator.platform.toLowerCase().includes("mac");
  if (navigator.userAgent) return navigator.userAgent.toLowerCase().includes("mac");
  return false;
}

export function getNumericKeysDescending<
  T extends Record<string, string | number>,
>(array: T[]): string[] {
  if (array.length === 0) return [];
  const firstObject = array[0];
  const numericKeyValuePairs = Object.entries(firstObject!)
    .filter(([_, value]) => typeof value === "number")
    .map(([key, value]) => ({ key, value: value as number }));

  return numericKeyValuePairs.sort((a, b) => b.value - a.value).map((item) => item.key);
}

/* -------------------------- Participants / Demog --------------------------- */

interface Participant {
  sexe: "male" | "female" | "unknown";
  age: string;
}

interface AgeGroupCount {
  age: string;
  male: number;
  female: number;
}

export function extractSexAndAge(
  surveyResponses: SurveyData | null | undefined,
): Participant[] {
  if (!surveyResponses?.questions_responses) return [];

  const sexAgeData: Participant[] = [];
  const processedIds = new Set<string>();

  Object.values(surveyResponses.questions_responses).forEach((question: any) => {
    (question?.responses ?? []).forEach((response: any) => {
      if (!response?.response_id) return;
      if (!processedIds.has(response.response_id)) {
        sexAgeData.push({
          sexe: response.sex ?? "unknown",
          age: response.age ?? "",
        });
        processedIds.add(response.response_id);
      }
    });
  });

  return sexAgeData;
}

export function getAverageAge(participants: Participant[]): number {
  if (participants.length === 0) return 0;

  const validAges = participants
    .map((p) => parseInt(p.age, 10))
    .filter((age) => !Number.isNaN(age));

  if (validAges.length === 0) return 0;

  const sum = validAges.reduce((total, age) => total + age, 0);
  return Math.round(sum / validAges.length);
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
  if (Number.isNaN(numericAge)) return null;

  for (const range of ageRanges) {
    const [min, max] = range.split("-").map((n) => parseInt(n, 10));
    if (numericAge >= (min ?? 0) && numericAge <= (max ?? 999)) return range;
  }

  return null;
}

export function groupParticipantsByAge(
  participants: Participant[],
): AgeGroupCount[] {
  const ageMap: Record<string, { male: number; female: number }> = {};
  for (const range of ageRanges) {
    ageMap[range] = { male: 0, female: 0 };
  }

  for (const { age, sexe } of participants) {
    const ageRange = findAgeRange(age);
    if (!ageRange) continue;
    if (sexe !== "male" && sexe !== "female") continue;

    ageMap[ageRange]![sexe] += 1;
  }

  return Object.entries(ageMap)
    .filter(([, counts]) => counts.male > 0 || counts.female > 0)
    .map(([age, counts]) => ({
      age,
      male: counts.male,
      female: counts.female,
    }));
}

/* --------------------------------- Charts --------------------------------- */

export interface QuestionData {
  question: string;
  type: string;
  chart_type: VisualizationId;
  allowed_chart: VisualizationId[];
  participants_responded: number;
  data:
    | Array<{ label: string; value: number }>
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

export interface ChartConfig {
  [key: string]: { label: string; color: string };
}

export function generateChartConfig(
  data: Array<{ label: string; value: number }>,
): ChartConfig {
  const config: ChartConfig = {};
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
        colorVariables[index % colorVariables.length] ||
        "hsl(var(--chart-1))",
    };
  });

  config.value = { label: "value", color: "hsl(var(--chart-1))" };
  return config;
}

export function generateBooleanChartConfig(
  data: Array<{ label: string; value: number }>,
): ChartConfig {
  const config: ChartConfig = {};
  data.forEach((item) => {
    const key = item.label.toLowerCase();
    const color =
      item.label === "Oui" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))";
    config[item.label] = { label: item.label, color };
    config[key] = { label: item.label, color };
  });
  config.value = { label: "value", color: "hsl(var(--chart-1))" };
  return config;
}

/* -------------------------- Survey normalized model ------------------------- */

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
    gender_distribution: { male_percentage: number; female_percentage: number };
  };
  questions_stats: {
    dropdown: Array<{
      question: string;
      responses: Array<{ option: string; count: number; percentage: number }>;
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
      distribution: Array<{ rating: number; count: number; percentage: number }>;
    }>;
    checkbox: Array<{
      question: string;
      total_selections: number;
      options: Array<{ option: string; count: number; percentage: number }>;
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

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface BaseResponse {
  response_id: string;
  location: Location;
  age: string;
  sex: "male" | "female" | "unknown";
}

type ResponseAnswer = string | boolean | number | string[] | null;

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
  gender_distribution: { male: number; female: number };
  response_rate: string;
}

/* ------------------------------ Summary helper ----------------------------- */

export function generateStatisticalSummary(
  surveyResponses: SurveyData,
): StatisticalSummary {
  const questionsData = extractAllQuestionsDataWithConfig(surveyResponses);
  const participants = extractSexAndAge(surveyResponses);
  const validParticipants = participants.filter((p) => {
    const age = parseInt(p.age, 10);
    return (
      (p.sexe === "male" || p.sexe === "female") && !Number.isNaN(age)
    );
  });

  const averageAge = getAverageAge(validParticipants);

  const maleCount = validParticipants.filter((p) => p.sexe === "male").length;
  const femaleCount = validParticipants.filter((p) => p.sexe === "female").length;
  const totalParticipants = validParticipants.length;

  const safePct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0;

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
        male_percentage: safePct(maleCount, totalParticipants),
        female_percentage: safePct(femaleCount, totalParticipants),
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
            percentage: safePct(item.value, question.participants_responded),
          })),
        });
        break;
      }

      case "boolean": {
        const booleanData = question.data as Array<{
          label: string;
          value: number;
        }>;
        const yes = booleanData.find((i) => i.label === "Oui")?.value ?? 0;
        const no = booleanData.find((i) => i.label === "Non")?.value ?? 0;

        summary.questions_stats.boolean.push({
          question: question.question,
          yes_count: yes,
          yes_percentage: safePct(yes, question.participants_responded),
          no_count: no,
          no_percentage: safePct(no, question.participants_responded),
        });
        break;
      }

      case "rating": {
        const q = surveyResponses.questions_responses[question.question];
        const ratingValues =
          q?.responses
            ?.map((r: any) =>
              typeof r.answer === "number"
                ? r.answer
                : parseInt(String(r.answer ?? ""), 10),
            )
            .filter((n: number) => !Number.isNaN(n)) ?? [];

        if (ratingValues.length === 0) break;

        const avg =
          ratingValues.reduce((sum: number, v: number) => sum + v, 0) /
          ratingValues.length;
        const min = Math.min(...ratingValues);
        const max = Math.max(...ratingValues);

        const counts: Record<number, number> = {};
        ratingValues.forEach((v) => {
          counts[v] = (counts[v] || 0) + 1;
        });

        const distribution = Object.entries(counts).map(([rating, count]) => ({
          rating: parseInt(rating, 10),
          count,
          percentage: safePct(count, ratingValues.length),
        }));

        summary.questions_stats.rating.push({
          question: question.question,
          average: Math.round(avg * 100) / 100,
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
          0,
        );

        summary.questions_stats.checkbox.push({
          question: question.question,
          total_selections: totalSelections,
          options:
            totalSelections > 0
              ? checkboxData.map((item) => ({
                  option: item.label,
                  count: item.value,
                  percentage: safePct(item.value, totalSelections),
                }))
              : [],
        });
        break;
      }

      case "text":
      case "comment": {
        const textData = (question.data as string[]) ?? [];
        const sample = textData.slice(0, Math.min(5, textData.length));
        const themes = extractCommonThemes(textData);

        summary.questions_stats.text_comment.push({
          question: question.question,
          type: question.type as "text" | "comment",
          response_count: textData.length,
          sample_responses: sample,
          common_themes: themes,
        });
        break;
      }

      default:
        break;
    }
  });

  return summary;
}

function extractCommonThemes(responses: string[]): string[] {
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
    const count = responses.filter((r) =>
      r.toLowerCase().includes(word.toLowerCase()),
    ).length;
    if (responses.length > 0 && count >= Math.ceil(responses.length * 0.2)) {
      themes.push(word);
    }
  });

  return themes;
}

/* ----------------------------- Prisma input types -------------------------- */

interface PrismaSurveyResponse {
  id: string;
  responses: any;
  age: number | null;
  gender: string | null;
  location: any;
  status: string;
  createdAt?: Date | string | null;
}

interface PrismaSurvey {
  id: string;
  name: string;
  questions: any;
  responses: PrismaSurveyResponse[];
}

interface PrismaMission {
  id: string;
  name: string;
  surveys: PrismaSurvey[];
}

/* -------------------------- Normalization utilities ------------------------ */

function safeJsonParse<T = any>(value: any, fallback: T): T {
  try {
    if (typeof value === "string") return JSON.parse(value) as T;
    if (value && typeof value === "object") return value as T;
    return fallback;
  } catch {
    return fallback;
  }
}

function normalizeQuestionType(raw: unknown): QuestionType {
  const t = String(raw ?? "").toLowerCase();

  if (t === "radiogroup" || t === "dropdown" || t === "select") {
    return "dropdown";
  }
  if (t === "checkbox" || t === "multiple") return "checkbox";
  if (t === "rating" || t === "nps") return "rating";
  if (t === "comment" || t === "textarea") return "comment";
  if (t === "text" || t === "input") return "text";
  if (t === "boolean" || t === "switch") return "boolean";
  if (t === "file" || t === "image") return "file";

  return "text";
}

function extractQuestionsFromSurveyJS(
  questionsJson: any,
): Array<{ label: string; type: QuestionType; isRequired?: boolean }> {
  const out: Array<{
    label: string;
    type: QuestionType;
    isRequired?: boolean;
  }> = [];

  const pages = Array.isArray(questionsJson?.pages) ? questionsJson.pages : [];
  for (const p of pages) {
    const elements = Array.isArray(p?.elements) ? p.elements : [];
    for (const el of elements) {
      if (!el) continue;
      const label = (el.title || el.name || "").toString().trim();
      if (!label) continue;

      out.push({
        label,
        type: normalizeQuestionType(el.type),
        isRequired: Boolean(el.isRequired),
      });
    }
  }

  if (out.length === 0 && Array.isArray(questionsJson?.elements)) {
    for (const el of questionsJson.elements) {
      const label = (el?.title || el?.name || "").toString().trim();
      if (!label) continue;
      out.push({
        label,
        type: normalizeQuestionType(el.type),
        isRequired: Boolean(el.isRequired),
      });
    }
  }

  return out;
}

function unwrapAnswer(questionData: any): ResponseAnswer {
  if (questionData == null) return null;

  if (typeof questionData === "object" && !Array.isArray(questionData)) {
    if ("answer" in questionData) return (questionData as any).answer as ResponseAnswer;
    if ("value" in questionData) return (questionData as any).value as ResponseAnswer;
  }

  if (Array.isArray(questionData)) return questionData as any;
  if (typeof questionData === "string") return questionData;
  if (typeof questionData === "number") return questionData;
  if (typeof questionData === "boolean") return questionData;

  return String(questionData);
}

function normalizeLocation(locRaw: any): Location {
  const loc = safeJsonParse<any>(locRaw, {});
  const lat = typeof loc?.lat === "number" ? loc.lat : 0;
  const lng =
    typeof loc?.lng === "number"
      ? loc.lng
      : typeof loc?.long === "number"
        ? loc.long
        : typeof loc?.longitude === "number"
          ? loc.longitude
          : 0;

  const label = (loc?.label || loc?.name || "Unknown").toString();
  return { lat, lng, label };
}

function normalizeGender(g: any): "male" | "female" | "unknown" {
  const s = String(g ?? "").trim().toLowerCase();

  if (s === "male" || s === "m" || s === "homme") return "male";
  if (s === "female" || s === "f" || s === "femme") return "female";

  return "unknown";
}

function normalizeAge(a: any): string {
  const n = typeof a === "number" ? a : parseInt(String(a ?? ""), 10);
  return Number.isNaN(n) ? "" : String(n);
}

function normKey(s: string): string {
  return stripSpecialCharacters(String(s ?? "")).trim().toLowerCase();
}

function findMatchingAnswerKey(
  answers: Record<string, any>,
  questionLabel: string,
): string | null {
  if (questionLabel in answers) return questionLabel;

  const target = normKey(questionLabel);
  const keys = Object.keys(answers);
  for (const k of keys) {
    if (normKey(k) === target) return k;
  }
  return null;
}

/* ---------------------- ✅ MAIN: Prisma -> SurveyData ---------------------- */

export function convertPrismaSurveyToSurveyData(
  mission: PrismaMission,
): SurveyData {
  if (!mission?.surveys?.length) {
    throw new Error("No survey found in mission");
  }

  const survey = mission.surveys[0]!;
  const surveyResponses = Array.isArray(survey.responses) ? survey.responses : [];

  const questionsJson = safeJsonParse<any>(survey.questions, {});
  const questionsFromSchema = extractQuestionsFromSurveyJS(questionsJson);

  const questionsResponses: Record<string, QuestionDataRaw> = {};
  for (const q of questionsFromSchema) {
    questionsResponses[q.label] = {
      type: q.type,
      isRequired: q.isRequired ?? false,
      responses: [],
    };
  }

  if (questionsFromSchema.length === 0) {
    for (const r of surveyResponses) {
      const answers = safeJsonParse<Record<string, any>>(r.responses, {});
      Object.keys(answers).forEach((k) => {
        if (!questionsResponses[k]) {
          const v = unwrapAnswer(answers[k]);
          const inferred: QuestionType =
            typeof v === "boolean"
              ? "boolean"
              : typeof v === "number"
                ? "rating"
                : Array.isArray(v)
                  ? "checkbox"
                  : "text";

          questionsResponses[k] = {
            type: inferred,
            isRequired: false,
            responses: [],
          };
        }
      });
    }
  }

  for (const r of surveyResponses) {
    const answers = safeJsonParse<Record<string, any>>(r.responses, {});
    const location = normalizeLocation(r.location);

    const baseResponse: BaseResponse = {
      response_id: r.id,
      location,
      age: normalizeAge(r.age),
      sex: normalizeGender(r.gender),
    };

    for (const questionLabel of Object.keys(questionsResponses)) {
      const answerKey = findMatchingAnswerKey(answers, questionLabel);
      if (!answerKey) continue;

      const raw = answers[answerKey];
      const answer = unwrapAnswer(raw);

      if (answer == null) continue;
      if (typeof answer === "string" && answer.trim() === "") continue;
      if (Array.isArray(answer) && answer.length === 0) continue;

      questionsResponses[questionLabel]!.responses.push({
        ...baseResponse,
        answer,
      });
    }
  }

  const uniqueResponseIds = new Set<string>();
  for (const q of Object.values(questionsResponses)) {
    for (const r of q.responses) uniqueResponseIds.add(r.response_id);
  }
  const totalResponses = uniqueResponseIds.size || surveyResponses.length;

  const uniqueLocations = Array.from(
    new Set(
      surveyResponses.map((r) => {
        const loc = normalizeLocation(r.location);
        return loc.label || "Unknown";
      }),
    ),
  );

  const ages = surveyResponses
    .map((r) =>
      typeof r.age === "number"
        ? r.age
        : parseInt(String(r.age ?? ""), 10),
    )
    .filter((n) => !Number.isNaN(n) && n > 0);

  const ageRange = ages.length
    ? `${Math.min(...ages)}-${Math.max(...ages)} years`
    : "Unknown";

  const genderCounts = surveyResponses.reduce(
    (acc, r) => {
      const g = normalizeGender(r.gender);
      if (g === "male") acc.male += 1;
      else if (g === "female") acc.female += 1;
      return acc;
    },
    { male: 0, female: 0 },
  );

  const dates = surveyResponses
    .map((r) => (r.createdAt ? new Date(r.createdAt as any) : null))
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const collectionPeriod =
    dates.length >= 2
      ? `${dates[0].toISOString()} to ${dates[dates.length - 1].toISOString()}`
      : "N/A";

  const metadata: SurveyMetadata = {
    total_responses: totalResponses,
    collection_period: collectionPeriod,
    locations_covered: uniqueLocations,
    age_range: ageRange,
    gender_distribution: genderCounts,
    response_rate: totalResponses > 0 ? "100%" : "0%",
  };

  return {
    survey_title: survey?.name || mission.name,
    questions_responses: questionsResponses,
    metadata,
  };
}