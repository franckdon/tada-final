"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import { Separator } from "@tada/ui/components/separator";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Check,
  X,
  Shield,
  AlertTriangle,
  Zap,
  Loader2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@tada/ui/components/collapsible";
import { QuestionRenderer } from "./question-renderer";
import { ValidationComments } from "./validation-comments";
import { ValidationActions } from "./validation-actions";
import { autoQualityLLMAction } from "@/actions/quality-control/auto-quality-llm-action";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

/**
 * =========================
 * Types (keep minimal)
 * =========================
 */

interface QualityControl {
  id: string;
  status: "pending" | "analyzing" | "accepted" | "review_required" | "rejected";
  overallScore: number;
  summary?: string;
  decision?: string;
  decisionReason?: string;
  analyzedAt?: Date | string;
  qualityIssues?: Array<{
    id: string;
    type: string;
    level: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
  }>;
}

interface ValidationComment {
  id: string;
  comment: string;
  action: "approved" | "rejected" | "pending";
  createdAt: Date | string;
  validator: {
    id: string;
    name: string;
  };
}

interface SurveyResponse {
  id: string;
  responses: Record<string, any>;
  location: any;
  submittedAt: Date | string;

  // statut "collecte" (submitted/completed etc.)
  status: string;

  age: number;
  gender: string;

  validationComment?: ValidationComment[];
  validatedAt?: Date | string;
  validatedBy?: { id: string; name: string };

  survey: {
    name: string;
    description: string | null;
    questions?: any;
  };

  qualityControl?: QualityControl | null;
}

interface SurveyResponseCardProps {
  response: SurveyResponse;
  missionId: string;
}

type ValidationStatus = "pending" | "approved" | "rejected";

function getValidationStatus(response: SurveyResponse): ValidationStatus {
  const comments = response.validationComment ?? [];

  if (comments.length > 0) {
    const sorted = [...comments].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const last = sorted[sorted.length - 1];

    if (last?.action === "rejected") return "rejected";
    if (last?.action === "approved") return "approved";
  }

  if (response.validatedAt) return "approved";
  return "pending";
}

function safeDate(d: Date | string | undefined | null) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

