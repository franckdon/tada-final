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
  .action(async ({ parsedInput: { missionId }, ctx: { user, auth } }) => {
    try {
      // 1. Récupérer la mission avec tous les graphiques et insights
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          missionCharts: {
            where: { status: "published" },
            orderBy: { dashboardOrder: "asc" },
          },
          survey: {
            include: {
              response: {
                where: { status: "completed" },
                select: { id: true, responses: true },
              },
            },
          },
        },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      if (!mission.survey?.[0]?.response?.length) {
        throw new Error("Aucune réponse complétée trouvée pour cette mission");
      }

      // 2. Vérifier si un résumé exécutif existe déjà
      const existingSummary = mission.executiveSummary;
      const isUpdate = !!existingSummary;

      // 3. Collecter toutes les données pour le résumé
      const surveyResponses = mission.survey[0].response;
      const charts = mission.missionCharts;
      const totalResponses = surveyResponses.length;

      // Préparer les données des insights existants
      const chartInsights = charts
        .filter((chart) => chart.insights)
        .map((chart) => {
          const chartData = chart.chartData as any;
          return {
            question: chartData?.question || chart.title,
            insights: chart.insights,
          };
        });

      // 4. Générer le prompt pour le résumé exécutif
      const prompt = `Tu es un expert en analyse de données et insights. Génère un résumé exécutif ultra-concis pour cette mission de recherche.

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

${isUpdate ? "MISE À JOUR: Il s'agit d'une mise à jour du résumé existant. Intègre les nouvelles données et insights." : ""}`;

      // 5. Appeler AI SDK pour générer le résumé exécutif
      const { text: executiveSummary } = await generateText({
        model: openai("gpt-4o"),
        system: "Tu es un expert en synthèse de données. Tu génères des résumés exécutifs ULTRA-CONCIS de maximum 7 lignes, sans titres markdown, avec des phrases courtes et percutantes.",
        prompt,
        temperature: 0.2,
        maxTokens: 500,
      });

      if (!executiveSummary) {
        throw new Error("Erreur lors de la génération du résumé exécutif");
      }

      // 6. Sauvegarder le résumé exécutif
      await prisma.mission.update({
        where: { id: missionId },
        data: {
          executiveSummary,
          executiveSummaryUpdatedAt: new Date(),
        },
      });

      console.log(
        `Résumé exécutif ${isUpdate ? "mis à jour" : "généré"} pour la mission: ${mission.name}`
      );

      return {
        success: true,
        data: {
          missionId,
          executiveSummary,
          isUpdate,
          chartsAnalyzed: charts.length,
          totalResponses,
        },
      };
    } catch (error) {
      console.error("[GENERATE_EXECUTIVE_SUMMARY_ERROR]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
