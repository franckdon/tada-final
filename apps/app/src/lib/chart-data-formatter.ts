// Utilitaires pour reformater les données et config des graphiques en temps réel

interface SurveyResponseRaw {
  id: string;
  responses: any; // JSON string ou object
  age: number;
  gender: string;
  location: any; // JSON
  status: string;
}

// ------------------------------------------------------
// ✅ Normalisation des types venant de MissionChart
// (tes chartData.type = "single_choice", etc.)
// ------------------------------------------------------
function normalizeQuestionType(input: string): string {
  const t = String(input || "").toLowerCase().trim();

  // single choice
  if (t === "single_choice" || t === "single" || t === "radio" || t === "select")
    return "dropdown";

  // multi choice
  if (
    t === "multiple_choice" ||
    t === "multi_choice" ||
    t === "multiple" ||
    t === "multiselect"
  )
    return "checkbox";

  // déjà OK
  return t;
}

// Normalise pour matcher les clés (accents/espaces/apostrophes)
function normalizeKey(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // enlève accents
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'"); // apostrophe uniforme
}

// ------------------------------------------------------
// ✅ Extraction robuste d'une question :
// - supporte responsesData[title] = { type, answer }
// - supporte responsesData[title] = primitive/array (legacy)
// - supporte mismatch léger de clé via normalizeKey
// ------------------------------------------------------
export function extractResponsesForQuestion(
  surveyResponses: SurveyResponseRaw[],
  questionTitle: string,
): Array<{ answer: any; age: number; gender: string; location: any; responseId: string }> {
  const questionResponses: Array<{
    answer: any;
    age: number;
    gender: string;
    location: any;
    responseId: string;
  }> = [];

  const wantedKey = normalizeKey(questionTitle);

  surveyResponses.forEach((response) => {
    try {
      const responsesData =
        typeof response.responses === "string"
          ? JSON.parse(response.responses)
          : response.responses;

      if (!responsesData || typeof responsesData !== "object") return;

      // 1) match exact
      let hitKey: string | null = null;
      if (questionTitle in responsesData) hitKey = questionTitle;

      // 2) match normalisé (si pas exact)
      if (!hitKey) {
        for (const k of Object.keys(responsesData)) {
          if (normalizeKey(k) === wantedKey) {
            hitKey = k;
            break;
          }
        }
      }

      if (!hitKey) return;

      const raw = (responsesData as any)[hitKey];

      // ✅ support {type, answer} ou valeur brute
      const answer =
        raw && typeof raw === "object" && "answer" in raw ? (raw as any).answer : raw;

      // ignore vides
      if (answer === null || typeof answer === "undefined") return;
      if (typeof answer === "string" && !answer.trim()) return;
      if (Array.isArray(answer) && answer.length === 0) return;

      questionResponses.push({
        answer,
        age: response.age,
        gender: response.gender,
        location:
          typeof response.location === "string"
            ? JSON.parse(response.location)
            : response.location,
        responseId: response.id,
      });
    } catch (error) {
      console.warn(`Erreur parsing response ${response.id}:`, error);
    }
  });

  return questionResponses;
}

