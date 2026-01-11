import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  country: z.string().min(1, "Veuillez sélectionner un pays"),
  sector: z.string().min(1, "Veuillez sélectionner un secteur"),
});

export type UpdateOrganizationFormData = z.infer<
  typeof updateOrganizationSchema
>;
