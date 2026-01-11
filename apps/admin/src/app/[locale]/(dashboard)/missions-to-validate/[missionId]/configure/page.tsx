// src/app/[locale]/(dashboard)/missions-to-validate/[missionId]/configure/page.tsx
import { getI18n } from "@/locales/server";
import { prisma } from "@/lib/prisma";
import { MissionConfigurationForm } from "@/components/missions/mission-configuration-form";

export async function generateMetadata({
  params,
}: {
  params: { missionId: string };
}) {
  const t = await getI18n();
  return {
    title: `${t("missions.config.page_title")} | Tada`,
  };
}

export default async function ConfigureMissionPage({
  params,
}: {
  params: { missionId: string };
}) {
  const t = await getI18n();
  const missionId = params.missionId;

  // 1. Récupérer la mission temporaire et la configuration existante
  const mission = await prisma.tempMission.findUnique({
    where: { id: missionId },
    include: {
        mission: {
            include: {
                // S'assurer que missionConfigContributor est lié via Mission si nécessaire, 
                // ou le chercher directement via missionId
                missionConfigContributor: true,
            }
        }
    }
  });
  
  // Dans l'attente de la structure exacte, cherchons directement la config via missionId
  const initialConfig = await prisma.missionConfigContributor.findUnique({
      where: { missionId: missionId }
  });


  if (!mission || mission.validationStatus !== 'approved') {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        {t("missions.config.mission_not_ready")}
      </div>
    );
  }
  
  // NOTE : Pour utiliser la relation mission.mission.missionConfigContributor, 
  // la relation TempMission -> Mission doit exister, ce qui est le cas. 
  // Nous passons ici la mission et la config existante.

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        {t("missions.config.page_title")} : {mission.name}
      </h1>
      
      <MissionConfigurationForm
        mission={mission}
        initialConfig={initialConfig}
      />
      
    </div>
  );
}