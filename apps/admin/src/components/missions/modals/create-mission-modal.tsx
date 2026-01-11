"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tada/ui/components/dialog";

import {
  Plus,
  Loader2,
  List,
  Users,
  Layers,
  Bot,
  TableOfContents,
} from "lucide-react";
import { useI18n } from "@/locales/client";

interface CreateSurveyModalProps {
  trigger?: React.ReactNode;
  orgId?: string;
}

export function CreateSurveyModal({ trigger }: CreateSurveyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const router = useRouter();
  const t = useI18n();

  const surveyOptions = [
    {
      id: "ai",
      title: t("missions.createSurveyModal.ai.title"),
      icon: <Bot className="h-8 w-8 text-white" />,
      iconBg: "bg-blue-500",
      iconHoverBg: "hover:bg-blue-600",
      hoverBg: "hover:bg-blue-50",
      themeColor: "text-blue-600",
      features: [
        {
          icon: <List className="h-4 w-4" />,
          text: t("missions.createSurveyModal.ai.feature1"),
        },
        {
          icon: <Users className="h-4 w-4" />,
          text: t("missions.createSurveyModal.ai.feature2"),
        },
      ],
      description: t("missions.createSurveyModal.ai.description"),
      onClick: () => router.push(`/missions/create?mode=ai`),
    },
    {
      id: "template",
      title: t("missions.createSurveyModal.template.title"),
      icon: <Layers className="h-8 w-8 text-white" />,
      iconBg: "bg-orange-500",
      iconHoverBg: "hover:bg-orange-600",
      hoverBg: "hover:bg-orange-100",
      themeColor: "text-orange-600",
      features: [
        {
          icon: <List className="h-4 w-4" />,
          text: t("missions.createSurveyModal.template.feature1"),
        },
        {
          icon: <Users className="h-4 w-4" />,
          text: t("missions.createSurveyModal.template.feature2"),
        },
      ],
      description: t("missions.createSurveyModal.template.description"),
      onClick: () => router.push(`/missions/create?mode=template`),
    },
    {
      id: "manuel",
      title: t("missions.createSurveyModal.manuel.title"),
      icon: <TableOfContents className="h-8 w-8 text-white" />,
      iconBg: "bg-gray-500",
      iconHoverBg: "hover:bg-gray-600",
      hoverBg: "hover:bg-gray-50",
      themeColor: "text-gray-600",
      features: [
        {
          icon: <List className="h-4 w-4" />,
          text: t("missions.createSurveyModal.manuel.feature1"),
        },
        {
          icon: <Users className="h-4 w-4" />,
          text: t("missions.createSurveyModal.manuel.feature2"),
        },
      ],
      description: t("missions.createSurveyModal.manuel.description"),
      onClick: () => router.push(`/missions/create?mode=manual`),
    },
    {
      id: "contributor-info",
      title: t("missions.createSurveyModal.contributorInfo.title"),
      icon: <Users className="h-8 w-8 text-white" />,
      iconBg: "bg-green-500",
      iconHoverBg: "hover:bg-green-600",
      hoverBg: "hover:bg-green-50",
      themeColor: "text-green-600",
      features: [
        {
          icon: <Users className="h-4 w-4" />,
          text: t("missions.createSurveyModal.contributorInfo.feature1"),
        },
        {
          icon: <List className="h-4 w-4" />,
          text: t("missions.createSurveyModal.contributorInfo.feature2"),
        },
      ],
      description: t("missions.createSurveyModal.contributorInfo.description"),
      onClick: () => router.push(`/missions/create?mode=contributor-info`),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>{t("missions.createSurveyModal.title")}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">
                  {t("missions.createSurveyModal.loading")}
                </p>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {surveyOptions.map((option, index) => (
                <div key={option.id}>
                  <div
                    onMouseEnter={() =>
                      !isLoading && setHoveredOption(option.id)
                    }
                    onMouseLeave={() => !isLoading && setHoveredOption(null)}
                    className={`
                      relative border group border-gray-200 rounded-lg p-6 transition-all duration-200
                      ${
                        isLoading
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }
                      ${
                        hoveredOption === option.id && !isLoading
                          ? `border-gray-300 ${option.hoverBg.replace(
                              "hover:",
                              ""
                            )}`
                          : `bg-white ${!isLoading ? option.hoverBg : ""} ${
                              !isLoading ? "hover:shadow-sm" : ""
                            }`
                      }
                    `}
                    onClick={option.onClick}
                  >
                    <div className="flex justify-center mb-6">
                      <div
                        className={`
                          w-16 h-16 rounded-lg flex items-center justify-center transition-colors duration-200
                          ${option.iconBg}
                          ${
                            hoveredOption === option.id && !isLoading
                              ? option.iconHoverBg
                              : ""
                          }
                        `}
                      >
                        {option.icon}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">
                      {option.title}
                    </h3>

                    <div className="space-y-3 flex flex-col items-center mb-6">
                      {option.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex bg-gray-100 rounded-full group-hover:bg-white group-hover:rounded-full p-1 px-2 items-center space-x-3"
                        >
                          <div
                            className={
                              hoveredOption === option.id && !isLoading
                                ? option.themeColor
                                : "text-gray-500"
                            }
                          >
                            {feature.icon}
                          </div>
                          <span
                            className={`text-xs ${
                              hoveredOption === option.id && !isLoading
                                ? option.themeColor
                                : "text-gray-600"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {index < surveyOptions.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent transform -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
