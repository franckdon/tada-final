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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Monitor,
  Globe,
  Check,
  X,
  Shield,
  AlertTriangle,
  Zap,
  Loader2,
  User,
  Clock,
  Award,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@tada/ui/components/collapsible";
import { QuestionRenderer } from "../contributors/question-renderer";
import { ValidationComments } from "../contributors/validation-comments";
import { ValidationActions } from "../contributors/validation-actions";
import { autoQualityLLMAction } from "@/actions/quality-control/auto-quality-llm-action";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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

interface Contributor {
  id: string;
  name: string;
  email: string;
  image?: string;
  country?: string;
  sector?: string;
  position?: string;
  createdAt: Date | string;
}

interface ValidationComment {
  id: string;
  comment: string;
  action: "approved" | "rejected" | "pending";
  createdAt: Date | string;

  // ⚠️ Dans ton include Prisma, c'est "user" (pas "validator")
  user: {
    id: string;
    name: string;
  };
}

/**
 * NOTE: Tes datas viennent avec validation_comment (snake_case).
 * On supporte aussi validationComment au cas où.
 */
interface MissionSurveyResponse {
  id: string;
  responses: Record<string, any>;
  location: any;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date | string;
  userId: string | null;
  surveyId: string;

  age: number;
  gender: string;

  // ✅ statut collecte (submitted/completed/...)
  status: string;

  // ✅ validations (snake_case)
  validation_comment?: ValidationComment[];
  // ✅ (optionnel) camelCase
  validationComment?: ValidationComment[];

  validatedAt?: Date | string;
  validatedBy?: { id: string; name: string };

  survey: {
    name: string;
    description: string | null;
    questions?: any;
  };

  user?: Contributor;
  qualityControl?: QualityControl | null;
}

interface MissionSurveyResponseCardProps {
  response: MissionSurveyResponse;
  missionId: string;
  showContributorInfo?: boolean;
}

type ValidationStatus = "pending" | "approved" | "rejected";

function safeDate(d: Date | string | undefined | null) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
}

