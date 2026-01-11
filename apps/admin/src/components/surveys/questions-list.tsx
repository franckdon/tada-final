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
import { EditQuestionModal } from "@/components/ui/edit-question-modal";

type Props = {
  surveyId: string;
};

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

  const handleDeleteQuestion = (questionName: string) => {
    const updatedSurveys = {
      ...surveys,
      pages: surveys.pages.map((page) => ({
        ...page,
        elements: page.elements.filter(
          (element) => element.name !== questionName
        ),
      })),
    };
    setSurveys(updatedSurveys);

    updateSurveyQuestions.execute({
      surveyId,
      questions: updatedSurveys,
    });
  };

  const debouncedUpdateSurveyQuestions = debounce(
    (updatedSurveys: typeof surveys) => {
      updateSurveyQuestions.execute({
        surveyId,
        questions: updatedSurveys,
      });
    },
    1000
  );

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (!surveys.pages[0]?.elements) return;

    const newElements = [...surveys.pages[0].elements];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newElements.length) return;

    [newElements[index], newElements[newIndex]] = [
      newElements[newIndex],
      newElements[index],
    ];

    const updatedSurveys = {
      ...surveys,
      pages: surveys.pages.map((page, i) =>
        i === 0 ? { ...page, elements: newElements } : page
      ),
    };

    setSurveys(updatedSurveys);
    debouncedUpdateSurveyQuestions(updatedSurveys);
  };

  useEffect(() => {
    return () => {
      // @ts-ignore
      debouncedUpdateSurveyQuestions.cancel?.();
    };
  }, []);

  if (!surveys.pages[0]?.elements) return null;

  return (
    <>
      <div className="overflow-y-auto max-h-full space-y-2 mt-2">
        {surveys.pages[0].elements.map((element, index) => {
          const bgColorClass = "bg-pink-200 text-pink-800";

          return (
            <div
              key={element.name}
              className="flex items-center p-3 border-b border-gray-200 bg-white dark:bg-gray-600 cursor-pointer w-full"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 ${bgColorClass} rounded mr-3 font-bold text-sm`}
              >
                {index + 1}
              </div>
              <div className="flex-1 truncate text-sm">{element.title}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                  onClick={() => moveQuestion(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp size={16} className="mx-auto" />
                </button>
                <button
                  type="button"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                  onClick={() => moveQuestion(index, "down")}
                  disabled={
                    !surveys.pages[0]?.elements ||
                    index === surveys.pages[0].elements.length - 1
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
                      onClick={() => handleDeleteQuestion(element.name)}
                      disabled={updateSurveyQuestions.status === "executing"}
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
