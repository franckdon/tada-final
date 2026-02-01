// src/app/[locale]/(dashboard)/missions-to-validate/[missionId]/page.tsx
import { getI18n } from "@/locales/server";
import { prisma } from "@/lib/prisma";
import { ValidationInterface } from "@/components/missions/validation-interface";

type MissionValidationDTO = {
  id: string;
  name: string;
  problemSummary: string | null;
  objectives: string | null;
  audiences: unknown | null;
  targetSampleSize: number | null;
  validationStatus: string | null;
  validationComment: string | null;

  surveys: Array<{
    id: string;
    name: string;
    description: string | null;
    questions: unknown | null;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: { missionId: string; locale: string };
}) {
  const t = await getI18n();
  return { title: `${t("missionsToSubmit.validation.title")} | Tada` };
}

export default async function ValidationPage({
  params,
}: {
  params: { missionId: string; locale: string };
}) {
  const t = await getI18n();
  const missionId = params.missionId;

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      name: true,
      problemSummary: true,
      objectives: true,
      audiences: true,
      targetSampleSize: true,
      validationStatus: true,
      validationComment: true,
      surveys: {
        select: { id: true, name: true, description: true, questions: true },
      },
    },
  });

  if (!mission) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        {t("missionsToSubmit.validation.mission_not_found")}
      </div>
    );
  }

  const missionDTO: MissionValidationDTO = {
    ...mission,
    // rien à convertir ici car on n'a pas inclus createdAt/updatedAt (Dates)
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          {t("missionsToSubmit.validation.title")} : {missionDTO.name}
        </h1>

        <ValidationInterface mission={missionDTO} />
      </div>
    </div>
  );
}
