"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethnicitySchema = exports.locationSchema = exports.personalInfoSchema = void 0;
// apps/api/src/routes/v1/mobile/contributor/modules/modules.schemas.ts
const zod_1 = require("zod");
const sexEnum = zod_1.z.enum(["male", "female", "other", "prefer_not_to_say"]);
const birthDateSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)");
const iso2Schema = zod_1.z.string().length(2, "ISO2 attendu (2 caractères)");
exports.personalInfoSchema = zod_1.z.object({
    // user
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(8).optional().nullable(), // +225... (on valide léger)
    phone2: zod_1.z.string().min(8).optional().nullable(),
    sex: sexEnum.optional().nullable(),
    birthDate: birthDateSchema.optional().nullable(),
    // contributor_profile
    maritalStatus: zod_1.z
        .enum(["single", "married", "divorced", "widowed", "prefer_not_to_say"])
        .optional()
        .nullable(),
    hasChildren: zod_1.z.boolean().optional().nullable(),
    childrenCount: zod_1.z.number().int().min(0).optional().nullable(),
    nationality1Code: iso2Schema.optional().nullable(),
    nationality2Code: iso2Schema.optional().nullable(),
    hasValidIdOrPassport: zod_1.z.boolean().optional().nullable(),
});
exports.locationSchema = zod_1.z.object({
    residenceCountryCode: iso2Schema.optional().nullable(),
    residenceCity: zod_1.z.string().min(1).optional().nullable(),
    cityResidenceDuration: zod_1.z
        .enum(["lt_1y", "y_1_3", "y_3_5", "gt_5y"])
        .optional()
        .nullable(),
    areaType: zod_1.z.enum(["urban", "rural", "peri_urban"]).optional().nullable(),
    // dynamiques (attrs)
    neighborhood: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    postalCode: zod_1.z.string().optional().nullable(),
    cityInfluencesConsumption: zod_1.z.boolean().optional().nullable(),
    cityInfluenceDetails: zod_1.z.string().optional().nullable(),
    livedOtherCity: zod_1.z.boolean().optional().nullable(),
    otherCityName: zod_1.z.string().optional().nullable(),
    traveledAbroad: zod_1.z.boolean().optional().nullable(),
    countriesVisited: zod_1.z.array(iso2Schema).optional().nullable(),
    workNearHome: zod_1.z.enum(["yes", "no", "home"]).optional().nullable(),
});
exports.ethnicitySchema = zod_1.z.object({
    main: zod_1.z.string().min(1).optional().nullable(), // single_select ou string
    speaksEthnicLanguage: zod_1.z.boolean().optional().nullable(),
    ethnicLanguage: zod_1.z.string().optional().nullable(),
    traditionalEvents: zod_1.z.boolean().optional().nullable(),
    culturalPractices: zod_1.z.boolean().optional().nullable(),
    culturalPracticesDetails: zod_1.z.string().optional().nullable(),
    travelToVillageFrequency: zod_1.z
        .enum(["regularly", "sometimes", "rarely", "never"])
        .optional()
        .nullable(),
    traditionalFoods: zod_1.z.boolean().optional().nullable(),
    traditionalFoodsDetails: zod_1.z.string().optional().nullable(),
    transmitCultureToChildren: zod_1.z.boolean().optional().nullable(),
    consumptionInfluenced: zod_1.z.boolean().optional().nullable(),
    influenceDetails: zod_1.z.string().optional().nullable(),
    traditionalClothes: zod_1.z.enum(["yes", "occasionally", "no"]).optional().nullable(),
    listenTraditionalMusic: zod_1.z.boolean().optional().nullable(),
    favoriteArtist: zod_1.z.string().optional().nullable(),
});
