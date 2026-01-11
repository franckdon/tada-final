// src/lib/exports/types.ts

export type CodebookRow = {
  question_id: string;
  question_label: string;
  question_type: string;
  variable_name: string;
  values?: string;
  base?: number;
};

export type ResponseRow = {
  respondent_id: string;
  // colonnes dynamiques (q1_xxx, q2_yyy...)
  [variable_name: string]: string | number | null;
};
