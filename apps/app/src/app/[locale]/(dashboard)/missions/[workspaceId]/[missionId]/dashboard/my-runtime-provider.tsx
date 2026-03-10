"use client";

import { generateExecutiveSummaryAction } from "@/actions/missions/generate-executive-summary-action";
import { MarkdownPreviewCard } from "@/components/missions/boards/graphs/markdown-preview";
import { ParticipantInfo } from "@/components/missions/boards/graphs/participant-info";
import {
  extractSexAndAge,
  getAverageAge,
  groupParticipantsByAge,
  SurveyData,
} from "@/lib/utils";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath, geoBounds } from "d3-geo";
import { feature } from "topojson-client";

function boundsIntersect(
  a: [[number, number], [number, number]],
  b: [[number, number], [number, number]],
) {
  const [[ax1, ay1], [ax2, ay2]] = a;
  const [[bx1, by1], [bx2, by2]] = b;

  return !(ax2 < bx1 || bx2 < ax1 || ay2 < by1 || by2 < ay1);
}

const WORLD_GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DEFAULT_COUNTRY = "Côte d'Ivoire";

const COUNTRY_ALIASES: Record<string, string> = {
  "cote d'ivoire": "Côte d'Ivoire",
  "cote divoire": "Côte d'Ivoire",
  "côte d'ivoire": "Côte d'Ivoire",
  "côte divoire": "Côte d'Ivoire",
  "ivory coast": "Côte d'Ivoire",
  "ivory coast (côte d'ivoire)": "Côte d'Ivoire",

  usa: "United States of America",
  us: "United States of America",
  "united states": "United States of America",
  "united states of america": "United States of America",

  uk: "United Kingdom",
  england: "United Kingdom",

  drc: "Democratic Republic of the Congo",
  "congo kinshasa": "Democratic Republic of the Congo",
  "congo brazzaville": "Republic of the Congo",

  uae: "United Arab Emirates",
};

const IVORY_COAST_CITY_ALIASES = new Set([
  "abidjan",
  "abobo",
  "adjame",
  "adjamé",
  "attecoube",
  "attécoubé",
  "cocody",
  "koumassi",
  "marcory",
  "plateau",
  "port-bouet",
  "port-bouët",
  "treichville",
  "yopougon",
  "bingerville",
  "songon",
  "anyama",
  "grand bassam",
  "bassam",
  "bouake",
  "bouaké",
  "yamoussoukro",
  "san pedro",
  "san-pedro",
  "korhogo",
  "daloa",
  "gagnoa",
  "man",
  "odienne",
  "odienné",
  "abengourou",
  "bondoukou",
  "agboville",
  "dimbokro",
  "soubre",
  "soubré",
]);

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeCountryName(value: string): string {
  const normalized = normalizeText(value);
  return COUNTRY_ALIASES[normalized] || value.trim();
}

function extractCountryFromLocation(location: string): string | null {
  if (!location || typeof location !== "string") return null;

  const raw = location.trim();
  if (!raw) return null;

  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    return normalizeCountryName(lastPart);
  }

  const normalizedSingle = normalizeText(raw);
  if (IVORY_COAST_CITY_ALIASES.has(normalizedSingle)) {
    return DEFAULT_COUNTRY;
  }

  return normalizeCountryName(raw);
}

function buildCountriesFromLocations(locations?: string[]): string[] {
  const detected = new Set<string>();

  for (const location of locations || []) {
    const country = extractCountryFromLocation(location);
    if (country) detected.add(country);
  }

  if (detected.size === 0) {
    detected.add(DEFAULT_COUNTRY);
  }

  return Array.from(detected);
}

function formatDateRange(raw?: string | null) {
  if (!raw) return "Période non renseignée";
  return raw.replace(" to ", " - ");
}

function MapLegendPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
      {label}
    </span>
  );
}

