"use client";

import {
  type Survey,
  useSurveysBuilder,
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
  Award,
  Bot,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  FilePlus,
  FileText,
  Hash,
  Image,
  List,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Radio,
  Search,
  Sliders,
  Star,
  Text,
  ToggleLeft,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  updateSurveyQuestions: (surveys: Survey) => void;
  isLoadingUpdate: boolean;
  addQuestionAI: (userPrompt: string) => Promise<void>;
  isLoadingAddQuestionAI: boolean;
}

interface QuestionType {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface QuestionTypes {
  common: QuestionType[];
  advanced: QuestionType[];
  ai: QuestionType[];
}

export function AddNewQuestionModal({
  onOpenChange,
  isOpen,
  updateSurveyQuestions,
  isLoadingUpdate,
  addQuestionAI,
  isLoadingAddQuestionAI,
}: Props) {
  const t = useI18n();
  const { surveys, setSurveys } = useSurveysBuilder();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermAi, setSearchTermAi] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("common");
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [questionTitle, setQuestionTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["default option"]);
  const [isRequired, setIsRequired] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [displayAsStars, setDisplayAsStars] = useState(false);
  const questionTypes: QuestionTypes = {
    common: [
      {
        id: "text",
        icon: <Text size={20} />,
        title: t("missions.surveys.questionTypes.text.title"),
        description: t("missions.surveys.questionTypes.text.description"),
      },
      {
        id: "comment",
        icon: <FileText size={20} />,
        title: t("missions.surveys.questionTypes.comment.title"),
        description: t("missions.surveys.questionTypes.comment.description"),
      },
      {
        id: "checkbox",
        icon: <CheckSquare size={20} />,
        title: t("missions.surveys.questionTypes.checkbox.title"),
        description: t("missions.surveys.questionTypes.checkbox.description"),
      },
      {
        id: "radiogroup",
        icon: <Radio size={20} />,
        title: t("missions.surveys.questionTypes.radiogroup.title"),
        description: t("missions.surveys.questionTypes.radiogroup.description"),
      },
      {
        id: "dropdown",
        icon: <ChevronDown size={20} />,
        title: t("missions.surveys.questionTypes.dropdown.title"),
        description: t("missions.surveys.questionTypes.dropdown.description"),
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
        id: "file",
        icon: <FilePlus size={20} />,
        title: t("missions.surveys.questionTypes.file.title"),
        description: t("missions.surveys.questionTypes.file.description"),
      },
      /* {
        id: "image",
        icon: <Image size={20} />,
        title: t("missions.surveys.questionTypes.image.title"),
        description: t("missions.surveys.questionTypes.image.description"),
      }, */
      {
        id: "rating",
        icon: <Star size={20} />,
        title: t("missions.surveys.questionTypes.rating.title"),
        description: t("missions.surveys.questionTypes.rating.description"),
      },
      {
        id: "imagepicker",
        icon: <Image size={20} />,
        title: t("missions.surveys.questionTypes.imagepicker.title"),
        description: t(
          "missions.surveys.questionTypes.imagepicker.description",
        ),
      },
    ],
    ai: [],
  };

