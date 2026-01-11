"use client";

import type React from "react";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/locales/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { FILTER_GROUPS_CATALOG } from "./filters.catalog";

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

type AudiencePayload = {
  filters: SelectedFilters;
  suggestions?: {
    groupId?: string;
    label: string;
    description?: string;
  }[];
};

interface AudienceSuggestion {
  groupId?: string;
  label: string;
  description?: string;
}

// Type pour le contexte
interface AudiencesFilterContextType {
  activeFiltersCount: number;
  selectedFilters: SelectedFilters;
  filterGroups: FilterGroup[];

  suggestions: AudienceSuggestion[];
  addSuggestion: (suggestion: AudienceSuggestion) => void;

  removeSuggestion: (idx: number) => void;

  submitSuggestion: (suggestion: AudienceSuggestion) => Promise<void>;

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
  organizationId,
  workspaceId,
  missionId,
}: {
  children: React.ReactNode;
  audiences?: any;
  organizationId: string;
  workspaceId: string;
  missionId: string | null;
}) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(
    () => {
      const initialFilters: SelectedFilters = {};

      if (!audiences) {
        return initialFilters;
      }

      for (const groupKey in audiences) {
        if (Object.prototype.hasOwnProperty.call(audiences, groupKey)) {
          const groupFilters = audiences[groupKey];
          for (const filterKey in groupFilters) {
            if (Object.prototype.hasOwnProperty.call(groupFilters, filterKey)) {
              const values = groupFilters[filterKey];
              if (Array.isArray(values) && values.length > 0) {
                const uniqueValues = Array.from(new Set(values));
                if (!initialFilters[groupKey]) {
                  initialFilters[groupKey] = {};
                }
                initialFilters[groupKey]![filterKey] = uniqueValues;
              }
            }
          }
        }
      }

      return initialFilters;
    }
  );

  const [suggestions, setSuggestions] = useState<AudienceSuggestion[]>([]);

  const addSuggestion = (suggestion: AudienceSuggestion) => {
    setSuggestions((prev) => [...prev, suggestion]);
  };

  const t = useI18n();

  // Le contenu de filterGroups est omis ici comme demandé,
  // mais il doit être défini ailleurs ou dans ce fichier.
  const filterGroups: FilterGroup[] = useMemo(() => {
    return FILTER_GROUPS_CATALOG.map((group) => ({
      id: group.id,
      label: t(group.labelKey),
      filters: group.filters.map((f) => ({
        id: f.id,
        label: t(f.labelKey),
        type: f.type,
        options: f.options?.map((o) => ({
          value: o.value,
          label: t(o.labelKey),
        })),
      })),
    }));
  }, [t]);

  const removeSuggestion = (idx: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== idx));
  };

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

  const submitSuggestion = async (suggestion: AudienceSuggestion) => {
    if (!organizationId) {
      console.warn(
        "[AudiencesFilterProvider] submitSuggestion called without organizationId"
      );
      return;
    }

    try {
      const res = await fetch("/api/audience-attribute-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          missionId: missionId ?? null,
          groupId: suggestion.groupId ?? null,
          label: suggestion.label,
          description: suggestion.description ?? null,
          // createdById => tu peux laisser le serveur le remplir via la session
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create suggestion");
      }

      const created = await res.json();

      // on garde en mémoire locale (optionnel, mais pratique)
      setSuggestions((prev) => [
        ...prev,
        {
          groupId: created.groupId ?? undefined,
          label: created.label,
          description: created.description ?? undefined,
        },
      ]);
    } catch (error) {
      console.error("Error submitting audience suggestion", error);
      throw error;
    }
  };

  useEffect(() => {
    let count = 0;

    Object.keys(selectedFilters).forEach((groupId) => {
      Object.keys(selectedFilters[groupId] || {}).forEach((filterId) => {
        if ((selectedFilters[groupId]![filterId] as string[])?.length > 0) {
          count++;
        }
      });
    });

    count += suggestions.length;

    setActiveFiltersCount(count);
  }, [selectedFilters, suggestions]);

  return (
    <AudiencesFilterContext.Provider
      value={{
        activeFiltersCount,
        selectedFilters,
        filterGroups,
        suggestions,
        addSuggestion,
        removeSuggestion,
        submitSuggestion,
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
