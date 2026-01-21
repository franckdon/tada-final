export type Currency = "USD" | "XOF";
export type BillingInterval = "month" | "year";
export type LocaleCode = "fr" | "en";
export type FeatureValueType = "boolean" | "number" | "text";

export type AddOnTranslationRow = {
  id: string;
  locale: LocaleCode;
  name: string;
  description: string | null;
};

export type AddOnPriceRow = {
  id: string;
  currency: Currency;
  interval: BillingInterval;
  amountCents: number;
  quantityIncluded: number | null;
};

export type AddOnRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  valueType: FeatureValueType;
  unit: string | null;
  translations: AddOnTranslationRow[];
  _count?: { availableInPlans: number };
  createdAt: string;
  updatedAt: string;
};

export type AddOnFormInput = {
  key: string;
  name: string;
  description: string;
  valueType: FeatureValueType;
  unit: string;
  translations: Record<LocaleCode, { locale: LocaleCode; name: string; description: string }>;
};