export function SurveyResponseCard({
  response,
  missionId,
}: SurveyResponseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  /**
   * ✅ Log "inratable" : on saura si CE composant tourne réellement.
   */
  useEffect(() => {
    console.log("🔥 SurveyResponseCard MOUNTED", {
      responseId: response.id,
      missionId,
      ts: Date.now(),
    });
  }, [response.id, missionId]);

  const validationStatus = useMemo(
    () => getValidationStatus(response),
    [response],
  );

  /**
   * ✅ IMPORTANT:
   * Après analyse, on override localement le QC pour ne pas dépendre de router.refresh() / cache serveur.
   */
  const [qcOverride, setQcOverride] = useState<QualityControl | null>(null);
  const qcEffective: QualityControl | null =
    qcOverride ?? response.qualityControl ?? null;

  /**
   * ✅ Analyse terminée ?
   * On considère "done" uniquement sur les statuts finaux.
   */
  const isQcDone =
    qcEffective?.status === "accepted" ||
    qcEffective?.status === "review_required" ||
    qcEffective?.status === "rejected";

  /**
   * ✅ Règle métier :
   * actions visibles seulement si :
   *  - validationStatus = pending
   *  - analyse QC terminée
   */
  const canShowValidationActions = validationStatus === "pending" && isQcDone;

  /**
   * ✅ Log principal demandé
   * (si tu ne le vois pas => mauvais fichier importé OU logs supprimés)
   */
  console.log("[SurveyResponseCard] render", {
    responseId: response.id,
    collecteStatus: response.status,
    validationStatus,
    qcFromProps: response.qualityControl?.status ?? null,
    qcOverride: qcOverride?.status ?? null,
    qcEffective: qcEffective?.status ?? null,
    isQcDone,
    canShowValidationActions,
  });

  const { execute: runQualityAnalysis, isExecuting: isAnalyzing } = useAction(
    autoQualityLLMAction,
    {
      onSuccess: (result) => {
        console.log("✅ Analyse terminée (raw):", result);

        // ✅ Essaye de récupérer QC depuis la réponse action
        const qcFromAction = (result as any)?.data?.qualityControl as
          | QualityControl
          | undefined;

        console.log("✅ Analyse terminée (qcFromAction):", qcFromAction);

        if (qcFromAction?.id) {
          setQcOverride(qcFromAction);
        } else {
          console.warn(
            "⚠️ Pas de qualityControl dans le retour action. Vérifie result.data.qualityControl.",
          );
        }

        // ✅ Resync serveur (optionnel)
        setTimeout(() => router.refresh(), 100);
      },
      onError: (error) => {
        console.error("❌ Erreur lors de l'analyse:", error);
        toast({
          title: "Erreur lors de l'analyse",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive",
        });
      },
    },
  );

  const handleQualityAnalysis = () => {
    console.log("🟦 Click Analyser", { responseId: response.id });
    runQualityAnalysis({ surveyResponseId: response.id });
  };

  const formatLocation = (location: any) => {
    if (typeof location === "object" && location?.label) return location.label;
    return "Non spécifié";
  };

  const deduceQuestionType = (answer: any) => {
    if (!answer) return "text";
    if (typeof answer === "object" && answer.type) return answer.type;
    if (typeof answer === "boolean") return "boolean";
    if (Array.isArray(answer)) return "checkbox";
    if (typeof answer === "string") return "text";
    if (typeof answer === "number") return "rating";
    return "text";
  };

  const getQuestionInfo = (questionName: string) => {
    // Si questions = objet JSON (SurveyJS), ton find() peut ne pas marcher.
    // On garde un fallback robuste.
    const qs: any = response.survey.questions;

    // Cas array classique
    if (Array.isArray(qs)) {
      const q = qs.find((x: any) => x.name === questionName);
      return q || { name: questionName, type: "unknown", title: questionName };
    }

    // Cas SurveyJS (questions.pages[].elements[])
    if (qs?.pages?.length) {
      const all = qs.pages.flatMap((p: any) => p.elements ?? []);
      const q = all.find((x: any) => x.name === questionName);
      return q || { name: questionName, type: "unknown", title: questionName };
    }

    const answer = response.responses[questionName];
    return {
      name: questionName,
      type: deduceQuestionType(answer),
      title: questionName,
    };
  };

  const getQualityBadge = () => {
    if (!qcEffective) {
      return (
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Non analysé
        </Badge>
      );
    }

    if (
      qcEffective.status === "analyzing" ||
      qcEffective.status === "pending"
    ) {
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Analyse...
        </Badge>
      );
    }

    const score = qcEffective.overallScore;
    if (score >= 80) {
      return (
        <Badge
          variant="success"
          className="bg-green-100 text-green-800 text-xs"
        >
          <Shield className="h-3 w-3 mr-1" />
          Qualité: {score}/100
        </Badge>
      );
    }
    if (score >= 50) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 text-xs"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />À réviser: {score}/100
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-xs">
        <X className="h-3 w-3 mr-1" />
        Faible: {score}/100
      </Badge>
    );
  };

  const getValidationBadge = () => {
    switch (validationStatus) {
      case "approved":
        return (
          <Badge variant="success" className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      case "pending":
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const submittedAt = safeDate(response.submittedAt);

  return (
    <Card className="border-l-4 border-l-primary shadow-none border-y-0 border-r-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {/* ✅ Marqueur visuel inratable : si tu ne vois pas ça, tu n'es pas sur le bon fichier */}
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800">
                  DEBUG CARD
                </span>

                {response.survey.name}
                {getValidationBadge()}
                {getQualityBadge()}
              </CardTitle>

              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {submittedAt ? submittedAt.toLocaleString("fr-FR") : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatLocation(response.location)}
                </span>

                {/* debug collecte */}
                <span className="text-xs text-muted-foreground">
                  collecte: {String(response.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  qc: {qcEffective?.status ?? "none"}
                </span>
                <span className="text-xs text-muted-foreground">
                  validation: {validationStatus}
                </span>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ Bouton analyser tant que QC pas final */}
              {!isQcDone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQualityAnalysis}
                  disabled={isAnalyzing}
                  className={`text-xs transition-all duration-200 ${
                    isAnalyzing ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin text-blue-600" />
                  ) : (
                    <Zap className="h-3 w-3 mr-1" />
                  )}
                  {isAnalyzing ? "Analyse en cours..." : "Analyser"}
                </Button>
              )}

              {/* ✅ Actions seulement après analyse terminée */}
              {canShowValidationActions && (
                <ValidationActions
                  responseId={response.id}
                  currentStatus={validationStatus} // "pending"
                  missionId={missionId}
                />
              )}

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4 p-5">
              {qcEffective && (
                <>
                  <div>
                    <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Contrôle Qualité Automatique
                    </h5>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Score global:
                          </span>{" "}
                          <span className="font-medium">
                            {qcEffective.overallScore}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Décision:
                          </span>{" "}
                          <span className="font-medium">
                            {qcEffective.decision || "—"}
                          </span>
                        </div>
                      </div>

                      {qcEffective.decisionReason && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Raison:</span>{" "}
                          {qcEffective.decisionReason}
                        </div>
                      )}

                      {qcEffective.summary && (
                        <div>
                          <span className="text-muted-foreground text-sm">
                            Résumé:
                          </span>
                          <p className="text-sm mt-1">{qcEffective.summary}</p>
                        </div>
                      )}

                      {qcEffective.qualityIssues?.length ? (
                        <div>
                          <span className="text-muted-foreground text-sm">
                            Problèmes détectés:
                          </span>
                          <div className="mt-2 space-y-2">
                            {qcEffective.qualityIssues.map((issue) => (
                              <div
                                key={issue.id}
                                className="flex items-start gap-2 text-sm"
                              >
                                <AlertTriangle className="h-3 w-3 mt-0.5" />
                                <div>
                                  <div className="font-medium">
                                    {issue.title}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {issue.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {qcEffective.analyzedAt && (
                        <div className="text-xs text-muted-foreground">
                          Analysé le{" "}
                          {new Date(qcEffective.analyzedAt).toLocaleString(
                            "fr-FR",
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {response.validationComment?.length ? (
                <>
                  <ValidationComments comments={response.validationComment} />
                  <Separator />
                </>
              ) : null}

              <div>
                <h5 className="font-medium text-sm mb-3">
                  Réponses au questionnaire (
                  {Object.keys(response.responses).length} questions)
                </h5>
                <div className="space-y-3">
                  {Object.entries(response.responses).map(
                    ([questionName, answer]) => {
                      const questionInfo = getQuestionInfo(questionName);
                      return (
                        <QuestionRenderer
                          key={questionName}
                          question={questionInfo}
                          answer={answer}
                        />
                      );
                    },
                  )}
                </div>
              </div>

              {/* ✅ Actions en bas (expanded) après analyse */}
              {canShowValidationActions && (
                <div className="flex justify-end">
                  <ValidationActions
                    responseId={response.id}
                    currentStatus={validationStatus}
                    variant="expanded"
                    missionId={missionId}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
