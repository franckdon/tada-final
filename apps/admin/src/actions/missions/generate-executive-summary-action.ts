"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { generateExecutiveSummarySchema } from "./schema";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const generateExecutiveSummaryAction = authActionClient
  .schema(generateExecutiveSummarySchema)
  .metadata({
    name: "generate-executive-summary-action",
  })
  .action(async ({ parsedInput: { missionId } }) => {
    try {
      // --------------------------------------------------
      // 1. Fetch mission + charts + responses
      // --------------------------------------------------
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          missionCharts: {
            where: { status: "published" },
            orderBy: { dashboardOrder: "asc" },
          },
          surveys: {
            include: {
              responses: {
                where: { status: "completed" },
                select: {
                  id: true,
                  responses: true,
                },
              },
            },
          },
        },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      const survey = mission.surveys?.[0];

      if (!survey || !survey.responses.length) {
        throw new Error(
          "Aucune réponse complétée trouvée pour cette mission"
        );
      }

      // --------------------------------------------------
      // 2. Anti-loop / anti double génération
      // --------------------------------------------------
      if (mission.executiveSummaryUpdatedAt) {
        const lastUpdate = new Date(
          mission.executiveSummaryUpdatedAt
        ).getTime();

        const FIVE_MINUTES = 5 * 60 * 1000;

        if (Date.now() - lastUpdate < FIVE_MINUTES) {
          console.log("Executive summary récent → skip génération");

          return {
            success: true,
            data: {
              missionId,
              executiveSummary: mission.executiveSummary,
              isUpdate: true,
              skipped: true,
              chartsAnalyzed: mission.missionCharts.length,
              totalResponses: survey.responses.length,
            },
          };
        }
      }

      const isUpdate = !!mission.executiveSummary;

      const charts = mission.missionCharts;
      const totalResponses = survey.responses.length;

      // --------------------------------------------------
      // 3. Build insights data
      // --------------------------------------------------
      const chartInsights = charts
        .filter((chart) => chart.insights)
        .map((chart) => {
          const chartData = chart.chartData as any;

          return {
            question: chartData?.question || chart.title,
            insights: chart.insights,
          };
        });

      // --------------------------------------------------
      // 4. Build prompt
      // --------------------------------------------------
const prompt = `
Tu es un expert en analyse de données et insights. Génère un résumé exécutif ultra-concis pour cette mission de recherche.

MISSION: "${mission.name}"
${mission.objectives ? `OBJECTIFS: ${mission.objectives}` : ""}
${mission.problemSummary ? `PROBLÉMATIQUE: ${mission.problemSummary}` : ""}

STATISTIQUES:
- Nombre total de réponses: ${totalResponses}
- Nombre de questions analysées: ${charts.length}
- Statut: Mission complétée

INSIGHTS DISPONIBLES:
${chartInsights
  .map(
    (item, index) => `
${index + 1}. Question: "${item.question}"
Insights: ${JSON.stringify(item.insights, null, 2)}
`
  )
  .join("\n")}

INSTRUCTIONS CRITIQUES:
Rédige un résumé exécutif ULTRA-CONCIS en français, limité à MAXIMUM 7 LIGNES au total:

1. **Ligne 1**: Contexte de l'étude et nombre de participants
2. **Lignes 2-4**: Les 3 découvertes les plus importantes uniquement
3. **Lignes 5-6**: Les 2 recommandations les plus critiques
4. **Ligne 7**: Conclusion en une phrase

FORMAT OBLIGATOIRE:
- MAXIMUM 7 LIGNES au total
- Chaque ligne = maximum 120 caractères
- Pas de sections avec titres markdown
- Phrases courtes et percutantes
- Focus sur l'essentiel uniquement
- Ton professionnel et direct

EXEMPLE DE FORMAT ATTENDU:
Cette étude sur [sujet] a collecté X réponses de participants ciblés.
Découverte principale 1: [insight clé avec chiffre].
Découverte principale 2: [insight clé avec chiffre].
Découverte principale 3: [insight clé avec chiffre].
Recommandation prioritaire 1: [action concrète].
Recommandation prioritaire 2: [action concrète].
Ces résultats offrent une opportunité stratégique claire pour [conclusion].

${
  isUpdate
    ? "MISE À JOUR: Il s'agit d'une mise à jour du résumé existant. Intègre les nouvelles données et insights."
    : ""
}
`;


      // --------------------------------------------------
      // 5. AI generation
      // --------------------------------------------------
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system:
          "Tu génères des résumés exécutifs ultra concis.",
        prompt,
        temperature: 0.2,
        maxOutputTokens: 400, // ✅ fix AI SDK
      });

      if (!text) {
        throw new Error("Erreur génération résumé");
      }

      // --------------------------------------------------
      // 6. Save
      // --------------------------------------------------
      await prisma.mission.update({
        where: { id: missionId },
        data: {
          executiveSummary: text,
          executiveSummaryUpdatedAt: new Date(),
        },
      });

      console.log(
        `Résumé exécutif ${isUpdate ? "mis à jour" : "créé"} pour ${mission.name}`
      );

      return {
        success: true,
        data: {
          missionId,
          executiveSummary: text,
          isUpdate,
          chartsAnalyzed: charts.length,
          totalResponses,
        },
      };
    } catch (error) {
      console.error("[GENERATE_EXECUTIVE_SUMMARY_ERROR]", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue",
      };
    }
  });
