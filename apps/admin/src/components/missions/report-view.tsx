"use client";
import { Button } from "@tada/ui/components/button";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapboxMap } from "./mapbox-review";
import { MonthlySurveyCount, TSurvey } from "@/types/survey-response";
import { MapLocation } from "@/types/survey-response";
import { SurveyMiniDashboard } from "./survey-mini-dashboard";
import { SurveyResponse } from "@prisma/client";
import { useI18n } from "@/locales/client";
import { SubDashboard } from "@/types/sub-dashboard";

const mockData = {
  totalCount: 2946707,
  percentChange: -6,
  timeRange: "Last 30 days with submissions",
  totalApprovedCount: 64531015,
  chartData: [
    { date: "01", count: 100000 },
    { date: "03", count: 75000 },
    { date: "06", count: 70000 },
    { date: "09", count: 90000 },
    { date: "12", count: 65000 },
    { date: "15", count: 70000 },
    { date: "18", count: 65000 },
    { date: "21", count: 75000 },
    { date: "24", count: 65000 },
    { date: "27", count: 60000 },
    { date: "30", count: 65000 },
  ],
};

const monthLabels: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

function getTotalCount(data: { count: number }[]): number {
  return data.reduce((total, item) => total + item.count, 0);
}

export function ReportView({
  barChartData,
  locations,
  surveys,
  surveyResponses,
  columns,
  subDashboards,
}: {
  barChartData: MonthlySurveyCount[];
  locations: MapLocation[];
  surveys: TSurvey[];
  surveyResponses: SurveyResponse[];
  columns: string[];

  subDashboards: SubDashboard[];
}) {
  const t = useI18n();
  const totalCount = getTotalCount(barChartData);

  const formattedData = barChartData.map((item) => ({
    ...item,
    label: monthLabels[item.month],
  }));

  // Function to format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="w-full bg-white dark:bg-gray-700  p-4">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="bg-white dark:bg-gray-700 border p-6 w-full md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className=" font-medium">
              {t("missions.navigation.submissions")}
            </h2>
          </div>

          <div className="flex items-baseline mb-6">
            <h1 className="text-3xl font-bold mr-3">
              {formatNumber(totalCount)}
            </h1>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                />
                <YAxis hide={false} />
                <Tooltip
                  formatter={(value) => [`${value} réponses`, "Réponses"]}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 border p-6 w-full md:w-1/2">
          <MapboxMap
            columns={columns}
            surveys={surveyResponses}
            accessToken="pk.eyJ1Ijoia29rb3Vhc2VyZ2U4OSIsImEiOiJja2x0aThqNTgyNmp4MnFuMWNucnUxdDJhIn0.qv3knVmVo7Y_Nn6PtYNn_w" // Remplacez par votre token Mapbox
            height="400px"
            initialViewState={{
              longitude: locations[0]?.coordinates?.[0] || 60,
              latitude: locations[0]?.coordinates?.[1] || 20,
              zoom: 8,
            }}
          />
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-700 border p-6">
        <SurveyMiniDashboard surveys={surveys} subDashboards={subDashboards} />
      </div>
    </div>
  );
}
