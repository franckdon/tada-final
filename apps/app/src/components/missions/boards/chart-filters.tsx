"use client";
import {
  Submission,
  useChartBuilder,
  Filter,
} from "@/context/chart-builder-context";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Plus, X } from "lucide-react";
import { useMemo } from "react";

export function ChartFilters() {
  const {
    filters,
    setFilters,
    setData: setFilteredData,
    initialData,
    generateFieldConfig,
  } = useChartBuilder();

  const operators = {
    text: [
      { value: "equals", label: "égal à" },
      { value: "not_equals", label: "différent de" },
      { value: "contains", label: "contient" },
      { value: "not_contains", label: "ne contient pas" },
      { value: "starts_with", label: "commence par" },
      { value: "ends_with", label: "finit par" },
    ],
    number: [
      { value: "equals", label: "égal à" },
      { value: "not_equals", label: "différent de" },
      { value: "greater_than", label: "supérieur à" },
      { value: "less_than", label: "inférieur à" },
      { value: "greater_equal", label: "supérieur ou égal à" },
      { value: "less_equal", label: "inférieur ou égal à" },
    ],
    select: [
      { value: "equals", label: "est" },
      { value: "not_equals", label: "n'est pas" },
      { value: "in", label: "est dans" },
      { value: "not_in", label: "n'est pas dans" },
    ],
    boolean: [
      { value: "equals", label: "est" },
      { value: "not_equals", label: "n'est pas" },
    ],
    date: [
      { value: "equals", label: "égal à" },
      { value: "not_equals", label: "différent de" },
      { value: "greater_than", label: "après le" },
      { value: "less_than", label: "avant le" },
      { value: "greater_equal", label: "à partir du" },
      { value: "less_equal", label: "jusqu'au" },
    ],
  };

  const addFilter = () => {
    const newFilter: Filter = {
      id: Date.now().toString(),
      field: "",
      operator: "",
      value: "",
      connector: filters.length > 0 ? "AND" : null,
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    const newFilters = filters.filter((f) => f.id !== filterId);
    // If we remove the first filter, remove the connector from the new first filter
    if (newFilters.length > 0 && filters[0]?.id === filterId) {
      newFilters[0]!.connector = null;
    }
    setFilters(newFilters);
  };

  const updateFilter = (
    filterId: string,
    field: keyof Filter,
    value: string
  ) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === filterId) {
          const updatedFilter = { ...filter, [field]: value };
          // Reset operator and value when field changes
          if (field === "field") {
            updatedFilter.operator = "";
            updatedFilter.value = "";
          }
          return updatedFilter;
        }
        return filter;
      })
    );
  };

  const renderValueInput = (filter: Filter) => {
    const fieldType = fieldConfig[filter.field]?.type;

    if (fieldType === "select") {
      return (
        <Select
          onValueChange={(value) => updateFilter(filter.id, "value", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig[filter.field]?.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (fieldType === "boolean") {
      return (
        <Select
          onValueChange={(value) => updateFilter(filter.id, "value", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Oui</SelectItem>
            <SelectItem value="false">Non</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (fieldType === "date") {
      return (
        <input
          type="date"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <Input
        type={fieldType === "number" ? "number" : "text"}
        value={filter.value}
        onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
        placeholder="Valeur..."
      />
    );
  };

  const resetFilters = () => {
    setFilters([]);
    setFilteredData(initialData);
  };

  const applyFilters = () => {
    if (filters.length === 0) {
      setFilteredData(initialData);
      return;
    }

    const validFilters = filters.filter(
      (f) => f.field && f.operator && f.value !== ""
    );

    if (validFilters.length === 0) {
      setFilteredData(initialData);
      return;
    }

    const filtered = initialData.filter((item) => {
      let result = true;

      validFilters.forEach((filter, index) => {
        const fieldValue = item[filter.field as keyof typeof item];
        const filterValue = filter.value;
        let conditionMet = false;

        // Évaluer la condition selon l'opérateur
        switch (filter.operator) {
          case "equals":
            conditionMet = fieldValue == filterValue;
            break;
          case "not_equals":
            conditionMet = fieldValue != filterValue;
            break;
          case "contains":
            conditionMet = String(fieldValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
            break;
          case "not_contains":
            conditionMet = !String(fieldValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
            break;
          case "starts_with":
            conditionMet = String(fieldValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase());
            break;
          case "ends_with":
            conditionMet = String(fieldValue)
              .toLowerCase()
              .endsWith(String(filterValue).toLowerCase());
            break;
          case "greater_than":
            if (
              fieldConfig[filter.field as keyof typeof fieldConfig]?.type ===
              "date"
            ) {
              conditionMet =
                new Date(fieldValue as unknown as string) >
                new Date(filterValue as unknown as string);
            } else {
              conditionMet = Number(fieldValue) > Number(filterValue);
            }
            break;
          case "less_than":
            if (
              fieldConfig[filter.field as keyof typeof fieldConfig]?.type ===
              "date"
            ) {
              conditionMet =
                new Date(fieldValue as unknown as string) <
                new Date(filterValue as unknown as string);
            } else {
              conditionMet = Number(fieldValue) < Number(filterValue);
            }
            break;
          case "greater_equal":
            if (
              fieldConfig[filter.field as keyof typeof fieldConfig]?.type ===
              "date"
            ) {
              conditionMet =
                new Date(fieldValue as unknown as string) >=
                new Date(filterValue as unknown as string);
            } else {
              conditionMet = Number(fieldValue) >= Number(filterValue);
            }
            break;
          case "less_equal":
            if (
              fieldConfig[filter.field as keyof typeof fieldConfig]?.type ===
              "date"
            ) {
              conditionMet =
                new Date(fieldValue as unknown as string) <=
                new Date(filterValue as unknown as string);
            } else {
              conditionMet = Number(fieldValue) <= Number(filterValue);
            }
            break;
          default:
            conditionMet = true;
        }

        // Apply AND/OR logic
        if (index === 0) {
          result = conditionMet;
        } else {
          if (filter.connector === "AND") {
            result = result && conditionMet;
          } else if (filter.connector === "OR") {
            result = result || conditionMet;
          }
        }
      });

      return result;
    });

    setFilteredData(filtered);
  };

  const fieldConfig = useMemo(
    () => generateFieldConfig(initialData),
    [initialData]
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      {filters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucun filtre défini. Cliquez sur "Ajouter un filtre" pour commencer.
        </p>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div
              key={filter.id}
              className="bg-white p-4 rounded-md border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-wrap">
                {filter.connector && (
                  <Select
                    onValueChange={(value) =>
                      updateFilter(filter.id, "connector", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Connecteur logique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">ET</SelectItem>
                      <SelectItem value="OR">OU</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <div className="flex flex-row gap-2">
                  <Select
                    onValueChange={(value) =>
                      updateFilter(filter.id, "field", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Champ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {filter.field && (
                    <Select
                      onValueChange={(value) =>
                        updateFilter(filter.id, "operator", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Opérateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators[
                          fieldConfig[filter.field]
                            ?.type as keyof typeof operators
                        ].map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.field && filter.operator && renderValueInput(filter)}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2 mt-4">
        <Button type="button" variant="outline" onClick={addFilter}>
          <Plus className="w-4 h-4" />
          Ajouter un filtre
        </Button>
        <Button type="button" variant="default" onClick={applyFilters}>
          Appliquer les filtres
        </Button>

        {filters.length > 0 && (
          <Button type="button" variant="destructive" onClick={resetFilters}>
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
