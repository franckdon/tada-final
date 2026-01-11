"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, AlertTriangle, BarChart3, Lightbulb, Target } from "lucide-react";

interface Insight {
  type: "key_finding" | "trend" | "comparison" | "anomaly" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  value?: string;
}

interface InsightsSectionProps {
  insights: Insight[] | null;
  insightsUpdatedAt?: Date | string | null;
  questionTitle: string;
  missionStatus?: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case "key_finding":
      return <Target className="h-4 w-4" />;
    case "trend":
      return <TrendingUp className="h-4 w-4" />;
    case "comparison":
      return <BarChart3 className="h-4 w-4" />;
    case "anomaly":
      return <AlertTriangle className="h-4 w-4" />;
    case "recommendation":
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case "key_finding":
      return "text-blue-600 bg-blue-50";
    case "trend":
      return "text-green-600 bg-green-50";
    case "comparison":
      return "text-purple-600 bg-purple-50";
    case "anomaly":
      return "text-orange-600 bg-orange-50";
    case "recommendation":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

const getInsightTypeLabel = (type: string) => {
  switch (type) {
    case "key_finding":
      return "Découverte clé";
    case "trend":
      return "Tendance";
    case "comparison":
      return "Comparaison";
    case "anomaly":
      return "Anomalie";
    case "recommendation":
      return "Recommandation";
    default:
      return "Insight";
  }
};

export function InsightsSection({ 
  insights, 
  insightsUpdatedAt, 
  questionTitle,
  missionStatus 
}: InsightsSectionProps) {
  // Ne pas afficher si la mission n'est pas completed
  if (missionStatus !== "completed") {
    return null;
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Insights automatiques
        </h3>
        {insightsUpdatedAt && (
          <span className="text-xs text-gray-500">
            Mis à jour le {format(new Date(insightsUpdatedAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {getInsightTypeLabel(insight.type)}
                  </span>
                  {insight.value && (
                    <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                      {insight.value}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {insight.confidence}% de confiance
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-1">
                  {insight.title}
                </h4>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}