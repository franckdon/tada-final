"use client";

import { useState } from "react";
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
  Monitor,
  Globe,
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

interface QualityControl {
  id: string;
  status: "pending" | "analyzing" | "accepted" | "review_required" | "rejected";
  overallScore: number;
  consistencyScore?: number;
  mediaScore?: number;
  geoScore?: number;
  temporalScore?: number;
  completenessScore?: number;
  summary?: string;
  decision?: string;
  decisionReason?: string;
  analyzedAt?: Date;
  qualityIssues?: Array<{
    id: string;
    type: string;
    level: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
  }>;
}

interface SurveyResponse {
  id: string;
  responses: Record<string, any>;
  location: any;
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
  userId: string | null;
  surveyId: string;
  age: number;
  gender: string;
  status: string;
  validationComment?: ValidationComment[];
  validatedAt?: Date;
  validatedBy?: {
    id: string;
    name: string;
  };
  survey: {
    name: string;
    description: string | null;
    questions?: any;
  };
  qualityControl?: QualityControl;
}

interface ValidationComment {
  id: string;
  comment: string;
  action: "approved" | "rejected" | "pending";
  createdAt: Date;
  validator: {
    id: string;
    name: string;
  };
}

interface SurveyResponseCardProps {
  response: SurveyResponse;
  canValidate?: boolean;
  currentUserId?: string;
  missionId: string;
}

export function SurveyResponseCard({
  response,
  missionId,
}: SurveyResponseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { execute: runQualityAnalysis, isExecuting: isAnalyzing } = useAction(
    autoQualityLLMAction,
    {
      onSuccess: (result) => {
        console.log("✅ Analyse terminée:", result);

        setTimeout(() => {
          router.refresh();
        }, 100); // Petit délai pour s'assurer que l'action est terminée
      },
      onError: (error) => {
        console.error("❌ Erreur lors de l'analyse:", error);

        toast({
          title: "Erreur lors de l'analyse",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive",
        });
      },
    }
  );

  const formatLocation = (location: any) => {
    if (typeof location === "object" && location.label) {
      return location.label;
    }
    return "Non spécifié";
  };

  const getQuestionInfo = (questionName: string) => {
    if (response.survey.questions) {
      const question = response.survey.questions.find(
        (q: any) => q.name === questionName
      );
      return question || { name: questionName, type: "unknown" };
    }

    const answer = response.responses[questionName];
    return {
      name: questionName,
      type: deduceQuestionType(answer),
      title: questionName,
    };
  };

  const deduceQuestionType = (answer: any) => {
    if (!answer) return "text";
    if (typeof answer === "object" && answer.type) {
      return answer.type;
    }
    if (typeof answer === "boolean") return "boolean";
    if (Array.isArray(answer)) return "checkbox";
    if (typeof answer === "string") return "text";
    if (typeof answer === "number") return "rating";
    return "text";
  };

  const handleQualityAnalysis = () => {
    runQualityAnalysis({ surveyResponseId: response.id });
  };

  const getQualityBadge = () => {
    const qc = response.qualityControl;
    if (!qc) {
      return (
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Non analysé
        </Badge>
      );
    }

    if (qc.status === "analyzing") {
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Analyse...
        </Badge>
      );
    }

    const score = qc.overallScore;
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
    } else if (score >= 50) {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 text-xs"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />À réviser: {score}/100
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="text-xs">
          <X className="h-3 w-3 mr-1" />
          Faible: {score}/100
        </Badge>
      );
    }
  };

  const getStatusBadge = () => {
    switch (response.status) {
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
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{response.status}</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary shadow-none border-y-0 border-r-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {response.survey.name}
                {getStatusBadge()}
                {getQualityBadge()}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(response.submittedAt).toLocaleString("fr-FR")}
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
              {!response.qualityControl && (
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
              {response.status === "pending" && (
                <ValidationActions
                  responseId={response.id}
                  currentStatus={response.status}
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
              {response.qualityControl && (
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
                            {response.qualityControl.overallScore}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Décision:
                          </span>{" "}
                          <span className="font-medium">
                            {response.qualityControl.decision || "En cours"}
                          </span>
                        </div>
                      </div>

                      {response.qualityControl.summary && (
                        <div>
                          <span className="text-muted-foreground text-sm">
                            Résumé:
                          </span>
                          <p className="text-sm mt-1">
                            {response.qualityControl.summary}
                          </p>
                        </div>
                      )}

                      {response.qualityControl.qualityIssues &&
                        response.qualityControl.qualityIssues.length > 0 && (
                          <div>
                            <span className="text-muted-foreground text-sm">
                              Problèmes détectés:
                            </span>
                            <div className="mt-2 space-y-2">
                              {response.qualityControl.qualityIssues.map(
                                (issue) => (
                                  <div
                                    key={issue.id}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <AlertTriangle
                                      className={`h-3 w-3 mt-0.5 ${
                                        issue.level === "critical"
                                          ? "text-red-500"
                                          : issue.level === "high"
                                          ? "text-orange-500"
                                          : issue.level === "medium"
                                          ? "text-yellow-500"
                                          : "text-blue-500"
                                      }`}
                                    />
                                    <div>
                                      <div className="font-medium">
                                        {issue.title}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {issue.description}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {response.qualityControl.analyzedAt && (
                        <div className="text-xs text-muted-foreground">
                          Analysé le{" "}
                          {new Date(
                            response.qualityControl.analyzedAt
                          ).toLocaleString("fr-FR")}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {response.validationComment &&
                response.validationComment.length > 0 && (
                  <>
                    <ValidationComments comments={response.validationComment} />
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

              {/* Métadonnées techniques */}
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
                    }
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <ValidationActions
                  responseId={response.id}
                  currentStatus={response.status}
                  variant="expanded"
                  missionId={missionId}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