// ------------------------------------------------------
// ✅ Format chart data
// - gère single_choice en le mappant sur dropdown
// - gère multiple_choice en le mappant sur checkbox
// ------------------------------------------------------
export function formatChartDataFromResponses(
  questionResponses: Array<{
    answer: any;
    age: number;
    gender: string;
    location: any;
    responseId: string;
  }>,
  questionType: string,
): any[] {
  if (!questionResponses || questionResponses.length === 0) return [];

  const t = normalizeQuestionType(questionType);

  // Base Appinio: % calculé sur le nombre de répondants à la question
  const baseRespondents = questionResponses.length;

  const safePct = (count: number, base: number) => (base > 0 ? (count / base) * 100 : 0);

  switch (t) {
    case "dropdown": {
      const counts: Record<string, number> = {};
      questionResponses.forEach((r) => {
        const a = String(r.answer ?? "").trim();
        if (!a) return;
        counts[a] = (counts[a] || 0) + 1;
      });

      return Object.entries(counts).map(([label, value]) => ({
        label,
        value,
        percent: safePct(value, baseRespondents),
        base: baseRespondents,
      }));
    }

    case "checkbox": {
      const counts: Record<string, number> = {};
      questionResponses.forEach((r) => {
        const arr = Array.isArray(r.answer) ? r.answer : [r.answer];
        arr.forEach((a) => {
          const key = String(a ?? "").trim();
          if (!key) return;
          counts[key] = (counts[key] || 0) + 1;
        });
      });

      return Object.entries(counts).map(([label, value]) => ({
        label,
        value,
        percent: safePct(value, baseRespondents),
        base: baseRespondents,
      }));
    }

    case "boolean": {
      const counts: Record<"Oui" | "Non", number> = { Oui: 0, Non: 0 };
      questionResponses.forEach((r) => {
        counts[r.answer ? "Oui" : "Non"]++;
      });

      return (Object.entries(counts) as Array<[string, number]>).map(([label, value]) => ({
        label,
        value,
        percent: safePct(value, baseRespondents),
        base: baseRespondents,
      }));
    }

    case "rating": {
      const ratings = questionResponses
        .map((r) => {
          const n = typeof r.answer === "number" ? r.answer : parseInt(String(r.answer), 10);
          return Number.isFinite(n) ? n : NaN;
        })
        .filter((n) => !Number.isNaN(n));

      if (!ratings.length) return [];

      const counts: Record<number, number> = {};
      ratings.forEach((n) => (counts[n] = (counts[n] || 0) + 1));
      const base = ratings.length;

      return Object.entries(counts)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([rating, value]) => ({
          label: `${rating} étoile${Number(rating) > 1 ? "s" : ""}`,
          value,
          percent: safePct(value, base),
          base,
          rating: Number(rating),
        }));
    }

    case "file":
    case "text":
    case "comment": {
      // renvoie une liste de strings (ou paths)
      return questionResponses
        .map((r) => r.answer)
        .flatMap((a) => (Array.isArray(a) ? a : [a]))
        .map((v) => String(v ?? "").trim())
        .filter((s) => s.length > 0);
    }

    default:
      return [];
  }
}

// ------------------------------------------------------
// ✅ Config chart
// Important: au minimum `value` doit exister
// ------------------------------------------------------
export function generateChartConfigFromData(
  data: Array<{ label: string; value: number }> | string[] | any[],
  questionType: string,
): Record<string, { label: string; color: string }> {
  const t = normalizeQuestionType(questionType);
  const config: Record<string, { label: string; color: string }> = {};

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

  // ✅ série principale utilisée par tes BarChartCard/HorizontalCard: primaryDataKey="value"
  config.value = { label: "value", color: "hsl(var(--chart-1))" };

  switch (t) {
    case "dropdown":
    case "checkbox":
    case "rating":
    case "boolean":
      // on peut laisser uniquement config.value (suffit pour afficher)
      // si tu veux des couleurs par catégorie pour pie, tu peux étendre ici.
      return config;

    default:
      return config;
  }
}

// Fonction utilitaire pour extraire les clés primaires (pour les ratings)
export function extractPrimaryKeysFromRatingData(data: any[]): string[] {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") return [];

  const ratingData = data[0] as any;
  return Object.keys(ratingData)
    .filter((key) => key !== "category" && !isNaN(Number(key)))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

// Fonction utilitaire pour extraire min/max des ratings
export function extractRatingRange(data: any[]): { min: number; max: number } {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    return { min: 0, max: 10 };
  }

  const ratingData = data[0] as any;
  const ratings = Object.keys(ratingData)
    .filter((key) => key !== "category" && !isNaN(Number(key)))
    .map((key) => parseInt(key, 10));

  return { min: Math.min(...ratings), max: Math.max(...ratings) };
}
