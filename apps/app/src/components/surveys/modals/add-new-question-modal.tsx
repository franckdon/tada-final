"use client";

import {
  type Survey,
  type SurveyQuestion,
  useSurveysBuilder,
  type MediaType,
  type GpsMode,
  type MediaQuestionMode,
  type HeatmapConfig,
} from "@/context/surveys-builder-context";
import { stripSpecialCharacters } from "@/lib/utils";
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
import {
  Bot,
  CheckSquare,
  ChevronDown,
  FilePlus,
  FileText,
  Hash,
  Image,
  List,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Search,
  Sliders,
  Star,
  Text,
  ToggleLeft,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageRankingConfigurator } from "../_partials/ImageRankingConfigurator";
import { MediaQuestionSettings } from "../_partials/MediaQuestionSettings";
import { MatrixQuestionSettings } from "../_partials/MatrixQuestionSettings";
import { DragDropRankingSettings } from "../_partials/DragDropRankingSettings";
import {
  QuestionSectionSelector,
  type SectionOption,
} from "../_partials/QuestionSectionSelector";
import { HeatmapQuestionSettings } from "../_partials/HeatmapQuestionSettings";

const PAGE_SIZE = 10;

interface Props {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  updateSurveyQuestions: (surveys: Survey) => void;
  isLoadingUpdate: boolean;
  addQuestionAI: (userPrompt: string) => Promise<void>;
  isLoadingAddQuestionAI: boolean;
  isAiMode: boolean;
}

interface QuestionType {
  id: SurveyQuestion["category"] | "boolean" | "open" | "drag_drop_ranking";
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface QuestionTypes {
  common: QuestionType[];
  advanced: QuestionType[];
  ai: QuestionType[];
}

type ImageChoice = {
  id: string;
  value: string;
  label: string;
  imageUrl: string;
  description?: string;
};

export function AddNewQuestionModal({
  onOpenChange,
  isOpen,
  updateSurveyQuestions,
  isLoadingUpdate,
  addQuestionAI,
  isLoadingAddQuestionAI,
  isAiMode,
}: Props) {
  const t = useI18n();
  const { surveys, setSurveys } = useSurveysBuilder();

  // ----- UI state -----
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermAi, setSearchTermAi] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "common" | "advanced" | "ai"
  >("common");
  const [selectedQuestionType, setSelectedQuestionType] = useState<
    QuestionType["id"] | null
  >(null);

  const [questionTitle, setQuestionTitle] = useState("");
  const [description, setDescription] = useState("");

