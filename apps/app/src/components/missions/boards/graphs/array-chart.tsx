"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { ArrayChartCardProps } from "./type";
import { FC, useMemo, useRef, useState } from "react";
import { CardHeaderChart } from "./ui/card-header";
import { useSetDocumentId, VeltComments } from "@veltdev/react";

const WordCloud = ({
  words,
}: {
  words: { word: string; count: number; percentage: string }[];
}) => {
  const maxCount = Math.max(...words.map((w) => w.count));
  const minSize = 14;
  const maxSize = 48;

  if (!words.length || maxCount === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full rounded-lg border bg-gray-50">
        <span className="text-xs text-gray-500 text-center px-4">
          Pas assez de verbatims pour générer un nuage de mots.
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 overflow-hidden">
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
        {words.map((item, index) => {
          const size = minSize + (item.count / maxCount) * (maxSize - minSize);
          const colors = [
            "text-blue-600",
            "text-indigo-500",
            "text-sky-500",
            "text-cyan-500",
            "text-blue-700",
            "text-indigo-600",
            "text-purple-500",
          ];
          const color = colors[index % colors.length];

          return (
            <span
              key={item.word}
              className={`font-semibold ${color} hover:scale-110 transition-transform cursor-pointer select-none`}
              style={{
                fontSize: `${size}px`,
                opacity: 0.7 + (item.count / maxCount) * 0.3,
                transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
              }}
              title={`${item.word}: ${item.count} occurrences (${item.percentage}%)`}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const ArrayChartCard: FC<
  ArrayChartCardProps & {
    handleExportCsv?: () => void;
    onCommentsClick?: () => void;
    commentCount?: number;
  }
> = ({
  title,
  description,
  participationQuestions,
  texts,
  onDelete,
  isDeletable,
  subDashboardItemId,
  handleExportCsv,
  onCommentsClick,
  commentCount = 0,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  useSetDocumentId(subDashboardItemId);

  // 👉 2 modes : "responses" = liste de verbatims, "cloud" = nuage de mots
  const [activeTab, setActiveTab] = useState<"responses" | "cloud">(
    "responses"
  );

  const stopWords = new Set([
    "le",
    "de",
    "et",
    "à",
    "un",
    "il",
    "être",
    "et",
    "en",
    "avoir",
    "que",
    "pour",
    "dans",
    "ce",
    "son",
    "une",
    "sur",
    "avec",
    "ne",
    "se",
    "pas",
    "tout",
    "plus",
    "par",
    "grand",
    "il",
    "me",
    "même",
    "faire",
    "elle",
    "si",
    "lors",
    "mon",
    "man",
    "qui",
    "lui",
    "va",
    "où",
    "up",
    "du",
    "la",
    "des",
    "les",
    "aux",
    "cette",
    "ces",
    "sa",
    "ses",
    "nos",
    "vos",
    "leur",
    "leurs",
    "mais",
    "ou",
    "donc",
    "car",
    "ni",
    "or",
  ]);

  // 🔁 Transforme tout (string, {label,value}, objets de rating, etc.) en string
  const normalizeTexts = (rawTexts: unknown[]): string[] => {
    return (rawTexts ?? [])
      .map((item) => {
        // String simple
        if (typeof item === "string") return item;

        // Objet
        if (item && typeof item === "object") {
          const obj = item as any;

          // Cas dropdown / checkbox: { label, value }
          if ("label" in obj && "value" in obj) {
            return `${obj.label} : ${obj.value}`;
          }

          // Cas rating table: { "3": 1, "4": 1, "5": 1, category: "Évaluation" }
          if ("category" in obj) {
            const { category, ...rest } = obj;
            const parts = Object.entries(rest).map(
              ([key, value]) => `${key} : ${value}`
            );
            return `${category} | ${parts.join(" | ")}`;
          }

          // Fallback générique
          try {
            return JSON.stringify(obj);
          } catch {
            return "";
          }
        }

        return "";
      })
      .filter((t) => t && t.trim().length > 0);
  };

  const processTexts = (textArray: string[]) => {
    const wordFreq: Record<string, number> = {};
    const allWords: string[] = [];

    textArray.forEach((raw) => {
      const text = raw.trim();
      if (!text) return;

      const words = text
        .toLowerCase()
        .replace(/[^\w\s'àâäçéèêëïîôöùûüÿ]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));

      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
        allWords.push(word);
      });
    });

    return { wordFreq, totalWords: allWords.length };
  };

  // ✅ On normalise une fois pour toutes
  const normalizedTexts = useMemo(() => normalizeTexts(texts), [texts]);

  const { wordFreq, totalWords } = useMemo(
    () => processTexts(normalizedTexts),
    [normalizedTexts]
  );

  const verbatimData = useMemo(
    () =>
      Object.entries(wordFreq)
        .map(([word, count]) => ({
          word,
          count: count as number,
          percentage: totalWords
            ? (((count as number) / totalWords) * 100).toFixed(1)
            : "0.0",
        }))
        .sort((a, b) => (b.count as number) - (a.count as number)),
    [wordFreq, totalWords]
  );

  return (
    <>
      <VeltComments />
      <Card className="h-full bg-white dark:bg-slate-700 border-none mx-auto w-full px-4">
        <CardHeader>
          <CardHeaderChart
            participationQuestions={participationQuestions}
            title={title}
            onDelete={onDelete}
            isDeletable={isDeletable}
            exportTargetId={`id-${title}`}
            chartRef={chartRef}
            subDashboardItemId={subDashboardItemId}
            handleExportCsv={handleExportCsv}
            onCommentsClick={onCommentsClick}
            commentCount={commentCount}
          />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 overflow-hidden h-full" id={`id-${title}`}>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Colonne gauche */}
            <div className="rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium dark:text-black">
                      Verbatims
                    </span>
                    <span className="text-xs text-gray-500">
                      {normalizedTexts.length} réponses ouvertes
                    </span>
                  </div>
                  {/* Tabs : Verbatims / Nuage de mots */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("responses")}
                      className={`px-4 py-1 text-sm rounded-full transition-colors ${
                        activeTab === "responses"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Verbatims
                    </button>
                    <button
                      onClick={() => setActiveTab("cloud")}
                      className={`px-4 py-1 text-sm rounded-full transition-colors ${
                        activeTab === "cloud"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Nuage de mots
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-0 max-h-96 overflow-y-auto">
                {/* Mode VERBATIMS : liste des réponses complètes */}
                {activeTab === "responses" &&
                  (normalizedTexts.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Aucun verbatim pour cette question.
                    </div>
                  ) : (
                    normalizedTexts.map((text, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-slate-800"
                            : "bg-gray-50 dark:bg-slate-600"
                        } ${
                          index < normalizedTexts.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 text-sm font-medium min-w-8">
                            {index + 1}.
                          </span>
                          <span className="text-gray-700 text-sm leading-relaxed">
                            {text}
                          </span>
                        </div>
                      </div>
                    ))
                  ))}

                {/* Mode NUAGE DE MOTS : tableau Mot / % */}
                {activeTab === "cloud" &&
                  (verbatimData.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Pas assez de verbatims pour calculer un nuage de mots.
                    </div>
                  ) : (
                    verbatimData.map((item, index) => (
                      <div
                        key={item.word}
                        className={`flex justify-between items-center px-4 py-3  ${
                          index % 2 === 0
                            ? "bg-white dark:bg-slate-800"
                            : "bg-gray-50 dark:bg-slate-600"
                        } ${
                          index < verbatimData.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <span className="font-medium text-gray-700">
                          {item.word}
                        </span>
                        <span className="text-gray-600">
                          {item.percentage}% ({item.count})
                        </span>
                      </div>
                    ))
                  ))}
              </div>
            </div>

            {/* Colonne droite : Word Cloud seulement en mode "Nuage de mots" */}
            <div ref={chartRef}>
              {activeTab === "cloud" ? (
                <WordCloud words={verbatimData} />
              ) : (
                <div className="flex items-center justify-center h-full rounded-lg border bg-gray-50">
                  <span className="text-xs text-gray-500 text-center px-4">
                    Cliquez sur &quot;Nuage de mots&quot; pour visualiser les
                    mots les plus fréquents.
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