function FocusCountriesMap({ countries }: { countries: string[] }) {
  const [geographies, setGeographies] = useState<any[]>([]);

  const normalizedCountries = useMemo(
    () => new Set(countries.map((c) => normalizeText(c))),
    [countries],
  );

  useEffect(() => {
    let mounted = true;

    async function loadMap() {
      try {
        const res = await fetch(WORLD_GEO_URL);
        const topology = await res.json();

        const countriesFeature = feature(
          topology,
          topology.objects.countries,
        ) as any;

        if (mounted) {
          setGeographies(countriesFeature.features || []);
        }
      } catch (error) {
        console.error("Failed to load map data", error);
        if (mounted) setGeographies([]);
      }
    }

    loadMap();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedGeographies = useMemo(() => {
    const matched = geographies.filter((geo) =>
      normalizedCountries.has(
        normalizeText(String(geo.properties?.name || "")),
      ),
    );

    if (matched.length > 0) return matched;

    return geographies.filter(
      (geo) =>
        normalizeText(String(geo.properties?.name || "")) ===
        normalizeText(DEFAULT_COUNTRY),
    );
  }, [geographies, normalizedCountries]);

  const svgContent = useMemo(() => {
    const width = 900;
    const height = 620;

    if (!selectedGeographies.length) {
      return {
        width,
        height,
        paths: [] as { key: string; d: string }[],
        shadowPaths: [] as { key: string; d: string }[],
      };
    }

    const featureCollection = {
      type: "FeatureCollection" as const,
      features: selectedGeographies,
    };

    const projection = geoMercator().fitExtent(
      [
        [40, 40],
        [width - 40, height - 40],
      ],
      featureCollection as any,
    );

    const pathGenerator = geoPath(projection);

    const paths = selectedGeographies
      .map((geo, index) => {
        const d = pathGenerator(geo);
        if (!d) return null;
        return { key: `main-${index}`, d };
      })
      .filter(Boolean) as { key: string; d: string }[];

    const shadowPaths = selectedGeographies
      .map((geo, index) => {
        const d = pathGenerator(geo);
        if (!d) return null;
        return { key: `shadow-${index}`, d };
      })
      .filter(Boolean) as { key: string; d: string }[];

    return { width, height, paths, shadowPaths };
  }, [selectedGeographies]);

  return (
    <div className="relative h-[320px] w-full md:h-[420px] xl:h-[520px]">
      <svg
        viewBox={`0 0 ${svgContent.width} ${svgContent.height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(18, 10) scale(1.03)">
          {svgContent.shadowPaths.map((item) => (
            <path key={item.key} d={item.d} fill="#dde2ea" opacity={0.45} />
          ))}
        </g>

        <g>
          {svgContent.paths.map((item) => (
            <path
              key={item.key}
              d={item.d}
              fill="#6f8fe9"
              stroke="#6f8fe9"
              strokeWidth={1.2}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function MissionHeroHeader({
  title,
  locations,
  collectionPeriod,
}: {
  title: string;
  locations?: string[];
  collectionPeriod?: string | null;
}) {
  const highlightedCountries = useMemo(
    () => buildCountriesFromLocations(locations),
    [locations],
  );

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[#f5f5f7] px-6 py-6 md:px-10 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.75),transparent_30%),linear-gradient(90deg,rgba(255,255,255,0.6),rgba(255,255,255,0.15))]" />

      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_1fr]">
        <div className="z-10">
          <div className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Mission board
          </div>

          <h1 className="max-w-4xl text-6xl font-black leading-[0.95] tracking-[-0.04em] text-slate-900">
            {title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            {highlightedCountries.map((country) => (
              <MapLegendPill key={country} label={country} />
            ))}
          </div>

          {/* {collectionPeriod && (
            <div className="mt-8">
              <div className="text-base font-bold text-slate-900">
                Field time
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {formatDateRange(collectionPeriod)}
              </div>
            </div>
          )} */}
        </div>

        <div className="relative">
          <FocusCountriesMap countries={highlightedCountries} />
        </div>
      </div>
    </section>
  );
}

export function MyRuntimeProvider({
  children,
  responses,
  mission,
}: Readonly<{
  children: React.ReactNode;
  responses: SurveyData | null;
  mission: {
    id: string;
    status: string;
    executiveSummary: string | null;
    executiveSummaryUpdatedAt?: Date | string | null;
  };
}>) {
  const [executiveSummary, setExecutiveSummary] = useState<string>("");

  const chat = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  const runtime = useAISDKRuntime(chat);

  useAction(generateExecutiveSummaryAction, {});

  const participants = useMemo(() => extractSexAndAge(responses), [responses]);

  const validParticipants = useMemo(
    () =>
      participants.filter((p) => {
        const age = parseInt(p.age, 10);
        return (p.sexe === "male" || p.sexe === "female") && !Number.isNaN(age);
      }),
    [participants],
  );

  const sexAgeData = useMemo(
    () => groupParticipantsByAge(validParticipants),
    [validParticipants],
  );

  const averageAge = useMemo(
    () => getAverageAge(validParticipants),
    [validParticipants],
  );

  const coveredLocations = useMemo(
    () => responses?.metadata?.locations_covered || [],
    [responses],
  );

  useEffect(() => {
    if (mission?.status === "completed" && mission?.executiveSummary) {
      setExecutiveSummary(mission.executiveSummary);
    } else {
      setExecutiveSummary("");
    }
  }, [mission]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="mx-auto max-w-7xl space-y-8">
        <MissionHeroHeader
          title={responses?.survey_title || "Mission"}
          locations={coveredLocations}
          collectionPeriod={responses?.metadata?.collection_period || null}
        />

        <div className="w-full">
          <ParticipantInfo
            subDashboardItemId=""
            data={sexAgeData}
            config={{
              age: { label: "age", color: "hsl(var(--chart-1))" },
              male: { label: "Homme", color: "hsl(var(--chart-6))" },
              female: { label: "Femme", color: "hsl(var(--chart-2))" },
            }}
            categoryKey="age"
            title=""
            description=""
            participationQuestions=""
            primaryKeys={["male", "female"]}
            label="value"
            participantCount={responses?.metadata.total_responses || 0}
            dates={
              responses?.metadata.collection_period?.replace(" to ", " - ") ||
              ""
            }
            locations={coveredLocations}
            averageAge={averageAge}
          />
        </div>

        <div className="space-y-8">
          {executiveSummary && mission?.status === "completed" && (
            <div className="w-full">
              <MarkdownPreviewCard
                title="📋 Résumé Exécutif"
                description=""
                participationQuestions={
                  mission.executiveSummaryUpdatedAt
                    ? `Mis à jour le ${new Date(
                        mission.executiveSummaryUpdatedAt,
                      ).toLocaleDateString("fr-FR")}`
                    : ""
                }
                content={executiveSummary}
              />
            </div>
          )}

          {children}
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
