export type LocaleCode = "fr" | "en";
export type FeatureValueType = "boolean" | "number" | "text";

export type FeatureCategoryLite = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
};

export type FeatureTranslationInput = {
  locale: LocaleCode;
  label: string;
  description: string;
};

export type FeatureFormInput = {
  key: string;
  label: string;
  description: string;
  valueType: FeatureValueType;
  unit: string;
  sortOrder: number;
  categoryId: string | null;
  translations: Record<LocaleCode, FeatureTranslationInput>;
};

export type FeatureRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  valueType: FeatureValueType;
  unit: string | null;
  sortOrder: number;
  categoryId: string | null;
  category: { id: string; name: string; key: string } | null;
  translations: Array<{
    id: string;
    locale: LocaleCode;
    label: string;
    description: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};
