"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

const generateInsightsSchema = z.object({
  missionId: z.string(),
});

const insightSchema = z.object({
  insights: z.array(
    z.object({
      type: z.enum(["key_finding", "trend", "comparison", "anomaly", "recommendation"]),
      title: z.string(),
      description: z.string(),
      confidence: z.number().min(0).max(100),
      value: z.string().optional(), // Pour les valeurs numériques importantes
    })
  ),
});

const systemPrompt = (language: "fr" | "en") => `
Tu es un expert en analyse de données qui génère des insights automatiques pour des graphiques de sondages.

MISSION: Analyser les données d'un graphique et générer 2-4 insights pertinents et exploitables.

TYPES D'INSIGHTS:
- key_finding: Découverte principale ou statistique marquante
- trend: Tendance observable dans les données
- comparison: Comparaison entre différentes catégories/segments
- anomaly: Valeur ou pattern inhabituel
- recommendation: Suggestion d'action basée sur les données

RÈGLES:
- Génère 2-4 insights maximum (qualité > quantité)
- Chaque insight doit être actionnable et spécifique
- Utilise des chiffres précis quand disponibles
- Adapte le ton à une audience business
- ${language === "fr" ? "Réponds en français" : "Answer in English"}
- Score de confiance basé sur la clarté et la significativité statistique
- Évite les insights évidents ou trop génériques

FORMAT DE RÉPONSE:
- Titre: Une phrase courte et percutante
- Description: 2-3 phrases avec contexte et implication
- Valeur: Chiffre clé si applicable (ex: "68%", "+15%", "2.4x")

EXEMPLES D'INSIGHTS DE QUALITÉ:
${language === "fr" ? `
- "68% des répondants préfèrent le produit A - Une majorité claire se dégage, suggérant un avantage concurrentiel significatif à exploiter."
- "Tendance croissante de +23% sur Q4 - L'évolution positive indique une dynamique favorable qui pourrait se poursuivre avec les bonnes actions."
- "Segment 25-34 ans sous-représenté (12%) - Cette tranche démographique clé nécessite une stratégie ciblée pour améliorer la pénétration."` : `
- "68% of respondents prefer product A - A clear majority emerges, suggesting a significant competitive advantage to leverage."
- "Growing trend of +23% in Q4 - The positive evolution indicates favorable dynamics that could continue with the right actions."
- "25-34 age segment underrepresented (12%) - This key demographic requires targeted strategy to improve penetration."`}
`;

export const generateInsightsAction = authActionClient
  .schema(generateInsightsSchema)
  .metadata({
    name: "generate-insights-action",
  })
  .action(async ({ parsedInput: { missionId }, ctx: { user, auth } }) => {
    try {
      // 1. Récupérer la mission avec tous ses graphiques et seulement les réponses completed
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          missionCharts: {
            where: {
              status: "published"
            }
          },
          survey: {
            include: {
              response: {
                where: {
                  status: "completed" // Ne prendre que les réponses completées
                }
              }
            }
          }
        },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      if (!mission.missionCharts || mission.missionCharts.length === 0) {
        throw new Error("Aucun graphique trouvé pour cette mission");
      }

      // Vérifier s'il y a des réponses completed
      const totalCompletedResponses = mission.survey.reduce((sum, s) => sum + s.response.length, 0);
      if (totalCompletedResponses === 0) {
        return {
          success: false,
          error: "Aucune réponse completed trouvée pour générer des insights"
        };
      }

      let totalInsightsGenerated = 0;

      // 2. Générer des insights pour chaque graphique (mise à jour si existants)
      for (const chart of mission.missionCharts) {

        try {
          // Récupérer les données réelles du graphique depuis les réponses completed
          const chartData = await getChartDataFromCompletedResponses(chart, mission.survey);
          
          if (!chartData || chartData.length === 0) {
            continue; // Pas de données completed pour ce graphique
          }

          // Préparer le contexte pour l'IA
          const analysisContext = {
            chartTitle: chart.title,
            chartType: chart.subType,
            dataPoints: chartData.length,
            sampleData: chartData.slice(0, 5), // Échantillon des données
            totalCompletedResponses: totalCompletedResponses,
            missionName: mission.name,
          };

          // Générer des insights avec l'IA
          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: insightSchema,
            prompt: `Analyse ce graphique de sondage et génère des insights pertinents:

GRAPHIQUE: ${chart.title}
TYPE: ${chart.subType}
MISSION: ${mission.name}
RÉPONSES COMPLETED: ${totalCompletedResponses}
DONNÉES: ${JSON.stringify(analysisContext, null, 2)}

Focus sur les patterns significatifs, les comparaisons importantes, et les recommandations exploitables.`,
            system: systemPrompt("fr"),
          });

          // Filtrer les insights avec une confiance suffisante
          const qualityInsights = object.insights.filter(insight => insight.confidence >= 60);

          // Toujours mettre à jour les insights (même si vides ou existants)
          await prisma.missionChart.update({
            where: { id: chart.id },
            data: {
              insights: qualityInsights.length > 0 ? qualityInsights : [],
              insightsUpdatedAt: new Date(),
            },
          });

          totalInsightsGenerated += qualityInsights.length;

        } catch (chartError) {
          console.error(`Erreur lors de la génération d'insights pour le graphique ${chart.id}:`, chartError);
          // Continue avec le graphique suivant
          continue;
        }
      }

      return {
        success: true,
        data: {
          insightsGenerated: totalInsightsGenerated,
          chartsProcessed: mission.missionCharts.length,
          completedResponses: totalCompletedResponses,
        },
      };
    } catch (error) {
      console.error("[GENERATE_INSIGHTS_ERROR]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });

// Helper function pour récupérer les données réelles du graphique depuis les réponses completed uniquement
async function getChartDataFromCompletedResponses(chart: any, surveys: any[]): Promise<any[]> {
  if (!surveys || surveys.length === 0) {
    return [];
  }

  // Trouver le sondage correspondant
  const survey = surveys.find(s => s.id === chart.surveyId);
  if (!survey || !survey.response || survey.response.length === 0) {
    return [];
  }

  // Ne prendre que les réponses avec status "completed"
  const completedResponses = survey.response.filter((r: any) => r.status === "completed");
  
  if (completedResponses.length === 0) {
    return [];
  }

  const chartData: any = chart.chartData;

  // Si chartData contient déjà la structure QuestionData
  if (chartData && typeof chartData === 'object' && chartData.question) {
    const questionTitle = chartData.question;
    
    // Extraire les réponses completed pour cette question
    const questionResponses: any[] = [];
    
    completedResponses.forEach((response: any) => {
      try {
        const responseData = typeof response.responses === 'string' 
          ? JSON.parse(response.responses) 
          : response.responses;
        
        // Chercher la réponse pour cette question
        Object.entries(responseData).forEach(([question, questionData]: [string, any]) => {
          if (question === questionTitle && questionData && questionData.answer !== undefined) {
            questionResponses.push({
              answer: questionData.answer,
              type: questionData.type,
              age: response.age,
              gender: response.gender,
              location: response.location,
              submittedAt: response.submittedAt,
            });
          }
        });
      } catch (e) {
        // Skip cette réponse si elle ne peut pas être parsée
      }
    });

    return questionResponses;
  }

  return [];
}