function getValidationStatus(
  response: MissionSurveyResponse,
): ValidationStatus {
  const comments =
    response.validationComment ?? response.validation_comment ?? [];

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

export function MissionSurveyResponseCard({
  response,
  missionId,
  showContributorInfo = true,
}: MissionSurveyResponseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // ✅ vrai statut validation dérivé
  const validationStatus = useMemo(
    () => getValidationStatus(response),
    [response],
  );

  // ✅ override QC après analyse (anti-cache)
  const [qcOverride, setQcOverride] = useState<QualityControl | null>(null);
  const qcEffective: QualityControl | null =
    qcOverride ?? response.qualityControl ?? null;

  const isQcDone =
    qcEffective?.status === "accepted" ||
    qcEffective?.status === "review_required" ||
    qcEffective?.status === "rejected";

  // ✅ règle métier finale pour afficher les boutons
  const canShowValidationActions = validationStatus === "pending" && isQcDone;

  console.log("[MissionSurveyResponseCard] render", {
    responseId: response.id,
    collecteStatus: response.status,
    validationStatus,
    qcFromProps: response.qualityControl?.status ?? null,
    qcOverride: qcOverride?.status ?? null,
    qcEffective: qcEffective?.status ?? null,
    isQcDone,
    canShowValidationActions,
    has_validation_comment: Boolean(response.validation_comment?.length),
    has_validationComment: Boolean(response.validationComment?.length),
  });

  const { execute: runQualityAnalysis, isExecuting: isAnalyzing } = useAction(
    autoQualityLLMAction,
    {
      onSuccess: (result) => {
        console.log("✅ Analyse terminée (raw):", result);

        const qcFromAction = (result as any)?.data?.qualityControl as
          | QualityControl
          | undefined;

        console.log("✅ qcFromAction:", qcFromAction);

        if (qcFromAction?.id) setQcOverride(qcFromAction);

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

  const getContributorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
    const qs: any = response.survey.questions;

    // array
    if (Array.isArray(qs)) {
      const q = qs.find((x: any) => x.name === questionName);
      return q || { name: questionName, type: "unknown", title: questionName };
    }

    // SurveyJS
    if (qs?.pages?.length) {
      const all = qs.pages.flatMap((p: any) => p.elements ?? []);
      const q = all.find((x: any) => x.name === questionName);
      return q || { name: questionName, type: "unknown", title: questionName };
    }

    const answer = response.responses?.[questionName];
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

  // ✅ badge validation (pas collecte)
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
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const submittedAt = safeDate(response.submittedAt);

  const comments =
    response.validationComment ?? response.validation_comment ?? [];

  return (
    <Card className="border-l-4 border-l-primary shadow-none border-y-0 border-r-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* debug collecte */}
              <span className="text-xs text-muted-foreground">
                collecte={response.status} • qc={qcEffective?.status ?? "none"}{" "}
                • validation={validationStatus}
              </span>

              <CardTitle className="text-base flex items-center gap-2 mb-2">
                {response.survey.name}
                {getValidationBadge()}
                {getQualityBadge()}
              </CardTitle>

              {showContributorInfo && response.user && (
                <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded-lg mx-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={response.user.image}
                      alt={response.user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {getContributorInitials(response.user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {response.user.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      {response.user.position && (
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {response.user.position}
                        </span>
                      )}
                      {response.user.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {response.user.country}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Membre depuis{" "}
                        {new Date(response.user.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {submittedAt ? submittedAt.toLocaleString("fr-FR") : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formatLocation(response.location)}
                </span>
              </CardDescription>

              {response.validatedAt && response.validatedBy && (
                <div className="text-xs text-muted-foreground mt-1">
                  Validé par {response.validatedBy.name} le{" "}
                  {new Date(response.validatedAt).toLocaleString("fr-FR")}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ analyser tant que QC pas final */}
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

              {/* ✅ BOUTONS: pending + QC done */}
              {canShowValidationActions && (
                <ValidationActions
                  responseId={response.id}
                  currentStatus={validationStatus} // pending/approved/rejected (PAS collecte)
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

                      {qcEffective.summary && (
                        <div>
                          <span className="text-muted-foreground text-sm">
                            Résumé:
                          </span>
                          <p className="text-sm mt-1">{qcEffective.summary}</p>
                        </div>
                      )}

                      {!!qcEffective.qualityIssues?.length && (
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
                      )}

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

              {!!comments.length && (
                <>
                  <ValidationComments comments={comments as any} />
                  <Separator />
                </>
              )}

              <div>
                <h5 className="font-medium text-sm mb-2">
                  Informations démographiques
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Âge:</span>{" "}
                    {response.age} ans
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genre:</span>{" "}
                    {response.gender}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium text-sm mb-2">
                  Métadonnées techniques
                </h5>
                <div className="space-y-2 text-sm">
                  {response.ipAddress && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <span className="text-muted-foreground">IP:</span>{" "}
                      {response.ipAddress}
                    </div>
                  )}
                  {response.userAgent && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3 w-3" />
                      <span className="text-muted-foreground">
                        Appareil:
                      </span>{" "}
                      {response.userAgent}
                    </div>
                  )}
                  {response.location &&
                    typeof response.location === "object" && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          Coordonnées:
                        </span>
                        {response.location.lat?.toFixed(4)},{" "}
                        {response.location.lng?.toFixed(4)}
                      </div>
                    )}
                </div>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium text-sm mb-3">
                  Réponses au questionnaire (
                  {Object.keys(response.responses ?? {}).length} questions)
                </h5>
                <div className="space-y-3">
                  {Object.entries(response.responses ?? {}).map(
                    ([questionName, answer]) => {
                      const questionInfo = getQuestionInfo(questionName);

                      // support si answer = { type, answer }
                      const value =
                        answer &&
                        typeof answer === "object" &&
                        "answer" in (answer as any)
                          ? (answer as any).answer
                          : answer;

                      return (
                        <QuestionRenderer
                          key={questionName}
                          question={questionInfo}
                          answer={value}
                        />
                      );
                    },
                  )}
                </div>
              </div>

              {/* ✅ Actions expanded uniquement si pending + QC done */}
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
