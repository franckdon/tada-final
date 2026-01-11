// src/lib/survey-mapper.ts
import {
  type Survey,
  type SurveyQuestion,
} from "@/context/surveys-builder-context";

const NATIVE_SURVEYJS_TYPES = new Set([
  "text",
  "comment",
  "radiogroup",
  "checkbox",
  "dropdown",
  "rating",
  "matrix",
  "boolean",
  "ranking",
  "file",
  "html",
  "image",
  "imagepicker",
]);

function mapQuestionToSurveyJS(question: SurveyQuestion): any {
  const base = {
    name: question.name,
    title: question.title,
    description: question.description,
    isRequired: question.isRequired ?? false,
    visibleIf: question.visibleIf,
    enableIf: question.enableIf,
    requiredIf: question.requiredIf,
  };

  // 1️⃣ Si la question vient d’un ancien builder déjà en types SurveyJS, on la laisse passer
  if (!question.category && NATIVE_SURVEYJS_TYPES.has(question.type)) {
    return {
      ...question,
      ...base,
    };
  }

  // 2️⃣ Sinon on mappe selon category/type métier
  const category = question.category ?? (question.type as any);

  switch (category) {
    //
    // SINGLE CHOICE → radiogroup
    //
    case "single_choice":
      return {
        ...base,
        type: "radiogroup",
        choices: question.choices ?? [],
        hasOther: question.hasOther ?? false,
        otherText: question.otherText,
      };

    //
    // MULTIPLE CHOICE → checkbox
    //
    case "multiple_choice":
      return {
        ...base,
        type: "checkbox",
        choices: question.choices ?? [],
        hasOther: question.hasOther ?? false,
        otherText: question.otherText,
      };

    //
    // RANKING → ranking
    //
    case "ranking":
      return {
        ...base,
        type: "ranking",
        choices: question.choices ?? [],
      };

    //
    // LIKERT → rating (1–5 avec libellés)
    //
    case "likert":
      return {
        ...base,
        type: "rating",
        rateMin: question.rateMin ?? 1,
        rateMax: question.rateMax ?? 5,
        minRateDescription: question.minRateDescription,
        maxRateDescription: question.maxRateDescription,
        displayRateDescriptionsAsExtremes:
          question.displayRateDescriptionsAsExtremes ?? true,
      };

    //
    // NUMERIC SCALE → rating numérique (1–10 par ex)
    //
    case "numeric_scale":
      return {
        ...base,
        type: "rating",
        rateMin: question.min ?? question.rateMin ?? 1,
        rateMax: question.max ?? question.rateMax ?? 10,
      };

    //
    // SLIDER → rating avec renderAs: "slider"
    //
    case "slider":
      return {
        ...base,
        type: "rating",
        rateMin: question.min ?? 0,
        rateMax: question.max ?? 100,
        step: question.step ?? 1,
        // SurveyJS supporte rating.renderAs = "slider"
        renderAs: "slider",
      };

    //
    // OPEN → comment (texte long)
    //
    case "open":
      return {
        ...base,
        type: "comment",
        maxLength: question.maxLength ?? 500,
        placeholder: question.placeholder,
      };

    //
    // RATING → rating classique
    //
    case "rating":
      return {
        ...base,
        type: "rating",
        rateMin: question.rateMin ?? 1,
        rateMax: question.rateMax ?? 5,
        minRateDescription: question.minRateDescription,
        maxRateDescription: question.maxRateDescription,
      };

    //
    // MATRIX → matrix
    //
    case "matrix":
      return {
        ...base,
        type: "matrix",
        rows: question.rows ?? [],
        columns: question.columns ?? [],
      };

    //
    // IMAGE RANKING → ranking
    //
    case "image_ranking":
      return {
        ...base,
        type: "ranking",
        choices:
          question.choices ??
          (question.imageChoices ?? []).map((c) => c.value),
        imageChoices: question.imageChoices,
      };
    //
    // SECTION → html (titre + description)
    //

    case "media":
      return {
        ...base,
        type: "media", 
        category: "media",

        mediaMode: question.mediaMode,
        mediaTypes: question.mediaTypes ?? [],

        // upload
        maxFiles: question.maxFiles,
        maxSizeMb: question.maxSizeMb,
        maxDurationSeconds: question.maxDurationSeconds,
        captureRequired: question.captureRequired,

        // stimulus
        stimulusSource: question.stimulusSource,
        stimulusMediaUrl: question.stimulusMediaUrl,
        stimulusMediaType: question.stimulusMediaType,
      };

    case "gps":
      return {
        ...base,
        type: "gps",
        category: "gps",

        gpsMode: question.gpsMode,
        targetLocation: question.targetLocation,
        maxDistanceMeters: question.maxDistanceMeters,
        minTimeOnSiteSeconds: question.minTimeOnSiteSeconds,
        gpsToleranceMeters: question.gpsToleranceMeters,
        requiresPathTracking: question.requiresPathTracking,
      };



    case "section":
      return {
        name: question.name,
        type: "html",
        html: `
          <div class="survey-section">
            <h3>${question.title ?? ""}</h3>
            ${
              question.description
                ? `<p>${question.description}</p>`
                : ""
            }
          </div>
        `,
      };

    //
    // BOOLEAN → boolean SurveyJS
    //
    default: {
      if (question.type === "boolean") {
        return {
          ...base,
          type: "boolean",
          labelTrue: "Oui",
          labelFalse: "Non",
        };
      }

      // Fallback: text
      return {
        ...base,
        type: "text",
      };
    }
  }
}

export function mapSurveyToSurveyJS(survey: Survey): any {
  return {
    title: survey.title,
    description: survey.description,
    showProgressBar: survey.showProgressBar ?? "top",
    showQuestionNumbers: survey.showQuestionNumbers ?? "on",
    showPageTitles: survey.showPageTitles ?? true,
    pages: survey.pages.map((page) => ({
      name: page.name,
      title: page.title,
      description: page.description,
      visibleIf: page.visibleIf,
      navigationButtonsVisibility: page.navigationButtonsVisibility,
      elements: page.elements.map(mapQuestionToSurveyJS),
    })),
  };
}
