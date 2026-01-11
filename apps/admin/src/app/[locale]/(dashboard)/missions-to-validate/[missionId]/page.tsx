// src/app/[locale]/(dashboard)/missions-to-validate/[missionId]/page.tsx
import { getI18n } from "@/locales/server";
import { prisma } from "@/lib/prisma";
import { ValidationInterface } from "@/components/missions/validation-interface";

export async function generateMetadata({
  params,
}: {
  params: { missionId: string };
}) {
  const t = await getI18n();
  return {
    title: `${t("missionsToSubmit.validation.title")} | Tada`,
  };
}

export default async function ValidationPage({
  params,
}: {
  params: { missionId: string };
}) {
  const t = await getI18n();
  const missionId = params.missionId;

  // 1. Récupérer la mission temporaire et ses données complètes
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    // Inclure les relations si le questionnaire et les objectifs sont stockés séparément
    // include: {
    //   questionnaire: true,
    //   objectives: true, 
    //   // ...
    // },
  });

  if (!mission) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        {t("missionsToSubmit.validation.mission_not_found")}
      </div>
    );
  }

  // 💡 Note: Le brief IA (objectifs, problématique, segments, etc.) 
  // est supposé être stocké dans les champs de mission.
  // Le "questionnaire généré par IA" doit être disponible via `mission.questionnaire`
  // ou un autre champ de données.
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          {t("missionsToSubmit.validation.title")} : {mission.name}
        </h1>
        
        {/* Composant principal de l'interface de validation */}
        <ValidationInterface
          mission={mission}
          // 💡 Passer les données du questionnaire si elles sont complexes et séparées
          // questionnaire={mission.questionnaire} 
        />
        
      </div>
    </div>
  );
}