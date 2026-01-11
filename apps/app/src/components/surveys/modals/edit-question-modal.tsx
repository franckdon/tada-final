"use client";

import {
  type Survey,
  type SurveyQuestion,
  useSurveysBuilder,
  type MediaType,
  type GpsMode,
  type HeatmapConfig,
} from "@/context/surveys-builder-context";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageRankingConfigurator } from "../_partials/ImageRankingConfigurator";
import { MediaQuestionSettings } from "../_partials/MediaQuestionSettings";
import { MatrixQuestionSettings } from "../_partials/MatrixQuestionSettings";
import { DragDropRankingSettings } from "../_partials/DragDropRankingSettings";
import { HeatmapQuestionSettings } from "../_partials/HeatmapQuestionSettings";
import {
  QuestionSectionSelector,
  type SectionOption,
} from "../_partials/QuestionSectionSelector";

type Props = {
  question: SurveyQuestion | null;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  updateSurveyQuestions: (surveys: Survey) => void;
  isLoadingUpdate: boolean;
};

type QuestionKind =
  | "single_choice"
  | "multiple_choice"
  | "likert"
  | "numeric_scale"
  | "slider"
  | "open"
  | "rating"
  | "matrix"
  | "image_ranking"
  | "drag_drop_ranking"
  | "media"
  | "heatmap"
  | "gps"
  | "section"
  | "boolean";

type ImageChoice = {
  id: string;
  value: string;
  label: string;
  imageUrl: string;
  description?: string;
};

