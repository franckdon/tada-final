// apps/api/src/routes/v1/mobile/contributor/modules/modules.schemas.ts
import { z } from "zod";

const sexEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)");

const iso2Schema = z.string().length(2, "ISO2 attendu (2 caractères)");

export const personalInfoSchema = z.object({
  // user
  name: z.string().min(2),
  phone: z.string().min(8).optional().nullable(), // +225... (on valide léger)
  phone2: z.string().min(8).optional().nullable(),
  sex: sexEnum.optional().nullable(),
  birthDate: birthDateSchema.optional().nullable(),

  // contributor_profile
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "prefer_not_to_say"]).optional().nullable(),
  hasChildren: z.boolean().optional().nullable(),
  childrenCount: z.number().int().min(0).optional().nullable(),
  nationality1Code: iso2Schema.optional().nullable(),
  nationality2Code: iso2Schema.optional().nullable(),
  hasValidIdOrPassport: z.boolean().optional().nullable(),
});

export const locationSchema = z.object({
  residenceCountryCode: iso2Schema.optional().nullable(),
  residenceCity: z.string().min(1).optional().nullable(),
  cityResidenceDuration: z.enum(["lt_1y", "y_1_3", "y_3_5", "gt_5y"]).optional().nullable(),
  areaType: z.enum(["urban", "rural", "peri_urban"]).optional().nullable(),

  // dynamiques (attrs)
  neighborhood: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),

  cityInfluencesConsumption: z.boolean().optional().nullable(),
  cityInfluenceDetails: z.string().optional().nullable(),

  livedOtherCity: z.boolean().optional().nullable(),
  otherCityName: z.string().optional().nullable(),

  traveledAbroad: z.boolean().optional().nullable(),
  countriesVisited: z.array(iso2Schema).optional().nullable(),

  workNearHome: z.enum(["yes", "no", "home"]).optional().nullable(),
});

export const ethnicitySchema = z.object({
  main: z.string().min(1).optional().nullable(), // single_select ou string

  speaksEthnicLanguage: z.boolean().optional().nullable(),
  ethnicLanguage: z.string().optional().nullable(),

  traditionalEvents: z.boolean().optional().nullable(),

  culturalPractices: z.boolean().optional().nullable(),
  culturalPracticesDetails: z.string().optional().nullable(),

  travelToVillageFrequency: z.enum(["regularly", "sometimes", "rarely", "never"]).optional().nullable(),

  traditionalFoods: z.boolean().optional().nullable(),
  traditionalFoodsDetails: z.string().optional().nullable(),

  transmitCultureToChildren: z.boolean().optional().nullable(),

  consumptionInfluenced: z.boolean().optional().nullable(),
  influenceDetails: z.string().optional().nullable(),

  traditionalClothes: z.enum(["yes", "occasionally", "no"]).optional().nullable(),

  listenTraditionalMusic: z.boolean().optional().nullable(),
  favoriteArtist: z.string().optional().nullable(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type EthnicityInput = z.infer<typeof ethnicitySchema>;
