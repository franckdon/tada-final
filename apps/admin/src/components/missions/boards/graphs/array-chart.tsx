"use client";

import { Button } from "@tada/ui/components/button";
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

const WordCloud = ({
  words,
}: {
  words: { word: string; count: number; percentage: string }[];
}) => {
  const maxCount = Math.max(...words.map((w) => w.count));
  const minSize = 14;
  const maxSize = 48;

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

export const ArrayChartCard: FC<ArrayChartCardProps> = ({
  title,
  description,
  participationQuestions,
  texts,
  onDelete,
  isDeletable,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"verbatim" | "responses">(
    "verbatim"
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

  const processTexts = (textArray: string[]) => {
    const wordFreq: Record<string, number> = {};
    const allWords = [];

    textArray.forEach((text) => {
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

  const { wordFreq, totalWords } = useMemo(() => processTexts(texts), [texts]);
  const verbatimData = useMemo(() => {
    return Object.entries(wordFreq)
      .map(([word, count]) => ({
        word,
        count: count as number,
        percentage: (((count as number) / totalWords) * 100).toFixed(1),
      }))
      .sort((a, b) => (b.count as number) - (a.count as number));
  }, [wordFreq, totalWords]);

  const exportToCSV = (
    data: { word: string; count: number; percentage: string }[],
    title: string
  ) => {
    const csvHeader = "Mot,Occurrences,Pourcentage\n";
    const csvRows = data
      .map((item) => `${item.word},${item.count},${item.percentage}`)
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}-wordcloud.csv`;
    link.click();
  };

  return (
    <Card className="h-full bg-white dark:bg-slate-700">
      <CardHeader>
        <CardHeaderChart
          participationQuestions={participationQuestions}
          title={title}
          onDelete={onDelete}
          isDeletable={isDeletable}
          exportTargetId={`id-${title}`}
          chartRef={chartRef}
          handleExportCsv={() => exportToCSV(verbatimData, title)}
        />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 overflow-hidden h-full" id={`id-${title}`}>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4" ref={chartRef}>
          <div className=" rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="font-medium  dark:text-black">Verbatim</span>
                  <span className="font-medium dark:text-black">Tous</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("verbatim")}
                    className={`px-4 py-1 text-sm rounded-full transition-colors ${
                      activeTab === "verbatim"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Nuage de mots
                  </button>
                  <button
                    onClick={() => setActiveTab("responses")}
                    className={`px-4 py-1 text-sm rounded-full transition-colors ${
                      activeTab === "responses"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Tous les verbatims sélectionnés
                  </button>
                </div>
              </div>
            </div>
            <div className="p-0 max-h-96 overflow-y-auto">
              {activeTab === "verbatim"
                ? // Affichage du verbatim
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
                : texts.map((text, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 ${
                        index % 2 === 0
                          ? "bg-white dark:bg-slate-800"
                          : "bg-gray-50 dark:bg-slate-600"
                      } ${
                        index < texts.length - 1
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
                  ))}
            </div>
          </div>
          <div>
            <WordCloud words={verbatimData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
