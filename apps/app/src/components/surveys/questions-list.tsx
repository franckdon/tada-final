"use client";

import { updateSurveyQuestionsAction } from "@/actions/missions/update-survey-questions-action";
import {
  type SurveyQuestion,
  useSurveysBuilder,
} from "@/context/surveys-builder-context";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { EditQuestionModal } from "./modals/edit-question-modal";

type Props = {
  surveyId: string;
};

const PAGE_SIZE = 10;

function repaginateSurvey(surveys: typeof defaultSurvey): typeof defaultSurvey {
  // 1. On récupère TOUTES les questions dans un seul tableau
  const allElements = surveys.pages.flatMap((page) => page.elements);

  // 2. On reconstruit les pages de PAGE_SIZE
  const pages = [];
  for (let i = 0; i < allElements.length; i += PAGE_SIZE) {
    pages.push({
      name: `page${pages.length + 1}`,
      elements: allElements.slice(i, i + PAGE_SIZE),
    });
  }

  return {
    ...surveys,
    pages,
  };
}

export function QuestionsList({ surveyId }: Props) {
  const t = useI18n();
  const { toast } = useToast();
  const { surveys, setSurveys } = useSurveysBuilder();
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<SurveyQuestion | null>(null);

  const updateSurveyQuestions = useAction(updateSurveyQuestionsAction, {
    onSuccess: () => {
      toast({
        title: t("missions.surveys.saveDraftSuccess"),
        description: t("missions.surveys.saveDraftSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.surveys.saveDraftError"),
        description: t("missions.surveys.saveDraftErrorDescription"),
        variant: "destructive",
      });
    },
  });

  const debouncedUpdateSurveyQuestions = debounce(
    (updatedSurveys: typeof surveys) => {
      updateSurveyQuestions.execute({
        surveyId,
        questions: updatedSurveys,
      });
    },
    1000
  );

  const handleDeleteQuestion = (pageIndex: number, questionName: string) => {
    const pages = surveys.pages;
    if (!pages || pages.length === 0) return;

    const allElements = pages.flatMap((p) => p.elements);
    const indexToRemove = allElements.findIndex((q) => q.name === questionName);
    if (indexToRemove === -1) return;

    allElements.splice(indexToRemove, 1);

    const updatedSurveys = repaginateSurvey({
      ...surveys,
      pages: [{ name: "tmp", elements: allElements }],
    });

    setSurveys(updatedSurveys);
    updateSurveyQuestions.execute({
      surveyId,
      questions: updatedSurveys,
    });
  };

  const moveQuestion = (
    pageIndex: number,
    elementIndex: number,
    direction: "up" | "down"
  ) => {
    const pages = surveys.pages;
    if (!pages || pages.length === 0) return;

    // 1. Aplatir toutes les questions
    const allElements = pages.flatMap((p) => p.elements);

    // 2. Calculer l'index global de la question actuelle
    let currentIndex = 0;
    for (let i = 0; i < pageIndex; i++) {
      currentIndex += pages[i].elements.length;
    }
    currentIndex += elementIndex;

    // 3. Calculer le nouvel index global
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= allElements.length) return;

    // 4. Swap dans le tableau global
    [allElements[currentIndex], allElements[newIndex]] = [
      allElements[newIndex],
      allElements[currentIndex],
    ];

    // 5. Re-paginer proprement
    const updatedSurveys = repaginateSurvey({
      ...surveys,
      pages: [
        // peu importe, repaginateSurvey va remplacer les pages
        { name: "tmp", elements: allElements },
      ],
    });

    setSurveys(updatedSurveys);
    debouncedUpdateSurveyQuestions(updatedSurveys);
  };

  useEffect(() => {
    return () => {
      // @ts-ignore
      debouncedUpdateSurveyQuestions.cancel?.();
    };
  }, []);

  if (!surveys.pages || surveys.pages.length === 0) return null;

  // Pour avoir un numéro global (1, 2, 3, ... à travers les pages)
  let globalIndex = 0;

  return (
    <>
      <div className="overflow-y-auto max-h-full space-y-4 mt-2">
        {surveys.pages.map((page, pageIndex) => (
          <div key={page.name ?? `page-${pageIndex}`}>
            <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
              Page {pageIndex + 1}
            </div>

            {page.elements?.map((element, elementIndex) => {
              globalIndex += 1;
              const bgColorClass = "bg-pink-200 text-pink-800";

              return (
                <div
                  key={element.name}
                  className="flex items-center p-3 border-b border-gray-200 bg-white dark:bg-gray-600 cursor-pointer w-full"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 ${bgColorClass} rounded mr-3 font-bold text-sm`}
                  >
                    {globalIndex}
                  </div>
                  <div className="flex-1 truncate text-sm">{element.title}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                      onClick={() =>
                        moveQuestion(pageIndex, elementIndex, "up")
                      }
                      disabled={elementIndex === 0}
                    >
                      <ArrowUp size={16} className="mx-auto" />
                    </button>
                    <button
                      type="button"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                      onClick={() =>
                        moveQuestion(pageIndex, elementIndex, "down")
                      }
                      disabled={
                        !page.elements ||
                        elementIndex === page.elements.length - 1
                      }
                    >
                      <ArrowDown size={16} className="mx-auto" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <MoreVertical size={16} className="mx-auto" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setSelectedQuestion(element);
                            setIsEditQuestionModalOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                          {t("missions.surveys.addNewQuestion.editQuestion")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() =>
                            handleDeleteQuestion(pageIndex, element.name)
                          }
                          disabled={
                            updateSurveyQuestions.status === "executing"
                          }
                        >
                          {updateSurveyQuestions.status === "executing" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          {t("missions.surveys.addNewQuestion.deleteQuestion")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <EditQuestionModal
        question={selectedQuestion}
        onOpenChange={setIsEditQuestionModalOpen}
        isOpen={isEditQuestionModalOpen}
        updateSurveyQuestions={(surveys) => {
          updateSurveyQuestions.execute({
            surveyId,
            questions: surveys,
          });
        }}
        isLoadingUpdate={updateSurveyQuestions.status === "executing"}
      />
    </>
  );
}
