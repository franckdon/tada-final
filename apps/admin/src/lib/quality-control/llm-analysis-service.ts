import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { 
  ProcessedSurveyResponse,
  LLMAnalysisRequest,
  LLMAnalysisResponse,
  QualityIssueType,
  QualityIssueLevel 
} from "../../types/quality-control";

const QualityAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    consistency: z.number().min(0).max(100).optional(),
    media: z.number().min(0).max(100).optional(),
    geographic: z.number().min(0).max(100).optional(),
    temporal: z.number().min(0).max(100).optional(),
    completeness: z.number().min(0).max(100).optional(),
  }),
  issues: z.array(z.object({
    type: z.enum([
      "response_consistency",
      "media_quality", 
      "geographic_validity",
      "temporal_integrity",
      "data_completeness",
      "suspicious_pattern"
    ]),
    level: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    description: z.string(),
    fieldPath: z.string().optional(),
    confidence: z.number().min(0).max(1),
    suggestions: z.record(z.any()).optional(),
  })),
  summary: z.string(),
  recommendations: z.record(z.any()),
  decision: z.enum(["accept", "review", "reject"]),
  decisionReason: z.string(),
});

export class LLMAnalysisService {
  private model = openai("gpt-4o-mini");

  async analyzeResponse(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse> {
    const prompt = this.buildAnalysisPrompt(request);
    const systemPrompt = this.getSystemPrompt(request.analysisType, request.focusAreas);

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: QualityAnalysisSchema,
        prompt,
        system: systemPrompt,
        temperature: 0.3, // Bas pour plus de cohérence
      });

