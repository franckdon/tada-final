"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Textarea } from "@tada/ui/components/textarea";
import { cn } from "@tada/ui/lib/utils";
import { AiChart } from "@/components/ai/AiChart";

type AiDataset = {
  id: string;
  name: string;
  description?: string | null;
  rowCount?: number | null;
  columnCount?: number | null;
  createdAt: string;
};

type AiAnalysisChart = {
  id: string;
  type: string;
  subType?: string | null;
  title?: string | null;
  description?: string | null;
  chartData: any;
  config?: any;
};

type AiAnalysisQuery = {
  id: string;
  question: string;
  answer?: string | null;
  answerJson?: any;
  model?: string | null;
  latencyMs?: number | null;
  createdAt: string;
};

type AiAnalysis = {
  id: string;
  title: string;
  type: string;
  language: string;
  createdAt: string;
  datasetId: string;
  charts: AiAnalysisChart[];
  // côté backend je t’avais proposé de renvoyer les dernières queries
  lastQueries?: AiAnalysisQuery[];
};

export default function AnalysisPage() {
  const t = useI18n();

  const [datasets, setDatasets] = useState<AiDataset[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );

  const [analyses, setAnalyses] = useState<AiAnalysis[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  const [selectedAnalysis, setSelectedAnalysis] = useState<AiAnalysis | null>(
    null
  );

  const [newAnalysisTitle, setNewAnalysisTitle] = useState("");
  const [creatingAnalysis, setCreatingAnalysis] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [queryHistory, setQueryHistory] = useState<AiAnalysisQuery[]>([]);

  //upload file
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 🔹 1) Charger les datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setDatasetsLoading(true);
        const res = await fetch("/api/ai/datasets");
        if (!res.ok) {
          console.error("Failed to load datasets", await res.text());
          return;
        }
        const json = await res.json();
        const items: AiDataset[] = json.datasets ?? json; // selon comment tu as structuré la route
        setDatasets(items);
        if (items.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(items[0].id);
        }
      } catch (e) {
        console.error("Error loading datasets", e);
      } finally {
        setDatasetsLoading(false);
      }
    };

    fetchDatasets();
  }, [selectedDatasetId]);

  // 🔹 2) Charger les analyses pour le dataset sélectionné
  useEffect(() => {
    if (!selectedDatasetId) return;

    const fetchAnalyses = async () => {
      try {
        setAnalysesLoading(true);
        const res = await fetch(
          `/api/ai/analyses?datasetId=${encodeURIComponent(selectedDatasetId)}`
        );
        if (!res.ok) {
          console.error("Failed to load analyses", await res.text());
          return;
        }
        const json = await res.json();
        const items: AiAnalysis[] = json.analyses ?? json;
        setAnalyses(items);

        if (items.length > 0) {
          // On sélectionne la première analyse par défaut
          selectAnalysis(items[0].id, items[0]);
        } else {
          setSelectedAnalysis(null);
          setQueryHistory([]);
        }
      } catch (e) {
        console.error("Error loading analyses", e);
      } finally {
        setAnalysesLoading(false);
      }
    };

    fetchAnalyses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatasetId]);

  const handleUploadDataset = async () => {
    if (!uploadFile || uploading) return;

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", uploadFile);
      if (uploadName.trim()) {
        formData.append("name", uploadName.trim());
      }

      const res = await fetch("/api/ai/datasets", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to upload dataset", text);
        setUploadError("Échec de l’upload du dataset");
        return;
      }

      const json = await res.json();
      const created: AiDataset = json.dataset ?? json;

      // Ajouter dans la liste + sélectionner automatiquement
      setDatasets((prev) => [created, ...prev]);
      setSelectedDatasetId(created.id);

      // Reset du formulaire
      setUploadFile(null);
      setUploadName("");
    } catch (e) {
      console.error("Error uploading dataset", e);
      setUploadError("Erreur lors de l’upload du dataset");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 helper pour charger une analyse complète (charts + queries)
  const selectAnalysis = async (id: string, fallback?: AiAnalysis) => {
    try {
      const res = await fetch(`/api/ai/analyses/${id}`);
      if (!res.ok) {
        console.error("Failed to load analysis", await res.text());
        if (fallback) {
          setSelectedAnalysis(fallback);
        }
        return;
      }
      const json = await res.json();
      const analysis: AiAnalysis = json.analysis ?? json;
      setSelectedAnalysis(analysis);
      setQueryHistory(analysis.lastQueries ?? []);
    } catch (e) {
      console.error("Error loading analysis detail", e);
      if (fallback) {
        setSelectedAnalysis(fallback);
      }
    }
  };

  // 🔹 3) Créer une analyse pour le dataset sélectionné
  const handleCreateAnalysis = async () => {
    if (!selectedDatasetId || creatingAnalysis) return;

    const title =
      newAnalysisTitle.trim() ||
      `Exploration - ${new Date().toLocaleDateString()}`;

    try {
      setCreatingAnalysis(true);
      const res = await fetch("/api/ai/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: selectedDatasetId,
          title,
        }),
      });

      if (!res.ok) {
        console.error("Failed to create analysis", await res.text());
        return;
      }

      const json = await res.json();
      const created: AiAnalysis = json.analysis ?? json;

      // rafraîchir la liste
      setAnalyses((prev) => [created, ...prev]);
      setSelectedAnalysis(created);
      setQueryHistory([]);
      setNewAnalysisTitle("");
    } catch (e) {
      console.error("Error creating analysis", e);
    } finally {
      setCreatingAnalysis(false);
    }
  };

  // 🔹 4) Poser une question IA
  const handleAskQuestion = async () => {
    if (!selectedAnalysis || !question.trim() || asking) return;

    const q = question.trim();
    setQuestion("");

    try {
      setAsking(true);
      const res = await fetch(`/api/ai/analyses/${selectedAnalysis.id}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        console.error("Failed to ask question", await res.text());
        return;
      }

      const json = await res.json();
      const query = json.query as AiAnalysisQuery | undefined;
      if (query) {
        setQueryHistory((prev) => [query, ...prev]);
      }

      // Recharger l’analyse pour récupérer d’éventuels nouveaux charts
      await selectAnalysis(selectedAnalysis.id);
    } catch (e) {
      console.error("Error asking question", e);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {t("analysis.title") || "AI Analysis"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("analysis.subtitle") ||
              "Importez vos datasets, générez des dashboards IA et posez des questions en langage naturel."}
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* COLONNE GAUCHE : DATASETS */}
        <div className="flex w-72 flex-col rounded-lg border bg-card p-3">
          <div className="mb-3">
            <h2 className="text-sm font-medium">Datasets</h2>
            <p className="text-xs text-muted-foreground">
              Importez un fichier (CSV, XLSX...) puis créez des dashboards IA.
            </p>
          </div>

          {/* Bloc upload dataset */}
          <div className="mb-3 rounded-md border bg-background p-2">
            <div className="mb-2">
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Nom du dataset (optionnel)"
                className="h-8 text-xs"
              />
            </div>

            <label className="mb-2 flex cursor-pointer items-center justify-between rounded-md border border-dashed px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/40">
              <span className="truncate">
                {uploadFile
                  ? uploadFile.name
                  : "Choisir un fichier (CSV, XLSX, ...)"}
              </span>
              <span className="rounded bg-muted px-2 py-0.5 text-[10px]">
                Parcourir
              </span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.json,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFile(file);
                    if (!uploadName.trim()) {
                      setUploadName(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }
                }}
              />
            </label>

            {uploadError && (
              <p className="mb-1 text-[11px] text-red-500">{uploadError}</p>
            )}

            <Button
              size="sm"
              className="w-full"
              disabled={!uploadFile || uploading}
              onClick={handleUploadDataset}
            >
              {uploading ? "Upload en cours..." : "Importer le dataset"}
            </Button>
          </div>

          {/* Liste des datasets */}
          <div className="flex-1 space-y-1 overflow-auto">
            {datasetsLoading && (
              <p className="text-xs text-muted-foreground">
                Chargement des datasets...
              </p>
            )}

            {!datasetsLoading && datasets.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Aucun dataset IA pour l’instant. Importez un fichier ci-dessus.
              </p>
            )}

            {!datasetsLoading &&
              datasets.map((ds) => (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => setSelectedDatasetId(ds.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left text-xs transition hover:bg-muted",
                    selectedDatasetId === ds.id && "bg-muted font-medium"
                  )}
                >
                  <div className="truncate">{ds.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {ds.rowCount ?? "?"} lignes · {ds.columnCount ?? "?"}{" "}
                      colonnes
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* ZONE DROITE : GRID 12 COLONNES (analyses + chat + charts) */}
        <div className="min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Top gauche : Analyses IA (col-8) */}
          <div className="lg:col-span-8 flex flex-col rounded-lg border bg-card p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium">Analyses IA</h2>
                <p className="text-xs text-muted-foreground">
                  Un dataset peut avoir plusieurs dashboards IA.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newAnalysisTitle}
                  onChange={(e) => setNewAnalysisTitle(e.target.value)}
                  placeholder="Titre du dashboard IA"
                  className="h-8 w-52 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleCreateAnalysis}
                  disabled={!selectedDatasetId || creatingAnalysis}
                >
                  {creatingAnalysis ? "Création..." : "Nouveau dashboard"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {analysesLoading && (
                <span className="text-xs text-muted-foreground">
                  Chargement des analyses...
                </span>
              )}

              {!analysesLoading && analyses.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Aucune analyse IA pour ce dataset. Créez-en une.
                </span>
              )}

              {!analysesLoading &&
                analyses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => selectAnalysis(a.id, a)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-left text-xs transition hover:border-primary",
                      selectedAnalysis?.id === a.id &&
                        "border-primary bg-primary/5"
                    )}
                  >
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.type} · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Top droite : Chat IA (col-4) */}
          <div className="lg:col-span-4 flex flex-col rounded-lg border bg-card p-3">
            <h2 className="mb-2 text-sm font-medium">
              Pose une question à l’IA
            </h2>
            <p className="mb-2 text-xs text-muted-foreground">
              Exemples : &quot;Quels segments sont les plus satisfaits ?&quot;,
              &quot;Comment évolue le NPS par tranche d’âge ?&quot;
            </p>

            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Écris ta question en langage naturel..."
              className="min-h-[80px] text-sm"
            />

            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={handleAskQuestion}
                disabled={!selectedAnalysis || !question.trim() || asking}
              >
                {asking ? "Analyse en cours..." : "Lancer l’analyse IA"}
              </Button>
            </div>

            <div className="mt-4 flex-1 overflow-auto rounded-md bg-muted/40 p-2">
              {queryHistory.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Aucune question posée pour ce dashboard. Les futures questions
                  apparaîtront ici avec la réponse.
                </p>
              )}

              {queryHistory.map((q) => (
                <div key={q.id} className="mb-3 rounded bg-background p-2">
                  <div className="mb-1 text-[11px] font-semibold text-primary">
                    Question
                  </div>
                  <p className="mb-2 text-xs">{q.question}</p>

                  {q.answer && (
                    <>
                      <div className="mb-1 text-[11px] font-semibold text-emerald-600">
                        Réponse IA
                      </div>
                      <p className="mb-1 text-xs whitespace-pre-line">
                        {q.answer}
                      </p>
                    </>
                  )}

                  {q.latencyMs != null && (
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {new Date(q.createdAt).toLocaleTimeString()} ·
                        {q.model || "LLM"}
                      </span>
                      <span>{q.latencyMs} ms</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ligne du bas : Charts (col-12, pleine largeur sous les deux cartes) */}
          <div className="lg:col-span-12 flex min-h-[260px] flex-col rounded-lg border bg-card p-3">
            {!selectedAnalysis && (
              <div className="flex h-full flex-col items-center justify-center text-sm text-muted-foreground">
                Sélectionnez un dataset et un dashboard IA pour voir les
                graphiques.
              </div>
            )}

            {selectedAnalysis && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium">
                      {selectedAnalysis.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedAnalysis.language.toUpperCase()} ·{" "}
                      {selectedAnalysis.type}
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-3 overflow-auto md:grid-cols-2 xl:grid-cols-3">
                  {selectedAnalysis.charts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-xs text-muted-foreground">
                      Aucun graphique généré pour l’instant. Pose une question à
                      l’IA dans la carte de droite.
                    </div>
                  )}

                  {selectedAnalysis.charts.map((chart) => (
                    <div
                      key={chart.id}
                      className="flex flex-col rounded-md border bg-background p-3 text-xs"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">
                          {chart.title || chart.type.toUpperCase()}
                        </div>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {chart.type}
                          {chart.subType ? ` • ${chart.subType}` : ""}
                        </span>
                      </div>
                      {chart.description && (
                        <p className="mb-2 text-[11px] text-muted-foreground">
                          {chart.description}
                        </p>
                      )}

                      <div className="mt-auto">
                        <AiChart chart={chart} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