  const getFilteredQuestionTypes = () => {
    if (!searchTerm) {
      return questionTypes[selectedCategory as keyof typeof questionTypes];
    }

    // Recherche dans toutes les catégories si la recherche est active
    return Object.values(questionTypes)
      .flat()
      .filter(
        (type) =>
          type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  };

  const resetForm = () => {
    setSelectedQuestionType(null);
    setQuestionTitle("");
    setOptions(["default option"]);
    setIsRequired(false);
    setMinRating(0);
    setMaxRating(5);
    setDisplayAsStars(false);
    setSearchTerm("");
    setSearchTermAi("");
  };
  const handleAddQuestion = () => {
    const updatedSurveys = {
      ...surveys,
      pages: surveys.pages.map((page, index) => {
        if (index === 0) {
          return {
            ...page,
            elements: [
              ...page.elements,
              {
                type: selectedQuestionType!,
                title: questionTitle,
                name: stripSpecialCharacters(questionTitle),
                isRequired,
                choices: options,
                minRateDescription: minRating?.toString(),
                maxRateDescription: maxRating?.toString(),
                displayRateDescriptionsAsExtremes: displayAsStars,
              },
            ],
          };
        }
        return page;
      }),
    };
    setSurveys(updatedSurveys);
    updateSurveyQuestions(updatedSurveys);
    resetForm();
    onOpenChange(false);
  };

  useEffect(() => {
    resetForm();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle>
            {t("missions.surveys.addNewQuestion.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
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
                    "missions.surveys.addNewQuestion.searchPlaceholder",
                  )}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Catégories (masquées si recherche active) */}
              {!searchTerm && (
                <div className="flex mb-6 border-b border-gray-200 overflow-x-auto">
                  {Object.keys(questionTypes).map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={`px-4 py-2 whitespace-nowrap ${selectedCategory === category ? "border-b-2 border-primary text-primary font-medium" : "text-gray-600"}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {t(
                        `missions.surveys.questionCategories.${category}` as keyof typeof t,
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Types de questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4  max-h-96 overflow-y-auto  thin-scrollbar">
                {getFilteredQuestionTypes().map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    className="border border-gray-200 rounded-lg p-4 text-left  hover:border-primary transition-colors"
                    onClick={() => setSelectedQuestionType(type.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div className="text-primary mr-2">{type.icon}</div>
                      <span className="font-medium">{type.title}</span>
                    </div>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </button>
                ))}
              </div>

              {selectedCategory !== "ai" &&
                getFilteredQuestionTypes().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t("missions.surveys.addNewQuestion.noResults")}
                  </div>
                )}
              {selectedCategory === "ai" && (
                <div className="flex space-x-2">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={t(
                        "missions.surveys.addNewQuestion.searchPlaceholderAi",
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
                      className=" gap-2"
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
                            "missions.surveys.addNewQuestion.generateQuestion",
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Formulaire d'ajout de question */}
              <div className="flex items-center mb-4 text-sm">
                <button
                  type="button"
                  className="flex items-center "
                  onClick={() => {
                    setSelectedQuestionType(null);
                    setOptions(["default option"]);
                  }}
                >
                  <ChevronDown size={16} className="transform rotate-90 mr-1" />
                  {t("missions.surveys.addNewQuestion.backToTypes")}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("missions.surveys.addNewQuestion.questionType")}
                </label>
                <div className="flex items-center p-2  rounded-md">
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
                <p className="mt-1 text-sm ">
                  {
                    Object.values(questionTypes)
                      .flat()
                      .find((type) => type.id === selectedQuestionType)
                      ?.description
                  }
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("missions.surveys.addNewQuestion.questionText")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder={t(
                    "missions.surveys.addNewQuestion.questionPlaceholder",
                  )}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Options spécifiques en fonction du type de question */}
              {(selectedQuestionType === "checkbox" ||
                selectedQuestionType === "radiogroup" ||
                selectedQuestionType === "dropdown" ||
                selectedQuestionType === "ranking") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("missions.surveys.addNewQuestion.options")}
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
                                i === index ? e.target.value : o,
                              ),
                            )
                          }
                        />
                        <button
                          type="button"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setOptions(
                              options.filter(
                                (_, index) => index !== options.length - 1,
                              ),
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
                      {t("missions.surveys.addNewQuestion.addOption")}
                    </button>
                  </div>
                </div>
              )}

              {selectedQuestionType === "rating" && (
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
                        min="0"
                        defaultValue="0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        onChange={(e) => setMinRating(+e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        {t("missions.surveys.addNewQuestion.maxRating")}
                      </label>
                      <input
                        type="number"
                        min="1"
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
                        {t("missions.surveys.addNewQuestion.displayAsStars")}
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
          <Button onClick={handleAddQuestion} disabled={isLoadingUpdate}>
            {isLoadingUpdate ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("missions.surveys.addNewQuestion.add")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