export function EditQuestionModal({
  question,
  onOpenChange,
  isOpen,
  updateSurveyQuestions,
  isLoadingUpdate,
}: Props) {
  const { surveys, setSurveys } = useSurveysBuilder();
  const t = useI18n();

  // ---------- STATE COMMUN ----------
  const [questionTitle, setQuestionTitle] = useState("");
  const [description, setDescription] = useState("");

  const [questionKind, setQuestionKind] = useState<QuestionKind | null>(null);

  // choix texte
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);

  // drag & drop ranking
  const [rankingOptions, setRankingOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
  ]);

  // échelles
  const [scaleMin, setScaleMin] = useState<number>(1);
  const [scaleMax, setScaleMax] = useState<number>(5);
  const [minLabel, setMinLabel] = useState<string>("");
  const [maxLabel, setMaxLabel] = useState<string>("");

  // matrix
  const [rows, setRows] = useState<string[]>(["Ligne 1", "Ligne 2"]);
  const [columns, setColumns] = useState<string[]>(["Colonne 1", "Colonne 2"]);

  // media
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>(["photo"]);
  const [maxFiles, setMaxFiles] = useState<number>(1);
  const [maxSizeMb, setMaxSizeMb] = useState<number>(10);
  const [maxDurationSeconds, setMaxDurationSeconds] = useState<
    number | undefined
  >(60);
  const [captureRequired, setCaptureRequired] = useState<boolean>(false);

  // gps
  const [gpsMode, setGpsMode] = useState<GpsMode>("pin");
  const [targetLat, setTargetLat] = useState<string>("");
  const [targetLng, setTargetLng] = useState<string>("");
  const [targetLabel, setTargetLabel] = useState<string>("");
  const [maxDistanceMeters, setMaxDistanceMeters] = useState<string>("");
  const [minTimeOnSiteSeconds, setMinTimeOnSiteSeconds] = useState<string>("");
  const [requiresPathTracking, setRequiresPathTracking] =
    useState<boolean>(false);
  const [gpsToleranceMeters, setGpsToleranceMeters] = useState<string>("");

  // flags communs
  const [isRequired, setIsRequired] = useState(false);
  const [hasOther, setHasOther] = useState(false);

  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>({
    stimulusSource: "url",
    stimulusImageUrl: "",
    stimulusImage: undefined,
    allowMultipleClicks: false,
    maxClicks: 3,
    collectReason: false,
  });

  const [imageChoices, setImageChoices] = useState<ImageChoice[]>([
    {
      id: crypto.randomUUID(),
      value: "choice_1",
      label: "Image 1",
      imageUrl: "",
    },
    {
      id: crypto.randomUUID(),
      value: "choice_2",
      label: "Image 2",
      imageUrl: "",
    },
  ]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  const [mediaMode, setMediaMode] = useState<"upload" | "stimulus">("upload");
  const [stimulusSource, setStimulusSource] = useState<"upload" | "url">("url");
  const [stimulusMediaUrl, setStimulusMediaUrl] = useState<string>("");
  const [stimulusMediaType, setStimulusMediaType] =
    useState<MediaType>("photo");
  const [stimulusFileName, setStimulusFileName] = useState<
    string | undefined
  >();

  // ---------- OPTIONS DE SECTION ----------
  const sectionOptions: SectionOption[] = useMemo(() => {
    if (!surveys?.pages?.length) return [];

    const elements = surveys.pages[0]?.elements ?? [];

    return elements
      .filter((el) => {
        const isSection =
          el.type === "section" ||
          el.category === "section" ||
          (el as any).isSectionTitle;
        return isSection;
      })
      .map((el) => ({
        id: (el as any).sectionId ?? el.name,
        title: (el as any).sectionTitle ?? el.title ?? el.name,
      }));
  }, [surveys]);

  // ---------- RESET ----------
  const resetForm = () => {
    setQuestionTitle("");
    setDescription("");
    setQuestionKind(null);
    setOptions(["Option 1", "Option 2"]);
    setRankingOptions(["Option 1", "Option 2"]);
    setScaleMin(1);
    setScaleMax(5);
    setMinLabel("");
    setMaxLabel("");
    setRows(["Ligne 1", "Ligne 2"]);
    setColumns(["Colonne 1", "Colonne 2"]);
    setMediaTypes(["photo"]);
    setMaxFiles(1);
    setMaxSizeMb(10);
    setMaxDurationSeconds(60);
    setCaptureRequired(false);
    setGpsMode("pin");
    setTargetLat("");
    setTargetLng("");
    setTargetLabel("");
    setMaxDistanceMeters("");
    setMinTimeOnSiteSeconds("");
    setRequiresPathTracking(false);
    setGpsToleranceMeters("");
    setIsRequired(false);
    setHasOther(false);
    setImageChoices([
      {
        id: crypto.randomUUID(),
        value: "choice_1",
        label: "Image 1",
        imageUrl: "",
      },
      {
        id: crypto.randomUUID(),
        value: "choice_2",
        label: "Image 2",
        imageUrl: "",
      },
    ]);
    setHeatmapConfig({
      stimulusSource: "url",
      stimulusImageUrl: "",
      stimulusImage: undefined,
      allowMultipleClicks: false,
      maxClicks: 3,
      collectReason: false,
    });
    setSelectedSectionId(null);
    setMediaMode("upload");
    setStimulusSource("url");
    setStimulusMediaUrl("");
    setStimulusMediaType("photo");
    setStimulusFileName(undefined);
  };

  // ---------- DÉTERMINER LE "KIND" À PARTIR DE LA QUESTION ----------
  function inferQuestionKind(q: SurveyQuestion): QuestionKind {
    if (q.category === "single_choice") return "single_choice";
    if (q.category === "multiple_choice") return "multiple_choice";
    if (q.category === "likert") return "likert";
    if (q.category === "numeric_scale") return "numeric_scale";
    if (q.category === "slider") return "slider";
    if (q.category === "open") return "open";
    if (q.category === "rating") return "rating";
    if (q.category === "matrix") {
      // cas particulier : drag & drop ranking texte
      if (q.type === "ranking") return "drag_drop_ranking";
      return "matrix";
    }
    if (q.category === "image_ranking") return "image_ranking";
    if (q.category === "media") return "media";
    if (q.category === "gps") return "gps";
    if (q.category === "section" || q.type === "section") return "section";
    if (q.type === "boolean") return "boolean";
    if (q.category === "heatmap" || q.type === "heatmap") return "heatmap";

    // fallback
    return "open";
  }

  // ---------- PRÉ-REMPLIR LES ÉTATS À PARTIR DE question ----------
  useEffect(() => {
    if (!question || !isOpen) {
      resetForm();
      return;
    }

    setQuestionTitle(question.title ?? "");
    setDescription(question.description ?? "");
    setIsRequired(!!question.isRequired);
    setHasOther(!!(question as any).hasOther);
    setSelectedSectionId((question as any).sectionId ?? null);

    const kind = inferQuestionKind(question);
    setQuestionKind(kind);

    // Single / multiple choice
    if (kind === "single_choice" || kind === "multiple_choice") {
      setOptions(
        question.choices && question.choices.length > 0
          ? question.choices
          : ["Option 1", "Option 2"]
      );
    }

    // Drag & drop ranking texte
    if (kind === "drag_drop_ranking") {
      setRankingOptions(
        question.choices && question.choices.length > 0
          ? question.choices
          : ["Option 1", "Option 2"]
      );
    }

    // Image ranking
    if (kind === "image_ranking") {
      const imgChoices = (question as any).imageChoices as
        | ImageChoice[]
        | undefined;
      if (imgChoices && imgChoices.length > 0) {
        setImageChoices(
          imgChoices.map((c) => ({
            id: c.id ?? crypto.randomUUID(),
            value: c.value,
            label: c.label,
            imageUrl: c.imageUrl,
            description: c.description,
          }))
        );
      }
    }

    // Likert / rating
    if (kind === "likert" || kind === "rating") {
      setScaleMin((question as any).rateMin ?? 1);
      setScaleMax((question as any).rateMax ?? 5);
      setMinLabel((question as any).minRateDescription ?? "");
      setMaxLabel((question as any).maxRateDescription ?? "");
    }

    // Numeric scale / slider
    if (kind === "numeric_scale" || kind === "slider") {
      const qAny = question as any;
      const min = qAny.min ?? qAny.rateMin ?? 1;
      const max = qAny.max ?? qAny.rateMax ?? 5;
      setScaleMin(min);
      setScaleMax(max);
    }

    // Matrix
    if (kind === "matrix") {
      const qAny = question as any;
      setRows(
        qAny.rows && qAny.rows.length > 0 ? qAny.rows : ["Ligne 1", "Ligne 2"]
      );
      setColumns(
        qAny.columns && qAny.columns.length > 0
          ? qAny.columns
          : ["Colonne 1", "Colonne 2"]
      );
    }

    // Media
    if (kind === "media") {
      const qAny = question as any;

      setMediaMode(qAny.mediaMode ?? "upload");

      setMediaTypes(qAny.mediaTypes ?? ["photo"]);
      setMaxFiles(qAny.maxFiles ?? 1);
      setMaxSizeMb(qAny.maxSizeMb ?? 10);
      setMaxDurationSeconds(qAny.maxDurationSeconds ?? 60);
      setCaptureRequired(!!qAny.captureRequired);

      // stimulus only
      setStimulusSource(qAny.stimulusSource ?? "url");
      setStimulusMediaUrl(qAny.stimulusMediaUrl ?? "");
      setStimulusMediaType(qAny.stimulusMediaType ?? "photo");

      // optionnel: si tu stockes un nom de fichier stimulus
      setStimulusFileName(qAny.stimulusFileName ?? undefined);
    }

    //heatmap
    if (kind === "heatmap") {
      const qAny = question as any;
      const cfg = qAny.heatmap as HeatmapConfig | undefined;

      setHeatmapConfig({
        stimulusSource: cfg?.stimulusSource ?? "url",
        stimulusImageUrl: cfg?.stimulusImageUrl ?? "",
        stimulusImage: cfg?.stimulusImage,
        allowMultipleClicks: !!cfg?.allowMultipleClicks,
        maxClicks: cfg?.maxClicks ?? 3,
        collectReason: !!cfg?.collectReason,
        targets: cfg?.targets,
      });
    }

    // GPS
    if (kind === "gps") {
      const qAny = question as any;
      setGpsMode(qAny.gpsMode ?? "pin");
      if (qAny.targetLocation) {
        setTargetLat(String(qAny.targetLocation.lat ?? ""));
        setTargetLng(String(qAny.targetLocation.lng ?? ""));
        setTargetLabel(qAny.targetLocation.label ?? "");
      } else {
        setTargetLat("");
        setTargetLng("");
        setTargetLabel("");
      }
      setMaxDistanceMeters(
        qAny.maxDistanceMeters ? String(qAny.maxDistanceMeters) : ""
      );
      setMinTimeOnSiteSeconds(
        qAny.minTimeOnSiteSeconds ? String(qAny.minTimeOnSiteSeconds) : ""
      );
      setGpsToleranceMeters(
        qAny.gpsToleranceMeters ? String(qAny.gpsToleranceMeters) : ""
      );
      setRequiresPathTracking(!!qAny.requiresPathTracking);
    }

    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [question, isOpen]);

  // ---------- CONSTRUCTION DE LA QUESTION MISE À JOUR ----------
  const buildUpdatedQuestion = (): SurveyQuestion | null => {
    if (!question || !questionKind) return null;

    const base: SurveyQuestion = {
      ...question,
      title: questionTitle.trim(),
      description: description.trim() || undefined,
      isRequired,
    };

    // Section (titre de groupe)
    if (questionKind === "section") {
      return {
        ...base,
        type: "section",
        category: "section",
        isSectionTitle: true,
        sectionId: question.sectionId ?? question.name,
        sectionTitle: questionTitle.trim(),
        isRequired: false,
      } as any;
    }

    // Appliquer sectionId (pour toutes les autres)
    const sectionIdForQuestion = selectedSectionId ?? (base as any).sectionId;
    if (sectionIdForQuestion) {
      (base as any).sectionId = sectionIdForQuestion;
    } else {
      delete (base as any).sectionId;
    }

    switch (questionKind) {
      case "single_choice":
        return {
          ...base,
          type: "single_choice",
          category: "single_choice",
          choices: options,
          hasOther,
          allowMultiple: false,
        } as any;

      case "multiple_choice":
        return {
          ...base,
          type: "multiple_choice",
          category: "multiple_choice",
          choices: options,
          hasOther,
          allowMultiple: true,
        } as any;

      case "likert":
        return {
          ...base,
          type: "likert",
          category: "likert",
          rateMin: scaleMin,
          rateMax: scaleMax,
          minRateDescription: minLabel || undefined,
          maxRateDescription: maxLabel || undefined,
          displayRateDescriptionsAsExtremes: true,
        } as any;

      case "numeric_scale":
        return {
          ...base,
          type: "numeric_scale",
          category: "numeric_scale",
          min: scaleMin,
          max: scaleMax,
          step: 1,
        } as any;

      case "slider":
        return {
          ...base,
          type: "slider",
          category: "slider",
          min: scaleMin,
          max: scaleMax,
          step: 1,
        } as any;

      case "open":
        return {
          ...base,
          type: "open",
          category: "open",
          inputType: (base as any).inputType ?? "text",
          maxLength: (base as any).maxLength ?? 500,
        } as any;

      case "rating":
        return {
          ...base,
          type: "rating",
          category: "rating",
          rateMin: scaleMin,
          rateMax: scaleMax,
          minRateDescription: minLabel || undefined,
          maxRateDescription: maxLabel || undefined,
        } as any;

      case "matrix":
        return {
          ...base,
          type: "matrix",
          category: "matrix",
          rows,
          columns,
          allowRowReorder: true,
        } as any;

      case "image_ranking":
        return {
          ...base,
          type: "image_ranking",
          category: "image_ranking",
          imageChoices: imageChoices.map((c) => ({
            ...c,
            value: c.value || c.id,
          })),
        } as any;

      case "drag_drop_ranking":
        return {
          ...base,
          type: "ranking",
          category: "matrix", // ou "ranking" si tu étends ton enum
          choices: rankingOptions,
          allowRowReorder: true,
        } as any;

      case "media": {
        const next: any = {
          ...base,
          type: "media",
          category: "media",

          mediaMode,
          mediaTypes,
          maxFiles,
          maxSizeMb,
          captureRequired,
          maxDurationSeconds,
        };

        // Nettoyage par défaut
        delete next.stimulusSource;
        delete next.stimulusMediaUrl;
        delete next.stimulusMediaType;
        delete next.stimulusFileName;

        // Si stimulus: on persiste la config stimulus
        if (mediaMode === "stimulus") {
          next.stimulusSource = stimulusSource;
          next.stimulusMediaType = stimulusMediaType;

          if (stimulusSource === "url") {
            next.stimulusMediaUrl = stimulusMediaUrl?.trim() || undefined;
          }

          // si tu gères un upload stimulus via ton API, tu peux stocker:
          // next.stimulusFileName = stimulusFileName;
        }

        return next as SurveyQuestion;
      }

      case "heatmap":
        return {
          ...base,
          type: "heatmap",
          category: "heatmap",
          heatmap: {
            stimulusSource: heatmapConfig.stimulusSource,
            stimulusImageUrl:
              heatmapConfig.stimulusSource === "url"
                ? heatmapConfig.stimulusImageUrl?.trim() || undefined
                : undefined,
            stimulusImage:
              heatmapConfig.stimulusSource === "upload"
                ? heatmapConfig.stimulusImage
                : undefined,
            allowMultipleClicks: !!heatmapConfig.allowMultipleClicks,
            maxClicks: heatmapConfig.allowMultipleClicks
              ? Math.max(1, heatmapConfig.maxClicks ?? 3)
              : 1,
            collectReason: !!heatmapConfig.collectReason,
            targets: heatmapConfig.targets,
          },
        } as any;

      case "gps": {
        const lat = parseFloat(targetLat);
        const lng = parseFloat(targetLng);
        const maxDist = maxDistanceMeters
          ? parseInt(maxDistanceMeters, 10)
          : undefined;
        const minTime = minTimeOnSiteSeconds
          ? parseInt(minTimeOnSiteSeconds, 10)
          : undefined;
        const tol = gpsToleranceMeters
          ? parseInt(gpsToleranceMeters, 10)
          : undefined;

        return {
          ...base,
          type: "gps",
          category: "gps",
          gpsMode,
          targetLocation:
            !isNaN(lat) && !isNaN(lng)
              ? {
                  lat,
                  lng,
                  label: targetLabel || undefined,
                }
              : undefined,
          maxDistanceMeters: maxDist,
          minTimeOnSiteSeconds: minTime,
          requiresPathTracking,
          gpsToleranceMeters: tol,
        } as any;
      }

      case "boolean":
        return {
          ...base,
          type: "boolean",
        } as any;

      default:
        return base;
    }
  };

  const handleUpdateQuestion = () => {
    const updatedQuestion = buildUpdatedQuestion();
    if (!updatedQuestion || !question) return;

    const updatedSurveys: Survey = {
      ...surveys,
      pages: surveys.pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) =>
          el.name === question.name ? (updatedQuestion as any) : el
        ),
      })),
    };

    setSurveys(updatedSurveys);
    updateSurveyQuestions(updatedSurveys);
    onOpenChange(false);
  };

  // ---------- RENDER ----------
  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto p-0 overflow-hidden">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              {t("missions.surveys.addNewQuestion.editTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 thin-scrollbar">
            {/* Type (affiché en lecture seule, mais clair) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("missions.surveys.addNewQuestion.questionType")}
              </label>
              <div className="text-sm text-gray-800">
                {questionKind ?? question.category ?? question.type}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("missions.surveys.addNewQuestion.questionText")}{" "}
                {isRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder={t(
                  "missions.surveys.addNewQuestion.questionPlaceholder"
                )}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("missions.surveys.addNewQuestion.questionDescription")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                rows={2}
              />
            </div>

            {/* Single / multiple choice */}
            {(questionKind === "single_choice" ||
              questionKind === "multiple_choice") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("missions.surveys.addNewQuestion.options")}
                </label>
                <div className="space-y-2 max-h-80 overflow-y-auto thin-scrollbar">
                  {options.map((option, index) => (
                    <div className="flex items-center" key={index}>
                      <Input
                        name={`option-${index}`}
                        value={option}
                        placeholder={`Option ${index + 1}`}
                        onChange={(e) =>
                          setOptions(
                            options.map((o, i) =>
                              i === index ? e.target.value : o
                            )
                          )
                        }
                      />
                      {options.length > 1 && (
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setOptions(options.filter((_, i) => i !== index))
                          }
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="text-sm text-teal-500 hover:text-teal-700 flex items-center"
                    onClick={() =>
                      setOptions([...options, `Option ${options.length + 1}`])
                    }
                  >
                    + {t("missions.surveys.addNewQuestion.addOption")}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="hasOther"
                    checked={hasOther}
                    onChange={() => setHasOther((v) => !v)}
                  />
                  <label htmlFor="hasOther">
                    {t("missions.surveys.addNewQuestion.hasOtherOption")}
                  </label>
                </div>
              </div>
            )}

            {/* Drag & drop ranking texte */}
            {questionKind === "drag_drop_ranking" && (
              <DragDropRankingSettings
                options={rankingOptions}
                onOptionsChange={setRankingOptions}
              />
            )}

            {/* Image ranking */}
            {questionKind === "image_ranking" && (
              <ImageRankingConfigurator
                imageChoices={imageChoices}
                onChange={setImageChoices}
              />
            )}

            {/* Échelles */}
            {(questionKind === "likert" ||
              questionKind === "numeric_scale" ||
              questionKind === "slider" ||
              questionKind === "rating") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("missions.surveys.addNewQuestion.scaleSettings")}
                </label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm mb-1">
                      {t("missions.surveys.addNewQuestion.minValue")}
                    </label>
                    <input
                      type="number"
                      value={scaleMin}
                      onChange={(e) =>
                        setScaleMin(parseInt(e.target.value || "0", 10))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {t("missions.surveys.addNewQuestion.maxValue")}
                    </label>
                    <input
                      type="number"
                      value={scaleMax}
                      onChange={(e) =>
                        setScaleMax(parseInt(e.target.value || "0", 10))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {(questionKind === "likert" || questionKind === "rating") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">
                        {t("missions.surveys.addNewQuestion.minLabel")}
                      </label>
                      <input
                        type="text"
                        value={minLabel}
                        onChange={(e) => setMinLabel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        {t("missions.surveys.addNewQuestion.maxLabel")}
                      </label>
                      <input
                        type="text"
                        value={maxLabel}
                        onChange={(e) => setMaxLabel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Matrix */}
            {questionKind === "matrix" && (
              <MatrixQuestionSettings
                rows={rows}
                onRowsChange={setRows}
                columns={columns}
                onColumnsChange={setColumns}
              />
            )}

            {/* Media */}
            {questionKind === "media" && (
              <MediaQuestionSettings
                mediaMode={mediaMode}
                onMediaModeChange={setMediaMode}
                stimulusSource={stimulusSource}
                onStimulusSourceChange={setStimulusSource}
                stimulusMediaUrl={stimulusMediaUrl}
                onStimulusMediaUrlChange={setStimulusMediaUrl}
                stimulusMediaType={stimulusMediaType}
                onStimulusMediaTypeChange={setStimulusMediaType}
                stimulusFileName={stimulusFileName}
                onStimulusFileChange={(file) => {
                  setStimulusFileName(file?.name);

                  // IMPORTANT:
                  // si tu veux "stimulusSource=upload", il faut ici appeler ton endpoint
                  // (comme ImageRankingConfigurator) pour uploader le fichier et récupérer l’URL,
                  // puis setStimulusMediaUrl(url) et setStimulusSource("upload")
                }}
                mediaTypes={mediaTypes}
                onMediaTypesChange={setMediaTypes}
                maxFiles={maxFiles}
                onMaxFilesChange={setMaxFiles}
                maxSizeMb={maxSizeMb}
                onMaxSizeMbChange={setMaxSizeMb}
                maxDurationSeconds={maxDurationSeconds}
                onMaxDurationSecondsChange={setMaxDurationSeconds}
                captureRequired={captureRequired}
                onCaptureRequiredChange={setCaptureRequired}
              />
            )}

            {/* Heatmap */}
            {questionKind === "heatmap" && (
              <HeatmapQuestionSettings
                value={heatmapConfig}
                onChange={setHeatmapConfig}
              />
            )}

            {/* GPS */}
            {questionKind === "gps" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("missions.surveys.addNewQuestion.gpsMode")}
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    value={gpsMode}
                    onChange={(e) => setGpsMode(e.target.value as GpsMode)}
                  >
                    <option value="pin">pin</option>
                    <option value="navigate">navigate</option>
                    <option value="checkin">checkin</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Lat</label>
                    <input
                      type="number"
                      value={targetLat}
                      onChange={(e) => setTargetLat(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Lng</label>
                    <input
                      type="number"
                      value={targetLng}
                      onChange={(e) => setTargetLng(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {t("missions.surveys.addNewQuestion.locationLabel")}
                    </label>
                    <input
                      type="text"
                      value={targetLabel}
                      onChange={(e) => setTargetLabel(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">
                      {t("missions.surveys.addNewQuestion.maxDistanceMeters")}
                    </label>
                    <input
                      type="number"
                      value={maxDistanceMeters}
                      onChange={(e) => setMaxDistanceMeters(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {t(
                        "missions.surveys.addNewQuestion.minTimeOnSiteSeconds"
                      )}
                    </label>
                    <input
                      type="number"
                      value={minTimeOnSiteSeconds}
                      onChange={(e) => setMinTimeOnSiteSeconds(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {t("missions.surveys.addNewQuestion.gpsTolerance")}
                    </label>
                    <input
                      type="number"
                      value={gpsToleranceMeters}
                      onChange={(e) => setGpsToleranceMeters(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="requiresPathTracking"
                    checked={requiresPathTracking}
                    onChange={() =>
                      setRequiresPathTracking((current) => !current)
                    }
                  />
                  <label htmlFor="requiresPathTracking">
                    {t("missions.surveys.addNewQuestion.requiresPathTracking")}
                  </label>
                </div>
              </div>
            )}

            {/* Section selector (si ce n’est pas une section) */}
            {questionKind !== "section" && sectionOptions.length > 0 && (
              <QuestionSectionSelector
                sections={sectionOptions}
                selectedSectionId={selectedSectionId}
                onChange={setSelectedSectionId}
              />
            )}

            {/* Required */}
            {questionKind !== "section" && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRequired"
                    className="mr-2"
                    checked={isRequired}
                    onChange={() => setIsRequired(!isRequired)}
                  />
                  <label htmlFor="isRequired" className="text-sm">
                    {t("missions.surveys.addNewQuestion.required")}
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              {t("missions.surveys.addNewQuestion.cancel")}
            </Button>
            <Button
              onClick={handleUpdateQuestion}
              disabled={isLoadingUpdate || !questionTitle.trim()}
            >
              {isLoadingUpdate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("missions.surveys.addNewQuestion.update")
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
