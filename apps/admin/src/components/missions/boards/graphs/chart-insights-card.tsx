"use client";

import { Card, CardContent } from "@tada/ui/components/card";
import { Badge } from "@tada/ui/components/badge";
import { cn } from "@tada/ui/lib/utils";
import {
  Lightbulb,
  TrendingUp,
  GitCompare,
  AlertTriangle,
  ArrowRightCircle,
} from "lucide-react";

export type ChartInsight = {
  type: "key_finding" | "trend" | "comparison" | "anomaly" | "recommendation";
  priority: "high" | "medium" | "low";
  headline: string;
  summary: string;
  implication: string;
  action?: string;
  confidence: number;
  keyStat?: string;
  supportingMetrics?: string[];
};

function getInsightMeta(type: ChartInsight["type"]) {
  switch (type) {
    case "key_finding":
      return {
        label: "Key finding",
        icon: Lightbulb,
      };
    case "trend":
      return {
        label: "Trend",
        icon: TrendingUp,
      };
    case "comparison":
      return {
        label: "Comparison",
        icon: GitCompare,
      };
    case "anomaly":
      return {
        label: "Anomaly",
        icon: AlertTriangle,
      };
    case "recommendation":
      return {
        label: "Recommendation",
        icon: ArrowRightCircle,
      };
    default:
      return {
        label: "Insight",
        icon: Lightbulb,
      };
  }
}

function getPriorityClasses(priority: ChartInsight["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getConfidenceClasses(confidence: number) {
  if (confidence >= 85) return "text-emerald-600";
  if (confidence >= 70) return "text-amber-600";
  return "text-slate-500";
}

export function ChartInsightsCard({
  insights,
  locale = "fr",
}: {
  insights?: ChartInsight[] | null;
  locale?: string;
}) {
  if (!insights || insights.length === 0) return null;

  const labels = {
    fr: {
      sectionTitle: "Insights",
      whatItMeans: "Ce que cela signifie",
      recommendedAction: "Action recommandée",
      confidence: "Confiance",
      keyMetric: "Chiffre clé",
    },
    en: {
      sectionTitle: "Insights",
      whatItMeans: "What this means",
      recommendedAction: "Recommended action",
      confidence: "Confidence",
      keyMetric: "Key metric",
    },
  };

  const l = locale.startsWith("fr") ? labels.fr : labels.en;

  return (
    <div className="space-y-4">
      <div className="pt-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          {l.sectionTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight, index) => {
          const meta = getInsightMeta(insight.type);
          const Icon = meta.icon;

          return (
            <Card
              key={`${insight.type}-${index}-${insight.headline}`}
              className="border-slate-200 shadow-sm bg-white"
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <Icon className="h-4 w-4 text-slate-700" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{meta.label}</Badge>
                        <Badge
                          variant="outline"
                          className={cn(getPriorityClasses(insight.priority))}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">{l.confidence}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          getConfidenceClasses(insight.confidence),
                        )}
                      >
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                      {insight.headline}
                    </h3>

                    {insight.keyStat ? (
                      <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                        {l.keyMetric}: {insight.keyStat}
                      </div>
                    ) : null}

                    <p className="text-base leading-7 text-slate-700">
                      {insight.summary}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      {l.whatItMeans}
                    </p>
                    <p className="text-sm leading-6 text-slate-700">
                      {insight.implication}
                    </p>
                  </div>

                  {insight.action ? (
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">
                        {l.recommendedAction}
                      </p>
                      <p className="text-sm leading-6 text-emerald-900">
                        {insight.action}
                      </p>
                    </div>
                  ) : null}

                  {insight.supportingMetrics?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {insight.supportingMetrics.map((metric, idx) => (
                        <span
                          key={`${metric}-${idx}`}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
