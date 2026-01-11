"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useI18n } from "@/locales/client";
import { JsonValue } from "@prisma/client/runtime/library";

interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  id: string;
  label: string;
  type: "select" | "multiSelect" | "freeText";
  options?: FilterOption[];
}

interface FilterGroup {
  id: string;
  label: string;
  filters: Filter[];
}

type NestedStringArray = {
  [key: string]: string[] | NestedStringArray;
};

type GenericAudienceData = {
  [section: string]: NestedStringArray;
};

interface SelectedFilters {
  [groupId: string]: {
    [filterId: string]: string | string[];
  };
}

// Type pour le contexte
interface AudiencesFilterContextType {
  activeFiltersCount: number;
  selectedFilters: SelectedFilters;
  filterGroups: FilterGroup[];
  setActiveFiltersCount: React.Dispatch<React.SetStateAction<number>>;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilters>>;
  handleOptionSelect: (
    groupId: string,
    filterId: string,
    value: string,
    isSelected: boolean
  ) => void;
}

const AudiencesFilterContext = createContext<
  AudiencesFilterContextType | undefined
>(undefined);

export function AudiencesFilterProvider({
  children,
  audiences,
}: {
  children: React.ReactNode;
  audiences?: any;
}) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
    () => {
      const initialFilters: SelectedFilters = {};
      // Initialiser selectedFilters à partir de audiences

      for (const groupKey in audiences) {
        if (audiences.hasOwnProperty(groupKey)) {
          const groupFilters = audiences[groupKey];
          for (const filterKey in groupFilters) {
            if (groupFilters.hasOwnProperty(filterKey)) {
              const values = groupFilters[filterKey];
              if (Array.isArray(values) && values.length > 0) {
                // Utiliser un Set pour s'assurer que les valeurs sont uniques
                const uniqueValues = Array.from(new Set(values));
                if (uniqueValues.length > 0) {
                  if (!initialFilters[groupKey]) {
                    initialFilters[groupKey] = {};
                  }
                  initialFilters[groupKey][filterKey] = uniqueValues;
                }
              }
            }
          }
        }
      }
      return initialFilters;
    }
  );

  const t = useI18n();

  // Le contenu de filterGroups est omis ici comme demandé,
  // mais il doit être défini ailleurs ou dans ce fichier.
  const filterGroups: FilterGroup[] = [
    {
      id: "personal_info",
      label: t("filters.groups.personal_info.label"),
      filters: [
        {
          id: "gender",
          label: t("filters.groups.personal_info.filters.gender.label"),
          type: "multiSelect",
          options: [
            { value: "male", label: "Homme" },
            { value: "female", label: "Femme" },
          ],
        },
        {
          id: "age",
          label: t("filters.groups.personal_info.filters.age.label"),
          type: "multiSelect",
          options: [
            { value: "18-24", label: "18-24 ans" },
            { value: "25-34", label: "25-34 ans" },
            { value: "35-44", label: "35-44 ans" },
            { value: "45-54", label: "45-54 ans" },
            { value: "55+", label: "55 ans et plus" },
          ],
        },
        {
          id: "marital_status",
          label: t("filters.groups.personal_info.filters.marital_status.label"),
          type: "multiSelect",
          options: [
            { value: "single", label: "Célibataire" },
            { value: "married", label: "Marié(e)" },
            { value: "divorced", label: "Divorcé(e)" },
            { value: "widowed", label: "Veuf(ve)" },
          ],
        },
        {
          id: "has_children",
          label: t("filters.groups.personal_info.filters.has_children.label"),
          type: "multiSelect",
          options: [
            { value: "no_children", label: "Pas d'enfants" },
            { value: "1_child", label: "1 enfant" },
            { value: "2_children", label: "2 enfants" },
            { value: "3+_children", label: "3 enfants ou plus" },
          ],
        },
        {
          id: "nationality",
          label: t("filters.groups.personal_info.filters.nationality.label"),
          type: "multiSelect",
          options: [
            { value: "ivory_coast", label: "Côte d'Ivoire" },
            { value: "senegal", label: "Sénégal" },
            { value: "cameroon", label: "Cameroun" },
            { value: "nigeria", label: "Nigeria" },
            { value: "ghana", label: "Ghana" },
            { value: "other_africa", label: "Autre pays africain" },
            { value: "other", label: "Autre" },
          ],
        },
      ],
    },
    {
      id: "location",
      label: t("filters.groups.location.label"),
      filters: [
        {
          id: "country",
          label: t("filters.groups.location.filters.country.label"),
          type: "multiSelect",
          options: [
            { value: "ivory_coast", label: "Côte d'Ivoire" },
            { value: "senegal", label: "Sénégal" },
            { value: "cameroon", label: "Cameroun" },
            { value: "nigeria", label: "Nigeria" },
            { value: "ghana", label: "Ghana" },
            { value: "other_africa", label: "Autre pays africain" },
            { value: "europe", label: "Europe" },
            { value: "north_america", label: "Amérique du Nord" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "city",
          label: t("filters.groups.location.filters.city.label"),
          type: "multiSelect",
          options: [
            { value: "abidjan", label: "Abidjan" },
            { value: "dakar", label: "Dakar" },
            { value: "yaounde", label: "Yaoundé" },
            { value: "douala", label: "Douala" },
            { value: "lagos", label: "Lagos" },
            { value: "accra", label: "Accra" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "neighborhood",
          label: t("filters.groups.location.filters.neighborhood.label"),
          type: "freeText",
        },
        {
          id: "residential_density",
          label: t("filters.groups.location.filters.residential_density.label"),
          type: "multiSelect",
          options: [
            { value: "high", label: "Très peuplé" },
            { value: "medium", label: "Moyennement peuplé" },
            { value: "low", label: "Peu peuplé" },
          ],
        },
        {
          id: "area_type",
          label: t("filters.groups.location.filters.area_type.label"),
          type: "multiSelect",
          options: [
            { value: "urban", label: "Urbaine" },
            { value: "rural", label: "Rurale" },
            { value: "suburban", label: "Périurbaine" },
          ],
        },
        {
          id: "residence_duration",
          label: t("filters.groups.location.filters.residence_duration.label"),
          type: "multiSelect",
          options: [
            { value: "less_than_1", label: "Moins de 1 an" },
            { value: "1_to_3", label: "1-3 ans" },
            { value: "3_to_5", label: "3-5 ans" },
            { value: "more_than_5", label: "Plus de 5 ans" },
          ],
        },
      ],
    },
    {
      id: "demographics",
      label: t("filters.groups.demographics.label"),
      filters: [
        {
          id: "education",
          label: t("filters.groups.demographics.filters.education.label"),
          type: "multiSelect",
          options: [
            { value: "primary", label: "Primaire" },
            { value: "secondary", label: "Secondaire" },
            { value: "higher", label: "Supérieur" },
            { value: "autodidact", label: "Autodidacte" },
          ],
        },
        {
          id: "diploma",
          label: t("filters.groups.demographics.filters.diploma.label"),
          type: "multiSelect",
          options: [
            { value: "bepc", label: "BEPC" },
            { value: "bac", label: "BAC" },
            { value: "bachelor", label: "Licence" },
            { value: "master", label: "Master" },
            { value: "phd", label: "Doctorat" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "languages",
          label: t("filters.groups.demographics.filters.languages.label"),
          type: "multiSelect",
          options: [
            { value: "french", label: "Français" },
            { value: "english", label: "Anglais" },
            { value: "arabic", label: "Arabe" },
            { value: "ethnic_language", label: "Langue ethnique" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "religion",
          label: t("filters.groups.demographics.filters.religion.label"),
          type: "multiSelect",
          options: [
            { value: "islam", label: "Islam" },
            { value: "christianity", label: "Christianisme" },
            { value: "animism", label: "Animisme" },
            { value: "none", label: "Aucune" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "ethnicity",
          label: t("filters.groups.demographics.filters.ethnicity.label"),
          type: "multiSelect",
          options: [
            { value: "akan", label: "Akan" },
            { value: "krou", label: "Krou" },
            { value: "mande", label: "Mandé" },
            { value: "peul", label: "Peul" },
            { value: "wolof", label: "Wolof" },
            { value: "other", label: "Autre" },
          ],
        },
      ],
    },
    {
      id: "professional",
      label: t("filters.groups.professional.label"),
      filters: [
        {
          id: "sector",
          label: t("filters.groups.professional.filters.sector.label"),
          type: "multiSelect",
          options: [
            { value: "commerce", label: "Commerce" },
            { value: "education", label: "Éducation" },
            { value: "health", label: "Santé" },
            { value: "transport", label: "Transport" },
            { value: "technology", label: "Technologie" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "professional_status",
          label: t(
            "filters.groups.professional.filters.professional_status.label"
          ),
          type: "multiSelect",
          options: [
            { value: "employee", label: "Salarié" },
            { value: "independent", label: "Indépendant" },
            { value: "unemployed", label: "Chômeur" },
            { value: "student", label: "Étudiant" },
            { value: "retired", label: "Retraité" },
          ],
        },
        {
          id: "work_time",
          label: t("filters.groups.professional.filters.work_time.label"),
          type: "multiSelect",
          options: [
            { value: "full_time", label: "Plein temps" },
            { value: "part_time", label: "Temps partiel" },
            { value: "freelance", label: "Freelance" },
          ],
        },
        {
          id: "work_experience",
          label: t("filters.groups.professional.filters.work_experience.label"),
          type: "multiSelect",
          options: [
            { value: "less_than_1", label: "Moins de 1 an" },
            { value: "1_to_3", label: "1-3 ans" },
            { value: "3_to_5", label: "3-5 ans" },
            { value: "more_than_5", label: "Plus de 5 ans" },
          ],
        },
        {
          id: "work_environment",
          label: t(
            "filters.groups.professional.filters.work_environment.label"
          ),
          type: "multiSelect",
          options: [
            { value: "office", label: "Bureau" },
            { value: "field", label: "Terrain" },
            { value: "remote", label: "Télétravail" },
            { value: "hybrid", label: "Hybride" },
          ],
        },
      ],
    },
    {
      id: "financial",
      label: t("filters.groups.financial.label"),
      filters: [
        {
          id: "income",
          label: t("filters.groups.financial.filters.income.label"),
          type: "multiSelect",
          options: [
            { value: "less_than_50k", label: "Moins de 50 000 FCFA" },
            { value: "50k_to_200k", label: "50 000 - 200 000 FCFA" },
            { value: "200k_to_500k", label: "200 000 - 500 000 FCFA" },
            { value: "more_than_500k", label: "Plus de 500 000 FCFA" },
          ],
        },
        {
          id: "income_source",
          label: t("filters.groups.financial.filters.income_source.label"),
          type: "multiSelect",
          options: [
            { value: "salary", label: "Salaire" },
            { value: "commerce", label: "Commerce" },
            { value: "freelance", label: "Freelance" },
            { value: "savings", label: "Épargne" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "bank_account",
          label: t("filters.groups.financial.filters.bank_account.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Oui" },
            { value: "no", label: "Non" },
          ],
        },
        {
          id: "mobile_money",
          label: t("filters.groups.financial.filters.mobile_money.label"),
          type: "multiSelect",
          options: [
            { value: "orange_money", label: "Orange Money" },
            { value: "mtn_money", label: "MTN Mobile Money" },
            { value: "moov_money", label: "Moov Money" },
            { value: "other", label: "Autre" },
            { value: "none", label: "Aucun" },
          ],
        },
        {
          id: "budget_sufficiency",
          label: t("filters.groups.financial.filters.budget_sufficiency.label"),
          type: "multiSelect",
          options: [
            { value: "always", label: "Toujours" },
            { value: "often", label: "Souvent" },
            { value: "sometimes", label: "Parfois" },
            { value: "rarely", label: "Rarement" },
            { value: "never", label: "Jamais" },
          ],
        },
      ],
    },
    {
      id: "equipment",
      label: t("filters.groups.equipment.label"),
      filters: [
        {
          id: "phone_type",
          label: t("filters.groups.equipment.filters.phone_type.label"),
          type: "multiSelect",
          options: [
            { value: "android", label: "Android" },
            { value: "iphone", label: "iPhone" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "has_computer",
          label: t("filters.groups.equipment.filters.has_computer.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Oui" },
            { value: "no", label: "Non" },
          ],
        },
        {
          id: "internet_connection",
          label: t(
            "filters.groups.equipment.filters.internet_connection.label"
          ),
          type: "multiSelect",
          options: [
            { value: "home", label: "Domicile" },
            { value: "mobile", label: "Mobile" },
            { value: "both", label: "Les deux" },
            { value: "none", label: "Aucune" },
          ],
        },
        {
          id: "internet_provider",
          label: t("filters.groups.equipment.filters.internet_provider.label"),
          type: "multiSelect",
          options: [
            { value: "orange", label: "Orange" },
            { value: "mtn", label: "MTN" },
            { value: "moov", label: "Moov" },
            { value: "other", label: "Autre" },
          ],
        },
        {
          id: "connected_devices",
          label: t("filters.groups.equipment.filters.connected_devices.label"),
          type: "multiSelect",
          options: [
            { value: "smartwatch", label: "Montre connectée" },
            { value: "smart_tv", label: "Smart TV" },
            { value: "home_automation", label: "Domotique" },
            { value: "other", label: "Autre" },
            { value: "none", label: "Aucun" },
          ],
        },
      ],
    },
    {
      id: "consumption",
      label: t("filters.groups.consumption.label"),
      filters: [
        {
          id: "shopping_frequency",
          label: t(
            "filters.groups.consumption.filters.shopping_frequency.label"
          ),
          type: "multiSelect",
          options: [
            { value: "daily", label: "Quotidiennement" },
            { value: "weekly", label: "1 à 2 fois par semaine" },
            { value: "monthly", label: "1 à 2 fois par mois" },
            { value: "less", label: "Moins d'une fois par mois" },
          ],
        },
        {
          id: "shopping_location",
          label: t(
            "filters.groups.consumption.filters.shopping_location.label"
          ),
          type: "multiSelect",
          options: [
            { value: "market", label: "Marché" },
            { value: "supermarket", label: "Supermarché" },
            { value: "local_shop", label: "Boutiques de quartier" },
            { value: "online", label: "En ligne" },
          ],
        },
        {
          id: "online_shopping",
          label: t("filters.groups.consumption.filters.online_shopping.label"),
          type: "multiSelect",
          options: [
            { value: "regular", label: "Régulièrement" },
            { value: "occasional", label: "Occasionnellement" },
            { value: "never", label: "Jamais" },
          ],
        },
        {
          id: "brand_loyalty",
          label: t("filters.groups.consumption.filters.brand_loyalty.label"),
          type: "multiSelect",
          options: [
            { value: "very_loyal", label: "Très fidèle" },
            { value: "somewhat_loyal", label: "Plutôt fidèle" },
            { value: "not_loyal", label: "Pas fidèle" },
          ],
        },
        {
          id: "purchase_motivation",
          label: t(
            "filters.groups.consumption.filters.purchase_motivation.label"
          ),
          type: "multiSelect",
          options: [
            { value: "price", label: "Prix" },
            { value: "quality", label: "Qualité" },
            { value: "brand", label: "Marque" },
            { value: "reviews", label: "Avis clients" },
            { value: "advertising", label: "Publicité" },
            { value: "availability", label: "Disponibilité" },
          ],
        },
      ],
    },
    {
      id: "lifestyle",
      label: t("filters.groups.lifestyle.label"),
      filters: [
        {
          id: "transport_mode",
          label: t("filters.groups.lifestyle.filters.transport_mode.label"),
          type: "multiSelect",
          options: [
            { value: "public_transport", label: "Transport en commun" },
            { value: "personal_vehicle", label: "Véhicule personnel" },
            { value: "motorcycle", label: "Moto" },
            { value: "vtc", label: "VTC (Uber, Yango)" },
            { value: "walking", label: "Marche" },
          ],
        },
        {
          id: "housing",
          label: t("filters.groups.lifestyle.filters.housing.label"),
          type: "multiSelect",
          options: [
            { value: "apartment", label: "Appartement" },
            { value: "house", label: "Maison individuelle" },
            { value: "studio", label: "Studio" },
            { value: "villa", label: "Villa" },
          ],
        },
        {
          id: "housing_status",
          label: t("filters.groups.lifestyle.filters.housing_status.label"),
          type: "multiSelect",
          options: [
            { value: "rent", label: "Location" },
            { value: "own", label: "Propriétaire" },
            { value: "free", label: "Hébergé gratuitement" },
            { value: "colocation", label: "Colocation" },
          ],
        },
        {
          id: "sport",
          label: t("filters.groups.lifestyle.filters.sport.label"),
          type: "multiSelect",
          options: [
            { value: "regular", label: "Régulière" },
            { value: "occasional", label: "Occasionnelle" },
            { value: "never", label: "Jamais" },
          ],
        },
        {
          id: "travel",
          label: t("filters.groups.lifestyle.filters.travel.label"),
          type: "multiSelect",
          options: [
            { value: "frequent", label: "Fréquent" },
            { value: "occasional", label: "Occasionnel" },
            { value: "rare", label: "Rare" },
            { value: "never", label: "Jamais" },
          ],
        },
      ],
    },
    {
      id: "media",
      label: t("filters.groups.media.label"),
      filters: [
        {
          id: "social_media",
          label: t("filters.groups.media.filters.social_media.label"),
          type: "multiSelect",
          options: [
            { value: "facebook", label: "Facebook" },
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
            { value: "twitter", label: "Twitter/X" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "snapchat", label: "Snapchat" },
            { value: "youtube", label: "YouTube" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "telegram", label: "Telegram" },
          ],
        },
        {
          id: "social_media_time",
          label: t("filters.groups.media.filters.social_media_time.label"),
          type: "multiSelect",
          options: [
            { value: "less_than_30min", label: "Less than 30 min" },
            { value: "30min_to_1h", label: "30 min - 1h" },
            { value: "1h_to_2h", label: "1h - 2h" },
            { value: "more_than_2h", label: "More than 2h" },
          ],
        },
        {
          id: "communication_means",
          label: t("filters.groups.media.filters.communication_means.label"),
          type: "multiSelect",
          options: [
            { value: "calls", label: "Phone calls" },
            { value: "sms", label: "SMS" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "messenger", label: "Messenger" },
            { value: "email", label: "E-mails" },
          ],
        },
        {
          id: "entertainment",
          label: t("filters.groups.media.filters.entertainment.label"),
          type: "multiSelect",
          options: [
            { value: "movies", label: "Movies" },
            { value: "series", label: "Series" },
            { value: "music", label: "Music" },
            { value: "videos", label: "Videos" },
            { value: "video_games", label: "Video games" },
            { value: "shows", label: "Shows" },
          ],
        },
        {
          id: "streaming",
          label: t("filters.groups.media.filters.streaming.label"),
          type: "multiSelect",
          options: [
            { value: "netflix", label: "Netflix" },
            { value: "amazon", label: "Amazon Prime" },
            { value: "disney", label: "Disney+" },
            { value: "other", label: "Other" },
            { value: "none", label: "None" },
          ],
        },
      ],
    },
    {
      id: "animals",
      label: t("filters.groups.animals.label"),
      filters: [
        {
          id: "pet_types",
          label: t("filters.groups.animals.filters.pet_types.label"),
          type: "multiSelect",
          options: [
            { value: "dog", label: "Dog" },
            { value: "cat", label: "Cat" },
            { value: "bird", label: "Bird" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "pet_count",
          label: t("filters.groups.animals.filters.pet_count.label"),
          type: "multiSelect",
          options: [
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4+", label: "4 or more" },
          ],
        },
        {
          id: "pet_food_location",
          label: t("filters.groups.animals.filters.pet_food_location.label"),
          type: "multiSelect",
          options: [
            { value: "home", label: "At home" },
            { value: "outside", label: "Outside" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "vet_frequency",
          label: t("filters.groups.animals.filters.vet_frequency.label"),
          type: "multiSelect",
          options: [
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "biannual", label: "Biannual" },
            { value: "annual", label: "Annual" },
            { value: "as_needed", label: "As needed" },
          ],
        },
        {
          id: "pet_expenses",
          label: t("filters.groups.animals.filters.pet_expenses.label"),
          type: "multiSelect",
          options: [
            { value: "food", label: "Food" },
            { value: "care", label: "Care" },
            { value: "accessories", label: "Accessories" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "pet_specialized_products",
          label: t(
            "filters.groups.animals.filters.pet_specialized_products.label"
          ),
          type: "multiSelect",
          options: [
            { value: "shampoo", label: "Shampoo" },
            { value: "brushes", label: "Brushes" },
            { value: "toys", label: "Toys" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "pet_food_behavior",
          label: t("filters.groups.animals.filters.pet_food_behavior.label"),
          type: "multiSelect",
          options: [
            { value: "industrial", label: "Industrial food" },
            { value: "homemade", label: "Homemade food" },
          ],
        },
        {
          id: "pet_training",
          label: t("filters.groups.animals.filters.pet_training.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "pet_cleanliness",
          label: t("filters.groups.animals.filters.pet_cleanliness.label"),
          type: "multiSelect",
          options: [
            { value: "toilet", label: "Toilet" },
            { value: "regular_care", label: "Regular care" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: "social_engagement",
      label: t("filters.groups.social_engagement.label"),
      filters: [
        {
          id: "volunteering",
          label: t(
            "filters.groups.social_engagement.filters.volunteering.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "organization_member",
          label: t(
            "filters.groups.social_engagement.filters.organization_member.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "supported_causes",
          label: t(
            "filters.groups.social_engagement.filters.supported_causes.label"
          ),
          type: "multiSelect",
          options: [
            { value: "environment", label: "Environment" },
            { value: "education", label: "Education" },
            { value: "human_rights", label: "Human rights" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "charity_events",
          label: t(
            "filters.groups.social_engagement.filters.charity_events.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "regular_donations",
          label: t(
            "filters.groups.social_engagement.filters.regular_donations.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "volunteering_frequency",
          label: t(
            "filters.groups.social_engagement.filters.volunteering_frequency.label"
          ),
          type: "multiSelect",
          options: [
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "annual", label: "Annual" },
          ],
        },
        {
          id: "fundraising_organization",
          label: t(
            "filters.groups.social_engagement.filters.fundraising_organization.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "social_impact_consumption",
          label: t(
            "filters.groups.social_engagement.filters.social_impact_consumption.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "social_platforms",
          label: t(
            "filters.groups.social_engagement.filters.social_platforms.label"
          ),
          type: "multiSelect",
          options: [
            { value: "social_media", label: "Social media" },
            { value: "forums", label: "Forums" },
            { value: "other", label: "Other" },
          ],
        },
      ],
    },
    {
      id: "environment",
      label: t("filters.groups.environment.label"),
      filters: [
        {
          id: "waste_sorting",
          label: t("filters.groups.environment.filters.waste_sorting.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "eco_products",
          label: t("filters.groups.environment.filters.eco_products.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "green_space",
          label: t("filters.groups.environment.filters.green_space.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "reusable_products",
          label: t(
            "filters.groups.environment.filters.reusable_products.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "energy_saving",
          label: t("filters.groups.environment.filters.energy_saving.label"),
          type: "multiSelect",
          options: [
            { value: "solar_panels", label: "Solar panels" },
            { value: "led", label: "LED" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "sustainable_transport",
          label: t(
            "filters.groups.environment.filters.sustainable_transport.label"
          ),
          type: "multiSelect",
          options: [
            { value: "carpooling", label: "Carpooling" },
            { value: "public_transport", label: "Public transport" },
            { value: "bike", label: "Bike" },
          ],
        },
        {
          id: "local_food",
          label: t("filters.groups.environment.filters.local_food.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "composting",
          label: t("filters.groups.environment.filters.composting.label"),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "public_space_cleaning",
          label: t(
            "filters.groups.environment.filters.public_space_cleaning.label"
          ),
          type: "multiSelect",
          options: [
            { value: "never", label: "Never" },
            { value: "monthly", label: "Monthly" },
            { value: "multiple_monthly", label: "Multiple times per month" },
          ],
        },
        {
          id: "packaging_awareness",
          label: t(
            "filters.groups.environment.filters.packaging_awareness.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
    {
      id: "lifestyle_routines",
      label: t("filters.groups.lifestyle_routines.label"),
      filters: [
        {
          id: "morning_routine",
          label: t(
            "filters.groups.lifestyle_routines.filters.morning_routine.label"
          ),
          type: "multiSelect",
          options: [
            { value: "early_riser", label: "Early riser" },
            { value: "late_riser", label: "Late riser" },
            { value: "breakfast", label: "Breakfast" },
            { value: "exercise", label: "Exercise" },
          ],
        },
        {
          id: "evening_routine",
          label: t(
            "filters.groups.lifestyle_routines.filters.evening_routine.label"
          ),
          type: "multiSelect",
          options: [
            { value: "early_bedtime", label: "Early bedtime" },
            { value: "late_bedtime", label: "Late bedtime" },
            { value: "relaxation", label: "Relaxation" },
            { value: "preparation", label: "Preparation" },
          ],
        },
        {
          id: "regular_exercise",
          label: t(
            "filters.groups.lifestyle_routines.filters.regular_exercise.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "exercise_type",
          label: t(
            "filters.groups.lifestyle_routines.filters.exercise_type.label"
          ),
          type: "multiSelect",
          options: [
            { value: "running", label: "Running" },
            { value: "weight_training", label: "Weight training" },
            { value: "yoga", label: "Yoga" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "exercise_time",
          label: t(
            "filters.groups.lifestyle_routines.filters.exercise_time.label"
          ),
          type: "multiSelect",
          options: [
            { value: "less_than_1h", label: "Less than 1h" },
            { value: "1_to_3h", label: "1-3h" },
            { value: "3_to_5h", label: "3-5h" },
            { value: "more_than_5h", label: "More than 5h" },
          ],
        },
        {
          id: "diet",
          label: t("filters.groups.lifestyle_routines.filters.diet.label"),
          type: "multiSelect",
          options: [
            { value: "vegetarian", label: "Vegetarian" },
            { value: "vegan", label: "Vegan" },
            { value: "omnivore", label: "Omnivore" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "motivation_source",
          label: t(
            "filters.groups.lifestyle_routines.filters.motivation_source.label"
          ),
          type: "multiSelect",
          options: [
            { value: "health", label: "Health" },
            { value: "appearance", label: "Appearance" },
            { value: "wellbeing", label: "Well-being" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "productivity_habits",
          label: t(
            "filters.groups.lifestyle_routines.filters.productivity_habits.label"
          ),
          type: "multiSelect",
          options: [
            { value: "todo_list", label: "To-do lists" },
            { value: "breaks", label: "Breaks" },
            { value: "meditation", label: "Meditation" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "health_tracking",
          label: t(
            "filters.groups.lifestyle_routines.filters.health_tracking.label"
          ),
          type: "multiSelect",
          options: [
            { value: "apps", label: "Apps" },
            { value: "wearables", label: "Wearables" },
            { value: "consultations", label: "Consultations" },
            { value: "none", label: "None" },
          ],
        },
        {
          id: "work_life_balance",
          label: t(
            "filters.groups.lifestyle_routines.filters.work_life_balance.label"
          ),
          type: "multiSelect",
          options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" },
          ],
        },
      ],
    },
    {
      id: "trends_innovation",
      label: t("filters.groups.trends_innovation.label"),
      filters: [
        {
          id: "trends_information",
          label: t(
            "filters.groups.trends_innovation.filters.trends_information.label"
          ),
          type: "multiSelect",
          options: [
            { value: "social_media", label: "Social media" },
            { value: "blogs", label: "Blogs" },
            { value: "podcasts", label: "Podcasts" },
            { value: "events", label: "Events" },
          ],
        },
        {
          id: "latest_innovation",
          label: t(
            "filters.groups.trends_innovation.filters.latest_innovation.label"
          ),
          type: "freeText",
        },
        {
          id: "latest_products",
          label: t(
            "filters.groups.trends_innovation.filters.latest_products.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "trend_reaction",
          label: t(
            "filters.groups.trends_innovation.filters.trend_reaction.label"
          ),
          type: "multiSelect",
          options: [
            { value: "immediate", label: "I try immediately" },
            { value: "wait", label: "I wait for others' opinions" },
            { value: "ignore", label: "I ignore it" },
          ],
        },
        {
          id: "influencer_following",
          label: t(
            "filters.groups.trends_innovation.filters.influencer_following.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "regretted_trend",
          label: t(
            "filters.groups.trends_innovation.filters.regretted_trend.label"
          ),
          type: "multiSelect",
          options: [
            { value: "products", label: "Products" },
            { value: "fashion", label: "Fashion" },
            { value: "technology", label: "Technology" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "innovation_testing",
          label: t(
            "filters.groups.trends_innovation.filters.innovation_testing.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "tech_impact_consumption",
          label: t(
            "filters.groups.trends_innovation.filters.tech_impact_consumption.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "current_trend_interest",
          label: t(
            "filters.groups.trends_innovation.filters.current_trend_interest.label"
          ),
          type: "multiSelect",
          options: [
            { value: "fashion", label: "Fashion" },
            { value: "technology", label: "Technology" },
            { value: "health", label: "Health" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "innovation_participation",
          label: t(
            "filters.groups.trends_innovation.filters.innovation_participation.label"
          ),
          type: "multiSelect",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
  ];

  const handleOptionSelect = (
    groupId: string,
    filterId: string,
    value: string,
    isSelected: boolean
  ) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      // Initialiser le groupe s'il n'existe pas
      if (!newFilters[groupId]) {
        newFilters[groupId] = {};
      }
      // Initialiser le filtre s'il n'existe pas
      if (!newFilters[groupId][filterId]) {
        newFilters[groupId][filterId] = [];
      }
      // Ajouter ou supprimer la valeur
      if (isSelected) {
        // S'assurer que la valeur n'est pas déjà présente pour éviter les doublons
        if (!Array.isArray(newFilters[groupId][filterId])) {
          newFilters[groupId][filterId] = [];
        }
        if (!(newFilters[groupId][filterId] as string[]).includes(value)) {
          (newFilters[groupId][filterId] as string[]).push(value);
        }
      } else {
        newFilters[groupId][filterId] = (
          newFilters[groupId][filterId] as string[]
        ).filter((v) => v !== value);
      }
      // Nettoyer si tableau vide
      if ((newFilters[groupId][filterId] as string[]).length === 0) {
        delete newFilters[groupId][filterId];
      }
      // Nettoyer si groupe vide
      if (Object.keys(newFilters[groupId]).length === 0) {
        delete newFilters[groupId];
      }
      return newFilters;
    });
  };

  useEffect(() => {
    let count = 0;
    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.keys(selectedFilters).forEach((groupId) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.keys(selectedFilters[groupId] || {}).forEach((filterId) => {
        if ((selectedFilters[groupId]![filterId] as string[])?.length > 0) {
          count++;
        }
      });
    });
    setActiveFiltersCount(count);
  }, [selectedFilters]);

  return (
    <AudiencesFilterContext.Provider
      value={{
        activeFiltersCount,
        selectedFilters,
        filterGroups,
        setActiveFiltersCount,
        setSelectedFilters,
        handleOptionSelect,
      }}
    >
      {children}
    </AudiencesFilterContext.Provider>
  );
}

export function useAudiencesFilter() {
  const context = useContext(AudiencesFilterContext);
  if (!context) {
    throw new Error(
      "useAudiencesFilter must be used within a AudiencesFilterProvider"
    );
  }
  return context;
}
