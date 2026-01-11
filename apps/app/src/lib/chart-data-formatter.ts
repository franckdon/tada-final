// Utilitaires pour reformater les données et config des graphiques en temps réel

interface SurveyResponseRaw {
  id: string;
  responses: any; // JSON string ou object
  age: number;
  gender: string;
  location: any; // JSON
  status: string;
}

// Fonction pour extraire toutes les réponses d'une question spécifique
export function extractResponsesForQuestion(
  surveyResponses: SurveyResponseRaw[],
  questionTitle: string
): Array<{ answer: any; age: number; gender: string; location: any; responseId: string }> {
  const questionResponses: Array<{
    answer: any;
    age: number;
    gender: string;
    location: any;
    responseId: string;
  }> = [];

  surveyResponses.forEach((response) => {
    try {
      // Parser le JSON des réponses
      const responsesData = typeof response.responses === 'string' 
        ? JSON.parse(response.responses) 
        : response.responses;

      // Chercher la question spécifique
      if (responsesData[questionTitle]) {
        const questionData = responsesData[questionTitle];
        
        questionResponses.push({
          answer: questionData.answer,
          age: response.age,
          gender: response.gender,
          location: typeof response.location === 'string' 
            ? JSON.parse(response.location) 
            : response.location,
          responseId: response.id,
        });
      }
    } catch (error) {
      // Skip les réponses qui ne peuvent pas être parsées
      console.warn(`Erreur parsing response ${response.id}:`, error);
    }
  });

  return questionResponses;
}

// Reformate les données d'une question pour l'affichage en graphique
export function formatChartDataFromResponses(
  questionResponses: Array<{
    answer: any;
    age: number;
    gender: string;
    location: any;
    responseId: string;
  }>,
  questionType: string
): any[] {
  if (!questionResponses || questionResponses.length === 0) {
    return [];
  }

  // Base Appinio: % calculé sur le nombre de répondants à la question
  const baseRespondents = questionResponses.length;

  const safePct = (count: number, base: number) =>
    base > 0 ? (count / base) * 100 : 0;

  switch (questionType) {
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
        (Array.isArray(r.answer) ? r.answer : [r.answer]).forEach((a) => {
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

      return (Object.entries(counts) as Array<[string, number]>).map(
        ([label, value]) => ({
          label,
          value,
          percent: safePct(value, baseRespondents),
          base: baseRespondents,
          fill: `var(--color-${label.toLowerCase()})`,
        })
      );
  }

    case "rating": {
      const ratings = questionResponses
        .map((r) => parseInt(String(r.answer), 10))
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

    case "text":
    case "comment":
      return questionResponses
        .map((response) => String(response.answer))
        .filter((answer) => answer && answer.trim().length > 0);

    default:
      return [];
  }
}


// Génère la config des couleurs pour un graphique
export function generateChartConfigFromData(
  data: Array<{ label: string; value: number }> | string[] | any[],
  questionType: string
): Record<string, { label: string; color: string }> {
  const config: Record<string, { label: string; color: string }> = {};

  // Couleurs prédéfinies
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

  switch (questionType) {
    case "dropdown":
    case "checkbox":
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'label' in data[0]) {
        (data as Array<{ label: string; value: number }>).forEach((item, index) => {
          config[item.label] = {
            label: item.label,
            color: colorVariables[index % colorVariables.length] || "hsl(var(--chart-1))",
          };
        });
      }
      break;

    case "boolean":
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'label' in data[0]) {
        (data as Array<{ label: string; value: number }>).forEach((item) => {
          const colorKey = item.label.toLowerCase();
          config[item.label] = {
            label: item.label,
            color: item.label === "Oui" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
          };
          // Ajouter aussi la version lowercase pour les CSS variables
          config[colorKey] = {
            label: item.label,
            color: item.label === "Oui" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
          };
        });
      }
      break;

        case "rating":
      // Nouvelle forme : data = [{ label: "3 étoiles", value, percentage, rating }, ...]
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0] === "object" &&
        "label" in data[0]
      ) {
        (data as Array<{ label: string }>).forEach((item, index) => {
          config[item.label] = {
            label: item.label,
            color:
              colorVariables[index % colorVariables.length] ||
              "hsl(var(--chart-1))",
          };
        });
      }
      break;


    case "text":
    case "comment":
      // Pour les réponses textuelles, pas de config de couleurs nécessaire
      break;

    default:
      break;
  }

  // Ajouter toujours une config par défaut pour "value"
  config.value = {
    label: "value",
    color: "hsl(var(--chart-1))",
  };

  return config;
}

// Fonction utilitaire pour extraire les clés primaires (pour les ratings)
export function extractPrimaryKeysFromRatingData(data: any[]): string[] {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    return [];
  }

  const ratingData = data[0] as any;
  return Object.keys(ratingData)
    .filter(key => key !== 'category' && !isNaN(Number(key)))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

// Fonction utilitaire pour extraire min/max des ratings
export function extractRatingRange(data: any[]): { min: number; max: number } {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') {
    return { min: 0, max: 10 };
  }

  const ratingData = data[0] as any;
  const ratings = Object.keys(ratingData)
    .filter(key => key !== 'category' && !isNaN(Number(key)))
    .map(key => parseInt(key, 10));

  return {
    min: Math.min(...ratings),
    max: Math.max(...ratings),
  };
}