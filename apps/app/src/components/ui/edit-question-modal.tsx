"use client";
import {
  type Survey,
  type SurveyQuestion,
  useSurveysBuilder,
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
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  question: SurveyQuestion | null;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  updateSurveyQuestions: (surveys: Survey) => void;
  isLoadingUpdate: boolean;
};

// Tous les types “conceptuels” que tu as dans AddNewQuestionModal
type SemanticQuestionType =
  | "text"
  | "comment"
  | "checkbox"
  | "radiogroup"
  | "dropdown"
  | "boolean"
  | "file"
  | "rating"
  | "image-question"
  | "imagepicker"
  | "gallery"
  | "video"
  | "audio-player"
  | "audio-record";

function inferSemanticType(q: SurveyQuestion): SemanticQuestionType {
  // Types natifs simples
  if (
    q.type === "text" ||
    q.type === "comment" ||
    q.type === "checkbox" ||
    q.type === "radiogroup" ||
    q.type === "dropdown" ||
    q.type === "boolean" ||
    q.type === "file" ||
    q.type === "rating"
  ) {
    return q.type as SemanticQuestionType;
  }

  // Image-question → type "image"
  if (q.type === "image") {
    return "image-question";
  }

  // Imagepicker / gallery
  if (q.type === "imagepicker") {
    const anyQ = q as any;
    if (anyQ.multiSelect) return "gallery";
    return "imagepicker";
  }

  // Video / audio-player → type "html" avec un texte spécifique
  if (q.type === "html") {
    const anyQ = q as any;
    const html = (anyQ.html as string | undefined) || "";
    if (html.includes("vidéo") || html.includes("<video")) {
      return "video";
    }
    if (html.includes("lecteur audio") || html.includes("<audio")) {
      return "audio-player";
    }
    // fallback : on va considérer ça comme "video" par défaut
    return "video";
  }

  // audio-record → type file + acceptedTypes = audio/*
  if (q.type === "file") {
    const anyQ = q as any;
    if (anyQ.acceptedTypes === "audio/*") {
      return "audio-record";
    }
    return "file";
  }

  // fallback
  return "text";
}

export function EditQuestionModal({
  question,
  onOpenChange,
  isOpen,
  updateSurveyQuestions,
  isLoadingUpdate,
}: Props) {
  const { surveys, setSurveys } = useSurveysBuilder();
  const t = useI18n();

  const [semanticType, setSemanticType] =
    useState<SemanticQuestionType>("text");

  // génériques
  const [questionTitle, setQuestionTitle] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  // description éventuelle (utile par ex pour image-question)
  const [description, setDescription] = useState("");

  // options (checkbox / radio / dropdown)
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);

  // rating
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [displayAsStars, setDisplayAsStars] = useState(false);

  const resetForm = () => {
    setSemanticType("text");
    setQuestionTitle("");
    setIsRequired(false);
    setDescription("");
    setOptions(["Option 1", "Option 2"]);
    setMinRating(0);
    setMaxRating(5);
    setDisplayAsStars(false);
  };

  useEffect(() => {
    if (!question) {
      resetForm();
      return;
    }

    const semType = inferSemanticType(question);
    setSemanticType(semType);
    setQuestionTitle(question.title ?? "");
    setIsRequired(question.isRequired ?? false);
    setDescription(question.description ?? "");

    if (
      semType === "checkbox" ||
      semType === "radiogroup" ||
      semType === "dropdown"
    ) {
      setOptions(
        question.choices && question.choices.length > 0
          ? question.choices
          : ["Option 1", "Option 2"]
      );
    }

    if (semType === "rating") {
      setMinRating(question.rateMin ?? 0);
      setMaxRating(question.rateMax ?? 5);
      const anyQ = question as any;
      setDisplayAsStars(Boolean(anyQ.displayRateDescriptionsAsExtremeItems));
    }

    return () => {
      resetForm();
      document.body.style.pointerEvents = "auto";
    };
  }, [question]);

  const handleUpdateQuestion = () => {
    if (!question) return;

    const updatedSurveys: Survey = {
      ...surveys,
      pages: surveys.pages.map((page) => ({
        ...page,
        elements: page.elements.map((element) => {
          if (element.name !== question.name) return element;

          // base commun
          let updated: any = {
            ...element,
            title: questionTitle,
            isRequired,
          };

          if (description) {
            updated.description = description;
          }

          switch (semanticType) {
            case "text":
            case "comment":
            case "boolean":
            case "file":
            case "image-question":
            case "imagepicker":
            case "gallery":
            case "video":
            case "audio-player":
            case "audio-record":
              // Ces types n'ont pas de logique spéciale ici,
              // on garde le type et les props spécifiques déjà présents.
              // On ne touche pas à type, html, acceptedTypes, etc.
              return updated;

            case "checkbox":
            case "radiogroup":
            case "dropdown":
              updated.choices = options;
              return updated;

            case "rating":
              updated.rateMin = minRating;
              updated.rateMax = maxRating;
              updated.displayRateDescriptionsAsExtremeItems = displayAsStars;
              return updated;

            default:
              return updated;
          }
        }),
      })),
    };

    setSurveys(updatedSurveys);
    updateSurveyQuestions(updatedSurveys);
    onOpenChange(false);
  };

  // Helpers UI
  const isChoiceBased =
    semanticType === "checkbox" ||
    semanticType === "radiogroup" ||
    semanticType === "dropdown";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle>
            {t("missions.surveys.addNewQuestion.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Titre */}
          <div className="mb-4">
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

          {/* Description optionnelle (utile aussi pour image-question etc.) */}
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

          {/* Options pour checkbox / radiogroup / dropdown */}
          {isChoiceBased && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("missions.surveys.addNewQuestion.options")}
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto thin-scrollbar">
                {options.map((option, index) => (
                  <div className="flex items-center" key={`${option}-${index}`}>
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
                  onClick={() => setOptions([...options, "new option"])}
                >
                  <Plus size={14} className="mr-1" />{" "}
                  {t("missions.surveys.addNewQuestion.addOption")}
                </button>
              </div>
            </div>
          )}

          {/* Rating */}
          {semanticType === "rating" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("missions.surveys.addNewQuestion.ratingOptions")}
              </label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm mb-1">
                    {t("missions.surveys.addNewQuestion.minRating")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minRating}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {t("missions.surveys.addNewQuestion.maxRating")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxRating}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="displayAsStars"
                    className="mr-2"
                    checked={displayAsStars}
                    onChange={() => setDisplayAsStars(!displayAsStars)}
                  />
                  <label htmlFor="displayAsStars" className="text-sm">
                    {t("missions.surveys.addNewQuestion.displayAsStars")}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Options communes */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                name="isRequired"
                className="mr-2"
                checked={isRequired}
                onChange={() => setIsRequired(!isRequired)}
              />
              <label htmlFor="isRequired" className="text-sm">
                {t("missions.surveys.addNewQuestion.required")}
              </label>
            </div>
          </div>
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
          <Button onClick={handleUpdateQuestion} disabled={isLoadingUpdate}>
            {isLoadingUpdate ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("missions.surveys.addNewQuestion.update")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
