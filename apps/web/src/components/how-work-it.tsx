"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Users,
  Shield,
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  Download,
  Smartphone,
  Globe,
  Brain,
  Eye,
} from "lucide-react";
import React from "react";
import { useI18n } from "@/locales/client";

interface Step {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
}

export function HowWorkIt() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const t = useI18n();

  const steps: Step[] = [
    {
      id: 1,
      number: "01",
      title: t("how_work_it.steps.step_1.title"),
      subtitle: t("how_work_it.steps.step_1.subtitle"),
      description: t("how_work_it.steps.step_1.description"),
      icon: <Settings className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: [
        t("how_work_it.steps.step_1.features.feature_1"),
        t("how_work_it.steps.step_1.features.feature_2"),
        t("how_work_it.steps.step_1.features.feature_3"),
        t("how_work_it.steps.step_1.features.feature_4"),
      ],
    },
    {
      id: 2,
      number: "02",
      title: t("how_work_it.steps.step_2.title"),
      subtitle: t("how_work_it.steps.step_2.subtitle"),
      description: t("how_work_it.steps.step_2.description"),
      icon: <Users className="w-8 h-8" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      features: [
        t("how_work_it.steps.step_2.features.feature_1"),
        t("how_work_it.steps.step_2.features.feature_2"),
        t("how_work_it.steps.step_2.features.feature_3"),
        t("how_work_it.steps.step_2.features.feature_4"),
      ],
    },
    {
      id: 3,
      number: "03",
      title: t("how_work_it.steps.step_3.title"),
      subtitle: t("how_work_it.steps.step_3.subtitle"),
      description: t("how_work_it.steps.step_3.description"),
      icon: <Shield className="w-8 h-8" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      features: [
        t("how_work_it.steps.step_3.features.feature_1"),
        t("how_work_it.steps.step_3.features.feature_2"),
        t("how_work_it.steps.step_3.features.feature_3"),
        t("how_work_it.steps.step_3.features.feature_4"),
      ],
    },
    {
      id: 4,
      number: "04",
      title: t("how_work_it.steps.step_4.title"),
      subtitle: t("how_work_it.steps.step_4.subtitle"),
      description: t("how_work_it.steps.step_4.description"),
      icon: <BarChart3 className="w-8 h-8" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      features: [
        t("how_work_it.steps.step_4.features.feature_1"),
        t("how_work_it.steps.step_4.features.feature_2"),
        t("how_work_it.steps.step_4.features.feature_3"),
        t("how_work_it.steps.step_4.features.feature_4"),
      ],
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="container-custom">
      <div className="mb-20">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 transition-all duration-500 delay-${
                index * 100
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? `${step.bgColor} border-current ${step.color} shadow-lg scale-105`
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Step Number */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    activeStep === index
                      ? `${step.color} bg-white`
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span className="font-bold text-lg">{step.number}</span>
                </div>

                {/* Icon */}
                <div
                  className={`mb-4 ${
                    activeStep === index ? step.color : "text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-bold mb-2 ${
                    activeStep === index ? step.color : "text-gray-900"
                  }`}
                >
                  {step.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.subtitle}
                </p>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Detailed Step View */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Side - Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div
              className={`transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              {/* Step Badge */}
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 ${steps[activeStep]?.bgColor} ${steps[activeStep]?.color}`}
              >
                <span className="mr-2">{steps[activeStep]?.number}</span>
                {steps[activeStep]?.title}
              </div>

              {/* Title */}
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {steps[activeStep]?.subtitle}
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {steps[activeStep]?.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {steps[activeStep]?.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle
                      className={`w-5 h-5 mr-3 ${steps[activeStep]?.color}`}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div
            className={`${steps[activeStep]?.bgColor} p-8 lg:p-12 flex items-center justify-center relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-current"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-current"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-current"></div>
            </div>

            {/* Step-specific Visual Content */}
            <div
              className={`relative z-10 text-center ${steps[activeStep]?.color}`}
            >
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                  {React.cloneElement(
                    steps[activeStep]?.icon as React.ReactElement,
                    { className: `w-12 h-12 ${steps[activeStep]?.color}` }
                  )}
                </div>
              </div>

              {/* Step-specific icons */}
              <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto">
                {activeStep === 0 && (
                  <>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Brain className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.ai_powered")}
                      </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Clock className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.twenty_minutes")}
                      </span>
                    </div>
                  </>
                )}
                {activeStep === 1 && (
                  <>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Globe className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.global_network")}
                      </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Smartphone className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.mobile_app")}
                      </span>
                    </div>
                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Eye className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.ai_detection")}
                      </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.verified_data")}
                      </span>
                    </div>
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <BarChart3 className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.dashboard")}
                      </span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center">
                      <Download className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">
                        {t("how_work_it.features.export")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      ;
    </div>
  );
}
