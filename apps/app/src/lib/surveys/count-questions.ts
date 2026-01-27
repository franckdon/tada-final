// src/lib/surveys/count-questions.ts
export function countSurveyQuestions(survey: any): number {
  const pages = survey?.pages;
  if (!Array.isArray(pages)) return 0;

  return pages.reduce((sum: number, p: any) => {
    const els = Array.isArray(p?.elements) ? p.elements : [];
    return sum + els.length;
  }, 0);
}
