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

export function EditQuestionModal({
  question,
  onOpenChange,
  isOpen,
  updateSurveyQuestions,
  isLoadingUpdate,
}: Props) {
  const { surveys, setSurveys } = useSurveysBuilder();
  const [options, setOptions] = useState<string[]>(["default option"]);
  const [questionTitle, setQuestionTitle] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [displayAsStars, setDisplayAsStars] = useState(false);
  const [questionType, setQuestionType] = useState<string>("text");
  const t = useI18n();

  const resetForm = () => {
    setQuestionType("text");
    setQuestionTitle("");
    setOptions(["default option"]);
    setIsRequired(false);
    setMinRating(0);
    setMaxRating(5);
    setDisplayAsStars(false);
  };
  const handleUpdateQuestion = () => {
    const updatedSurveys = {
      ...surveys,
      pages: surveys.pages.map((page) => ({
        ...page,
        elements: page.elements.map((element) =>
          element.name === question?.name
            ? {
                ...element,
                title: questionTitle,
                type: questionType,
                choices: options,
                isRequired,
                rateMin: minRating,
                rateMax: maxRating,
                displayRateDescriptionsAsExtremes: displayAsStars,
              }
            : element
        ),
      })),
    };
    setSurveys(updatedSurveys);
    updateSurveyQuestions(updatedSurveys);
    onOpenChange(false);
  };

  useEffect(() => {
    if (question) {
      setQuestionTitle(question.title);
      setOptions(question.choices || ["default option"]);
      setIsRequired(question.isRequired || false);
      setMinRating(question.rateMin || 0);
      setMaxRating(question.rateMax || 5);
      setQuestionType(question.type);
    }

    return () => {
      resetForm();
      document.body.style.pointerEvents = "auto";
    };
  }, [question]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle>{t("surveys.addNewQuestion.title")}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("surveys.addNewQuestion.questionText")}{" "}
              {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder={t("surveys.addNewQuestion.questionPlaceholder")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Options spécifiques en fonction du type de question */}
          {(questionType === "checkbox" ||
            questionType === "radiogroup" ||
            questionType === "dropdown") && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("surveys.addNewQuestion.options")}
              </label>
              <div className="space-y-2 max-h-96 overflow-y-auto  thin-scrollbar">
                {options.map((option, index) => (
                  <div
                    className="flex items-center"
                    key={`${option}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      index
                    }`}
                  >
                    <Input
                      autoFocus
                      name={`option-${index}`}
                      value={option}
                      key={`option-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        index
                      }`}
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) =>
                        setOptions(
                          options.map((o, i) =>
                            i === index ? e.target.value : o
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setOptions(
                          options.filter(
                            (_, index) => index !== options.length - 1
                          )
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="text-sm text-teal-500 hover:text-teal-700 flex items-center"
                  onClick={() => setOptions([...options, "new option"])}
                >
                  <Plus size={14} className="mr-1" />{" "}
                  {t("surveys.addNewQuestion.addOption")}
                </button>
              </div>
            </div>
          )}

          {questionType === "rating" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("surveys.addNewQuestion.ratingOptions")}
              </label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm mb-1">
                    {t("surveys.addNewQuestion.minRating")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    defaultValue="0"
                    name="minRating"
                    value={minRating}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setMinRating(+e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    {t("surveys.addNewQuestion.maxRating")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="maxRating"
                    value={maxRating}
                    defaultValue="5"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setMaxRating(+e.target.value)}
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
                    {t("surveys.addNewQuestion.displayAsStars")}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Options communes à tous les types de questions */}
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
                {t("surveys.addNewQuestion.required")}
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
            {t("surveys.addNewQuestion.cancel")}
          </Button>
          <Button onClick={handleUpdateQuestion} disabled={isLoadingUpdate}>
            {isLoadingUpdate ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("surveys.addNewQuestion.update")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