      return {
        overallScore: object.overallScore,
        scores: object.scores,
        issues: object.issues.map(issue => ({
          type: issue.type as QualityIssueType,
          level: issue.level as QualityIssueLevel,
          title: issue.title,
          description: issue.description,
          fieldPath: issue.fieldPath,
          confidence: issue.confidence,
          suggestions: issue.suggestions,
        })),
        summary: object.summary,
        recommendations: object.recommendations,
        decision: object.decision,
        decisionReason: object.decisionReason,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse LLM:", error);
      throw new Error(`Erreur lors de l'analyse LLM: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private buildAnalysisPrompt(request: LLMAnalysisRequest): string {
    const { surveyResponse, survey } = request;
    
    return `
Analyse cette soumission de questionnaire pour détecter des problèmes de qualité :

## Informations sur le questionnaire
- **ID Survey:** ${survey.id}
- **Nom:** ${survey.name}
- **Description:** ${survey.description || 'Non spécifiée'}

## Questions du questionnaire
${JSON.stringify(survey.questions, null, 2)}

## Réponse à analyser
- **ID Réponse:** ${surveyResponse.id}
- **Soumise le:** ${surveyResponse.submittedAt.toISOString()}
- **Âge:** ${surveyResponse.age}
- **Genre:** ${surveyResponse.gender}
- **Localisation:** ${JSON.stringify(surveyResponse.location)}
- **IP:** ${surveyResponse.ipAddress || 'Non disponible'}
- **User Agent:** ${surveyResponse.userAgent || 'Non disponible'}

## Réponses fournies
${JSON.stringify(surveyResponse.responses, null, 2)}

## Instructions d'analyse
${request.focusAreas ? 
  `Concentrez-vous particulièrement sur ces aspects : ${request.focusAreas.join(', ')}` :
  'Effectuez une analyse complète de tous les aspects qualité'
}

Analysez cette soumission selon les critères suivants :
1. **Cohérence des réponses** (consistency) : Vérifiez la logique entre les différentes réponses
2. **Qualité des médias** (media) : Si des fichiers sont mentionnés, évaluez leur pertinence
3. **Validité géographique** (geographic) : Cohérence de la localisation
4. **Intégrité temporelle** (temporal) : Temps de soumission réaliste
5. **Complétude** (completeness) : Exhaustivité des réponses

Fournissez un score global et des scores détaillés, identifiez les problèmes spécifiques et recommandez une décision.
    `.trim();
  }

  private getSystemPrompt(analysisType: string, focusAreas?: QualityIssueType[]): string {
    return `
Vous êtes un expert en contrôle qualité des données d'enquête mobile. Votre rôle est d'analyser les soumissions pour détecter :

## Critères d'évaluation

### 1. Cohérence des réponses (0-100)
- Logique entre réponses booléennes et commentaires associés
- Cohérence des évaluations (ratings) avec les commentaires
- Absence de contradictions flagrantes

### 2. Qualité des médias (0-100)
- Pertinence des fichiers uploadés par rapport aux questions
- Qualité technique des images/documents
- Présence de contenu requis

### 3. Validité géographique (0-100)
- Coordonnées GPS réalistes (pas 0,0)
- Cohérence avec le contexte de l'enquête
- Précision de la localisation

### 4. Intégrité temporelle (0-100)
- Temps de completion réaliste (ni trop rapide, ni anormalement long)
- Cohérence des horodatages
- Pattern de soumission naturel

### 5. Complétude des données (0-100)
- Réponses à toutes les questions obligatoires
- Qualité des réponses textuelles
- Absence de réponses vides ou non pertinentes

## Niveaux de problèmes
- **Critical (90-100 points d'impact)** : Problèmes majeurs qui invalident la soumission
- **High (60-89 points)** : Problèmes importants nécessitant une révision
- **Medium (30-59 points)** : Problèmes modérés à surveiller
- **Low (0-29 points)** : Problèmes mineurs ou améliorations suggérées

## Décisions recommandées
- **Accept (score ≥ 80)** : Données de bonne qualité, acceptables
- **Review (score 50-79)** : Données acceptables mais nécessitent une révision humaine
- **Reject (score < 50)** : Données de qualité insuffisante à rejeter

## Format de réponse requis
Fournissez une analyse structurée avec :
1. Score global et scores détaillés
2. Liste des problèmes identifiés avec niveau de criticité
3. Résumé concis des findings
4. Recommandations d'amélioration
5. Décision finale avec justification

Soyez précis, objectif et constructif dans vos évaluations.
    `.trim();
  }

  /**
   * Analyse rapide basée sur des règles simples
   */
  async quickAnalysis(response: ProcessedSurveyResponse): Promise<{
    score: number;
    issues: string[];
    decision: "accept" | "review" | "reject";
  }> {
    let score = 100;
    const issues: string[] = [];

    // Vérifications temporelles
    const now = new Date();
    const timeDiff = now.getTime() - response.submittedAt.getTime();
    if (timeDiff < 10000) { // Moins de 10 secondes
      score -= 30;
      issues.push("Soumission anormalement rapide");
    }

    // Vérifications géographiques
    if (response.location.lat === 0 && response.location.lng === 0) {
      score -= 20;
      issues.push("Coordonnées GPS par défaut");
    }

    // Vérifications de complétude
    const emptyResponses = Object.values(response.responses).filter(
      v => !v || v === "" || (Array.isArray(v) && v.length === 0)
    );
    if (emptyResponses.length > 0) {
      score -= emptyResponses.length * 5;
      issues.push(`${emptyResponses.length} réponses manquantes`);
    }

    // Pattern suspect (toutes les réponses identiques)
    const responseValues = Object.values(response.responses);
    const uniqueValues = new Set(responseValues.map(v => JSON.stringify(v)));
    if (uniqueValues.size === 1 && responseValues.length > 3) {
      score -= 40;
      issues.push("Pattern de réponse suspect (toutes identiques)");
    }

    let decision: "accept" | "review" | "reject";
    if (score >= 80) decision = "accept";
    else if (score >= 50) decision = "review";
    else decision = "reject";

    return { score, issues, decision };
  }
}