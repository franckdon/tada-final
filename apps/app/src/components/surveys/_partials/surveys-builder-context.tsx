// surveys-builder-context.tsx

import { Survey, SurveyQuestion } from "@/context/surveys-builder-context";

export const PAGE_SIZE = 10;

export function flattenSurveyElements(survey: Survey) {
  return survey.pages.flatMap((p) => p.elements);
}

export function rebuildSurveyPages(
  survey: Survey,
  allElements: SurveyQuestion[]
): Survey {
  const pages = [];
  for (let i = 0; i < allElements.length; i += PAGE_SIZE) {
    pages.push({
      name: `page${pages.length + 1}`,
      elements: allElements.slice(i, i + PAGE_SIZE),
    });
  }

  return {
    ...survey,
    pages,
  };
}
