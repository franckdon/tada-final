"use client";
import { createContext, useContext, useState } from "react";

export type Submission = Record<string, string | number | boolean | Date>;

export interface ChartBuilderContextType {
  vegaLiteSpec: object;
  setVegaLiteSpec: (vegaLiteSpec: object) => void;
  data: Submission[];
  setData: (data: Submission[]) => void;
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  initialData: Submission[];
  generateFieldConfig: (
    data: Submission[]
  ) => Record<string, { type: string; label: string; options?: any[] }>;
}

export interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector: string | null;
}

export const MOCK_DATA: Submission[] = [
  {
    category: "Abidjan",
    value: 28,
    group: "Économique",
    longitude: -4.0267,
    latitude: 5.36,
  },
  {
    category: "Bouaké",
    value: 55,
    group: "Économique",
    longitude: -5.03,
    latitude: 7.69,
  },
  {
    category: "Daloa",
    value: 43,
    group: "Économique",
    longitude: -6.45,
    latitude: 6.88,
  },
  {
    category: "Yamoussoukro",
    value: 35,
    group: "Politique",
    longitude: -5.2767,
    latitude: 6.8206,
  },
  {
    category: "San-Pédro",
    value: 42,
    group: "Politique",
    longitude: -6.6364,
    latitude: 4.7467,
  },
  {
    category: "Korhogo",
    value: 30,
    group: "Politique",
    longitude: -5.63,
    latitude: 9.46,
  },
  {
    category: "Man",
    value: 65,
    group: "Touristique",
    longitude: -7.5539,
    latitude: 7.4125,
  },
  {
    category: "Gagnoa",
    value: 22,
    group: "Touristique",
    longitude: -5.95,
    latitude: 6.13,
  },
];

const ChartBuilderContext = createContext<ChartBuilderContextType | undefined>(
  undefined
);

export function ChartBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [vegaLiteSpec, setVegaLiteSpec] = useState<object>({});
  const [data, setData] = useState<Submission[]>(MOCK_DATA);
  const [initialData, setInitialData] = useState<Submission[]>(MOCK_DATA);
  const [filters, setFilters] = useState<Filter[]>([]);

  const detectFieldType = (values: Submission[]) => {
    const nonNullValues = values.filter((v) => v !== null && v !== undefined);
    if (nonNullValues.length === 0) return "text";

    if (nonNullValues.every((v) => typeof v === "boolean")) {
      return "boolean";
    }
    if (
      nonNullValues.every(
        (v) =>
          typeof v === "number" ||
          (!isNaN(v as unknown as number) &&
            !isNaN(parseFloat(v as unknown as string)))
      )
    ) {
      return "number";
    }

    if (
      nonNullValues.every((v: Submission) => {
        const date = new Date(v as unknown as string);
        return (
          !isNaN(date.getTime()) &&
          typeof v === "string" &&
          (v as unknown as string).match(/^\d{4}-\d{2}-\d{2}$/)
        );
      })
    ) {
      return "date";
    }

    // Check if it's a select (less than 10 unique values and at least 2 repetitions)
    const uniqueValues = [...new Set(nonNullValues)];
    const hasRepeats = uniqueValues.some(
      (val) => nonNullValues.filter((v) => v === val).length > 1
    );

    if (uniqueValues.length <= 10 && hasRepeats && uniqueValues.length > 1) {
      return "select";
    }

    return "text";
  };

  const generateLabel = (fieldName: string) => {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  const generateFieldConfig = (data: Submission[]) => {
    if (!data || data.length === 0) return {};

    const config: Record<
      string,
      { type: string; label: string; options?: any[] }
    > = {};
    const fields = Object.keys(data[0] as Submission);

    fields.forEach((field) => {
      const values = data.map((item) => item[field]);
      const type = detectFieldType(values as unknown as Submission[]);

      config[field as keyof typeof config] = {
        type: type,
        label: generateLabel(field),
      };

      if (type === "select") {
        const uniqueValues = [
          ...new Set(
            values.filter((v) => v !== null && v !== undefined && v !== "")
          ),
        ];
        config[field as keyof typeof config]!.options = uniqueValues.sort();
      } else if (type === "boolean") {
        config[field as keyof typeof config]!.options = [true, false];
      }
    });

    return config;
  };

  return (
    <ChartBuilderContext.Provider
      value={{
        vegaLiteSpec,
        setVegaLiteSpec,
        data,
        setData,
        filters,
        setFilters,
        initialData,
        generateFieldConfig,
      }}
    >
      {children}
    </ChartBuilderContext.Provider>
  );
}

export function useChartBuilder() {
  const context = useContext(ChartBuilderContext);
  if (!context) {
    throw new Error(
      "useChartBuilder must be used within a ChartBuilderProvider"
    );
  }
  return context;
}
