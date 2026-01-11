// src/components/missions/validation-interface.tsx
"use client";

import { validateMissionAction } from "@/actions/missions/validation-mission-action";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Mission } from "@prisma/client";
import { Button } from "@tada/ui/components/button";
import { Textarea } from "@tada/ui/components/textarea";
import { Check, Edit, Loader2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ValidationInterfaceProps {
  mission: Mission;
  // Si le questionnaire est un objet JSON complexe, le passer ici
  // questionnaire?: any; 
}

// Définition simple pour le statut de la section
type ValidationStatus = "ok" | "pending" | "issue";

// Composant pour l'interface de validation
export function ValidationInterface({ mission }: ValidationInterfaceProps) {
  const t = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [comment, setComment] = useState(mission.validationComment || ""); // Initialise avec l'ancien commentaire si existant
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1: Brief, 2: Questionnaire

  const [briefStatus, setBriefStatus] = useState<ValidationStatus>("pending");
  const [questionnaireStatus, setQuestionnaireStatus] =
    useState<ValidationStatus>("pending");

  const validateMission = useAction(validateMissionAction, {
    onSuccess: (data) => {
      const status = data.data?.mission.validationStatus;
      toast({
        title: t("missionsToSubmit.validation.success"),
        description: `Mission marquée comme ${status}.`,
      });
      // Retourner à la liste après validation
      router.push("/missions-to-validate");
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("missionsToSubmit.validation.error"),
        description: t("common.generic_error"),
        variant: "destructive",
      });
    },
  });

  const handleValidationAction = (validationStatus: "approved" | "rejected" | "modification_requested") => {
    
    const cleanComment = comment.trim();
    
    // 🚨 Vérifie si un commentaire est requis pour Rejet/Modification
    if (validationStatus !== "approved" && !cleanComment) {
        toast({ 
            title: t("missionsToSubmit.validation.warning"), 
            description: validationStatus === "rejected" 
                ? t("missionsToSubmit.validation.comment_required_reject") 
                : t("missionsToSubmit.validation.comment_required_modify"),
            variant: "destructive"
        });
        return;
    }

    validateMission.execute({
      missionId: mission.id,
      validationStatus,
      comment: cleanComment || undefined,
    });
  };

  const currentValidationStatus = currentStep === 1 ? briefStatus : questionnaireStatus;
  const setValidationStatus = currentStep === 1 ? setBriefStatus : setQuestionnaireStatus;

  // --- Rendu d'une section ---
  const renderSection = (
    title: string,
    content: string,
    criteria: string[],
    step: 1 | 2
  ) => (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Étape {step} : {title}
      </h2>

      {/* Affichage du Contenu (Brief ou Questionnaire) */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-md mb-4 whitespace-pre-line">
        {content} 
        {/* Pour le questionnaire, il faudrait un composant plus complexe ici */}
      </div>

      <h3 className="text-lg font-medium mb-2 text-gray-700">Critères d'analyse :</h3>
      <ul className="list-disc ml-6 space-y-1 text-sm text-gray-600">
        {criteria.map((c, index) => (
          <li key={index}>{c}</li>
        ))}
      </ul>
      
      <div className="mt-4 flex space-x-2 justify-end">
         <Button 
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setValidationStatus("issue")}
         >
            <X className="w-4 h-4 mr-2" /> 
            Problème détecté
        </Button>
        <Button 
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => setValidationStatus("ok")}
        >
            <Check className="w-4 h-4 mr-2" /> 
            Conforme
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* --- ÉTAPE 1 : Analyse du brief IA --- */}
        {renderSection(
          t("missionsToSubmit.validation.step1_title"),
          `Problématique: ${mission.problemSummary || t("common.no_data")}\nObjectifs: ${mission.objectives || t("common.no_data")}\nAudiences: ${mission.audiences ? JSON.stringify(mission.audiences) : t("common.no_data")}\nNb. Réponses: ${mission.targetSampleSize || t("common.not_specified")}`,
          [
            t("missionsToSubmit.validation.c1_objectives"),
            t("missionsToSubmit.validation.c1_problem"),
            t("missionsToSubmit.validation.c1_segments"),
            t("missionsToSubmit.validation.c1_coherence"),
          ],
          1
        )}

        {/* --- ÉTAPE 2 : Analyse du questionnaire généré par IA --- */}
        {renderSection(
          t("missionsToSubmit.validation.step2_title"),
          // 💡 Utilise `assumptions` pour le placeholder Questionnaire
          mission.assumptions || t("missionsToSubmit.validation.questionnaire_placeholder"), 
          [
            t("missionsToSubmit.validation.c2_brief_coherence"),
            t("missionsToSubmit.validation.c2_structure"),
            t("missionsToSubmit.validation.c2_clarity"),
            t("missionsToSubmit.validation.c2_workload"),
            t("missionsToSubmit.validation.c2_feasibility"),
          ],
          2
        )}
      </div>

      {/* --- SIDEBAR d'actions de validation --- */}
      <div className="col-span-1 sticky top-8 h-fit space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Actions SuperAdmin</h3>
          
          <div className="space-y-4">
            <Textarea
              placeholder={t("missionsToSubmit.validation.comment_placeholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            {/* Boutons d'action */}
            <Button
              className="w-full justify-start bg-green-500 hover:bg-green-600"
              onClick={() => handleValidationAction("approved")}
              disabled={validateMission.isExecuting || mission.validationStatus === "approved"}
            >
              {validateMission.isExecuting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("missionsToSubmit.validation.action_approve")}
            </Button>

            <Button
              className="w-full justify-start bg-yellow-500 hover:bg-yellow-600"
              onClick={() => handleValidationAction("modification_requested")}
              disabled={validateMission.isExecuting || mission.validationStatus === "modification_needed"}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t("missionsToSubmit.validation.action_modify")}
            </Button>
            
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => handleValidationAction("rejected")}
              disabled={validateMission.isExecuting || mission.validationStatus === "rejected"}
            >
              <X className="w-4 h-4 mr-2" />
              {t("missionsToSubmit.validation.action_reject")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}