  // options pour QCM / ranking / image_ranking
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);

  // options pour drag_drop_ranking
  const [rankingOptions, setRankingOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
  ]);

  // échelles (likert / numeric_scale / slider / rating)
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

  const [mediaMode, setMediaMode] = useState<"upload" | "stimulus">("upload");
  const [heatmapConfig, setHeatmapConfig] = useState<HeatmapConfig>({
    stimulusSource: "url" as const,
    stimulusImageUrl: "",
    stimulusImage: undefined as any,
    allowMultipleClicks: false,
    maxClicks: 3,
    collectReason: false,
  });
  const [stimulusSource, setStimulusSource] = useState<"upload" | "url">("url");
  const [stimulusMediaUrl, setStimulusMediaUrl] = useState<string>("");
  const [stimulusMediaType, setStimulusMediaType] =
    useState<MediaType>("photo");
  const [stimulusFileName, setStimulusFileName] = useState<
    string | undefined
  >();

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

  const sectionOptions: SectionOption[] = useMemo(() => {
    if (!surveys?.pages?.length) return [];

    // On suppose que tu bosses surtout sur la 1ère page
    const elements = surveys.pages[0]?.elements ?? [];

    return elements
      .filter(
        (el) =>
          el.type === "section" ||
          el.category === "section" ||
          el.isSectionTitle
      )
      .map((el) => ({
        id: el.sectionId ?? el.name,
        title: el.sectionTitle ?? el.title ?? el.name,
      }));
  }, [surveys]);

  // ----- Types de questions disponibles -----
  const questionTypes: QuestionTypes = useMemo(
    () => ({
      common: [
        {
          id: "single_choice",
          icon: <Radio size={20} />,
          title: t("missions.surveys.questionTypes.singleChoice.title"),
          description: t(
            "missions.surveys.questionTypes.singleChoice.description"
          ),
        },
        {
          id: "multiple_choice",
          icon: <CheckSquare size={20} />,
          title: t("missions.surveys.questionTypes.multipleChoice.title"),
          description: t(
            "missions.surveys.questionTypes.multipleChoice.description"
          ),
        },
        {
          id: "likert",
          icon: <Sliders size={20} />,
          title: t("missions.surveys.questionTypes.likert.title"),
          description: t("missions.surveys.questionTypes.likert.description"),
        },
        {
          id: "numeric_scale",
          icon: <Hash size={20} />,
          title: t("missions.surveys.questionTypes.numericScale.title"),
          description: t(
            "missions.surveys.questionTypes.numericScale.description"
          ),
        },
        {
          id: "open",
          icon: <FileText size={20} />,
          title: t("missions.surveys.questionTypes.open.title"),
          description: t("missions.surveys.questionTypes.open.description"),
        },
        {
          id: "rating",
          icon: <Star size={20} />,
          title: t("missions.surveys.questionTypes.rating.title"),
          description: t("missions.surveys.questionTypes.rating.description"),
        },
        {
          id: "matrix",
          icon: <List size={20} />,
          title: t("missions.surveys.questionTypes.matrix.title"),
          description: t("missions.surveys.questionTypes.matrix.description"),
        },
        {
          id: "boolean",
          icon: <ToggleLeft size={20} />,
          title: t("missions.surveys.questionTypes.boolean.title"),
          description: t("missions.surveys.questionTypes.boolean.description"),
        },
      ],
      advanced: [
        {
          id: "slider",
          icon: <Sliders size={20} />,
          title: t("missions.surveys.questionTypes.slider.title"),
          description: t("missions.surveys.questionTypes.slider.description"),
        },
        {
          id: "image_ranking",
          icon: <Image size={20} />,
          title: t("missions.surveys.questionTypes.imageRanking.title"),
          description: t(
            "missions.surveys.questionTypes.imageRanking.description"
          ),
        },
        {
          id: "drag_drop_ranking",
          icon: <List size={20} />,
          title: t("missions.surveys.questionTypes.dragDropRanking.title", {
            defaultValue: "Classement par glisser-déposer (texte)",
          }),
          description: t(
            "missions.surveys.questionTypes.dragDropRanking.description",
            {
              defaultValue:
                "Permet au répondant de classer des éléments textuels par ordre de préférence.",
            }
          ),
        },
        {
          id: "media",
          icon: <FilePlus size={20} />,
          title: t("missions.surveys.questionTypes.media.title"),
          description: t("missions.surveys.questionTypes.media.description"),
        },
        {
          id: "heatmap",
          icon: <MapPin size={20} />,
          title: t("missions.surveys.questionTypes.heatmap.title"),
          description: t("missions.surveys.questionTypes.heatmap.description"),
        },
        {
          id: "gps",
          icon: <MapPin size={20} />,
          title: t("missions.surveys.questionTypes.gps.title"),
          description: t("missions.surveys.questionTypes.gps.description"),
        },
        {
          id: "section",
          icon: <Text size={20} />,
          title: t("missions.surveys.questionTypes.section.title"),
          description: t("missions.surveys.questionTypes.section.description"),
        },
      ],
      ai: [],
    }),
    [t]
  );

  // ----- Helpers -----
  const resetForm = () => {
    setSelectedQuestionType(null);
    setQuestionTitle("");
    setDescription("");
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

    setMediaMode("upload");
    setStimulusSource("url");
    setStimulusMediaUrl("");
    setStimulusMediaType("photo");
    setStimulusFileName(undefined);
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
    setSearchTerm("");
    setSearchTermAi("");
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
    setSelectedSectionId(null);
    setHeatmapConfig({
      stimulusSource: "url" as "url" | "upload",
      stimulusImageUrl: "",
      stimulusImage: undefined,
      allowMultipleClicks: false,
      maxClicks: 3,
      collectReason: false,
    });
  };

  const getFilteredQuestionTypes = () => {
    const allTypes = Object.values(questionTypes).flat();
    if (!searchTerm) {
      return questionTypes[selectedCategory];
    }
    return allTypes.filter(
      (type) =>
        type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // ----- Construction de la question à partir du state -----
  const buildQuestion = (): SurveyQuestion | null => {
    if (!selectedQuestionType || !questionTitle.trim()) return null;

    const name =
      stripSpecialCharacters(questionTitle) || `q_${Date.now().toString()}`;

    const sectionIdForQuestion =
      selectedQuestionType === "section"
        ? undefined
        : (selectedSectionId ?? undefined);

    const base: SurveyQuestion = {
      name,
      title: questionTitle.trim(),
      description: description.trim() || undefined,
      isRequired,
      ...(sectionIdForQuestion ? { sectionId: sectionIdForQuestion } : {}),
    };

    switch (selectedQuestionType) {
      case "single_choice":
        return {
          ...base,
          type: "single_choice",
          category: "single_choice",
          choices: options,
          hasOther,
          allowMultiple: false,
        };

      case "multiple_choice":
        return {
          ...base,
          type: "multiple_choice",
          category: "multiple_choice",
          choices: options,
          hasOther,
          allowMultiple: true,
        };

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
        };

      case "numeric_scale":
        return {
          ...base,
          type: "numeric_scale",
          category: "numeric_scale",
          min: scaleMin,
          max: scaleMax,
          step: 1,
        };

      case "slider":
        return {
          ...base,
          type: "slider",
          category: "slider",
          min: scaleMin,
          max: scaleMax,
          step: 1,
        };

      case "open":
        return {
          ...base,
          type: "open",
          category: "open",
          inputType: "text",
          maxLength: 500,
        };

      case "rating":
        return {
          ...base,
          type: "rating",
          category: "rating",
          rateMin: scaleMin,
          rateMax: scaleMax,
          minRateDescription: minLabel || undefined,
          maxRateDescription: maxLabel || undefined,
        };

      case "matrix":
        return {
          ...base,
          type: "matrix",
          category: "matrix",
          rows,
          columns,
          allowRowReorder: true,
        };

      case "image_ranking":
        return {
          ...base,
          type: "image_ranking",
          category: "image_ranking",
          imageChoices: imageChoices.map((c) => ({
            ...c,
            value: c.value || stripSpecialCharacters(c.label) || c.id,
          })),
        };

      case "drag_drop_ranking":
        return {
          ...base,
          type: "ranking",
          category: "ranking",
          choices: rankingOptions,
          allowRowReorder: true,
        };

      case "media":
        return {
          ...base,
          type: "media",
          category: "media",
          mediaMode,
          mediaTypes,
          maxFiles,
          maxSizeMb,
          captureRequired,
          maxDurationSeconds,
          stimulusSource: mediaMode === "stimulus" ? stimulusSource : undefined,
          stimulusMediaUrl:
            mediaMode === "stimulus" && stimulusSource === "url"
              ? stimulusMediaUrl || undefined
              : undefined,
          stimulusMediaType:
            mediaMode === "stimulus" ? stimulusMediaType : undefined,
        };

      case "heatmap":
        return {
          ...base,
          type: "heatmap",
          category: "heatmap",
          heatmap: {
            stimulusSource: heatmapConfig.stimulusSource,
            stimulusImageUrl:
              heatmapConfig.stimulusSource === "url"
                ? heatmapConfig.stimulusImageUrl || undefined
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
        };
      }

      case "section":
        return {
          name,
          title: questionTitle.trim(),
          description: description.trim() || undefined,
          isRequired: false,
          type: "section",
          category: "section",
          isSectionTitle: true,
          sectionId: name,
          sectionTitle: questionTitle.trim(),
        };

      case "boolean":
        return {
          ...base,
          type: "boolean",
          // pas de category dédiée dans ton enum, on reste sur un usage SurveyJS-style
          // Si tu veux, tu peux étendre ton enum plus tard
        };

      default:
        return null;
    }
  };

  const handleAddQuestion = () => {
    const question = buildQuestion();
    if (!question) return;

    // 1️⃣ Aplatir toutes les questions existantes
    const allElements = surveys.pages.flatMap((page) => page.elements || []);

    // 2️⃣ Ajouter la nouvelle question à la fin
    allElements.push(question);

    // 3️⃣ Re-construire les pages par blocs de 10
    const pages = [];
    for (let i = 0; i < allElements.length; i += PAGE_SIZE) {
      pages.push({
        name: `page${pages.length + 1}`,
        elements: allElements.slice(i, i + PAGE_SIZE),
      });
    }

    const updatedSurveys: Survey = {
      ...surveys,
      pages,
    };

    // 4️⃣ Mettre à jour le contexte + backend
    setSurveys(updatedSurveys);
    updateSurveyQuestions(updatedSurveys);

    // 5️⃣ Reset + fermer le modal
    resetForm();
    onOpenChange(false);
  };

  // ----- Reset quand on ouvre/ferme -----
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // ----- UI -----
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle>
            {t("missions.surveys.addNewQuestion.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* 1. Sélection du type de question */}
          {!selectedQuestionType ? (
            <>
              {/* Barre de recherche */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t(
                    "missions.surveys.addNewQuestion.searchPlaceholder"
                  )}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tabs catégories (common / advanced / ai) */}
              {!searchTerm && (
                <div className="flex mb-6 border-b border-gray-200 overflow-x-auto">
                  {(["common", "advanced", "ai"] as const).map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={`px-4 py-2 whitespace-nowrap ${
                        selectedCategory === category
                          ? "border-b-2 border-primary text-primary font-medium"
                          : "text-gray-600"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {t(
                        `missions.surveys.questionCategories.${category}` as any
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Liste des types de questions */}
              {selectedCategory !== "ai" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto thin-scrollbar">
                  {getFilteredQuestionTypes().map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      className="border border-gray-200 rounded-lg p-4 text-left hover:border-primary transition-colors"
                      onClick={() => setSelectedQuestionType(type.id)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="text-primary mr-2">{type.icon}</div>
                        <span className="font-medium">{type.title}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {type.description}
                      </p>
                    </button>
                  ))}

                  {getFilteredQuestionTypes().length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      {t("missions.surveys.addNewQuestion.noResults")}
                    </div>
                  )}
                </div>
              )}

              {/* Onglet IA */}
              {selectedCategory === "ai" && isAiMode && (
                <div className="flex space-x-2">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={t(
                        "missions.surveys.addNewQuestion.searchPlaceholderAi"
                      )}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchTermAi}
                      onChange={(e) => setSearchTermAi(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={async () => {
                        await addQuestionAI(searchTermAi);
                        onOpenChange(false);
                      }}
                      disabled={
                        isLoadingAddQuestionAI || searchTermAi.length === 0
                      }
                    >
                      {isLoadingAddQuestionAI ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Bot size={16} />
                          {t(
                            "missions.surveys.addNewQuestion.generateQuestion"
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedCategory === "ai" && !isAiMode && (
                <div className="text-sm text-gray-500">
                  {t("missions.surveys.addNewQuestion.aiModeDisabled")}
                </div>
              )}
            </>
          ) : (
            <>
              {/* 2. Formulaire de config de la question choisie */}
              <div className="flex items-center mb-4 text-sm">
                <button
                  type="button"
                  className="flex items-center"
                  onClick={() => {
                    setSelectedQuestionType(null);
                  }}
                >
                  <ChevronDown size={16} className="transform rotate-90 mr-1" />
                  {t("missions.surveys.addNewQuestion.backToTypes")}
                </button>
              </div>

              {/* Type sélectionné */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("missions.surveys.addNewQuestion.questionType")}
                </label>
                <div className="flex items-center p-2 rounded-md">
                  {
                    Object.values(questionTypes)
                      .flat()
                      .find((type) => type.id === selectedQuestionType)?.icon
                  }
                  <span className="ml-2 font-medium">
                    {
                      Object.values(questionTypes)
                        .flat()
                        .find((type) => type.id === selectedQuestionType)?.title
                    }
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {
                    Object.values(questionTypes)
                      .flat()
                      .find((type) => type.id === selectedQuestionType)
                      ?.description
                  }
                </p>
              </div>

              {/* Titre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("missions.surveys.addNewQuestion.questionText")}{" "}
                  <span className="text-red-500">*</span>
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

              {/* Description (optionnel) */}
              <div className="mb-4">
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

              {/* Options pour QCM / ranking / image_ranking */}
              {(selectedQuestionType === "single_choice" ||
                selectedQuestionType === "multiple_choice") && (
                <div className="mb-6">
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
                            <X size={16} />
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
                      <Plus size={14} className="mr-1" />
                      {t("missions.surveys.addNewQuestion.addOption")}
                    </button>
                  </div>

                  {(selectedQuestionType === "single_choice" ||
                    selectedQuestionType === "multiple_choice") && (
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
                  )}
                </div>
              )}

              {selectedQuestionType === "drag_drop_ranking" && (
                <DragDropRankingSettings
                  options={rankingOptions}
                  onOptionsChange={setRankingOptions}
                />
              )}

              {selectedQuestionType === "image_ranking" && (
                <ImageRankingConfigurator
                  imageChoices={imageChoices}
                  onChange={setImageChoices}
                />
              )}

              {/* Échelles : likert / numeric_scale / slider / rating */}
              {(selectedQuestionType === "likert" ||
                selectedQuestionType === "numeric_scale" ||
                selectedQuestionType === "slider" ||
                selectedQuestionType === "rating") && (
                <div className="mb-6">
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

                  {(selectedQuestionType === "likert" ||
                    selectedQuestionType === "rating") && (
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
              {selectedQuestionType === "matrix" && (
                <MatrixQuestionSettings
                  rows={rows}
                  onRowsChange={setRows}
                  columns={columns}
                  onColumnsChange={setColumns}
                />
              )}

              {/* Media */}
              {selectedQuestionType === "media" && (
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

              {selectedQuestionType === "heatmap" && (
                <HeatmapQuestionSettings
                  value={heatmapConfig}
                  onChange={setHeatmapConfig}
                />
              )}

              {/* GPS */}
              {selectedQuestionType === "gps" && (
                <div className="mb-6 space-y-4">
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
                        onChange={(e) =>
                          setMinTimeOnSiteSeconds(e.target.value)
                        }
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
                      {t(
                        "missions.surveys.addNewQuestion.requiresPathTracking"
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Associer à une section (sauf si c’est la section elle-même) */}
              {selectedQuestionType !== "section" &&
                sectionOptions.length > 0 && (
                  <QuestionSectionSelector
                    sections={sectionOptions}
                    selectedSectionId={selectedSectionId}
                    onChange={setSelectedSectionId}
                  />
                )}

              {/* Options communes */}
              <div className="space-y-2 mb-6">
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            {t("missions.surveys.addNewQuestion.cancel")}
          </Button>

          {selectedQuestionType && (
            <Button
              onClick={handleAddQuestion}
              disabled={isLoadingUpdate || !questionTitle.trim()}
            >
              {isLoadingUpdate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("missions.surveys.addNewQuestion.add")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
