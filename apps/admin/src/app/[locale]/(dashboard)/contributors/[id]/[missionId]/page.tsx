import { prisma } from "@/lib/prisma";
import { SurveyResponseCard } from "@/components/contributors/survey-response-card";
import { NoResults } from "@/components/contributors/empty-states";

export interface SurveyResponsesListProps {
  id: string;
  missionId: string;
}

export default async function SurveyResponsesList({
  params,
}: {
  params: SurveyResponsesListProps;
}) {
  const { id: contributorId, missionId } = params;
  const responses = await prisma.surveyResponse.findMany({
    where: {
      userId: contributorId,
      survey: {
        missionId: missionId,
      },
    },
    include: {
      survey: {
        select: {
          name: true,
          description: true,
        },
      },
      validationComment: {
        select: {
          id: true,
          comment: true,
          action: true,
          createdAt: true,
          validator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      qualityControl: {
        include: {
          qualityIssues: {
            select: {
              id: true,
              type: true,
              level: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  if (responses.length === 0) {
    return <NoResults hasFilters />;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">
        Historique des soumissions ({responses.length})
      </h4>
      <div className="space-y-3">
        {responses.map((response) => (
          <SurveyResponseCard
            key={response.id}
            response={response as any}
            missionId={missionId}
          />
        ))}
      </div>
    </div>
  );
}
