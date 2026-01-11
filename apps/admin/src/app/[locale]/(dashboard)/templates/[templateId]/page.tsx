import { HeaderTemplate } from "@/components/templates/header-template";
import { QuestionsList } from "@/components/templates/questions-list";
import { SurveyShow } from "@/components/ui/survey-show";
import {
  Survey,
  SurveysBuilderProvider,
} from "@/context/surveys-builder-context";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { templateId: string };
}) {
  const template = await prisma.template.findUnique({
    where: { id: params.templateId },
  });

  if (!template) {
    return notFound();
  }

  return (
    <SurveysBuilderProvider
      defaultSurvey={template.questions as unknown as Survey}
    >
      <HeaderTemplate template={template} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 max-h-screen">
          <QuestionsList
            templateId={params.templateId as string}
            editMode={template.internal}
          />
        </div>
        <div className="flex-1 overflow-y-auto max-h-screen p-6">
          <SurveyShow />
        </div>
      </div>
    </SurveysBuilderProvider>
  );
}
