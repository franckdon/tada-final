// lib/getSurveyTableData.ts
import { prisma } from "@/lib/prisma";

export async function getMissionSubmissionData() {
  const data = await prisma.surveyResponse.findMany({
    select: {
      id: true,
      age: true,
      gender: true,
      location: true,
      createdAt: true,
      responses: true,
    },
  });

  const questionSet = new Set<string>();
  data.forEach((d) => {
    Object.keys(d.responses).forEach((q) => questionSet.add(q));
  });

  const dynamicQuestions = Array.from(questionSet);

  const rows = data.map((row) => {
    const responseData: Record<string, string> = {};

    for (const question of dynamicQuestions) {
      const response = row.responses?.[question];
      if (!response) {
        responseData[question] = "";
      } else if (Array.isArray(response.answer)) {
        responseData[question] = response.answer.join(", ");
      } else {
        responseData[question] = String(response.answer);
      }
    }

    return {
      id: row.id,
      age: row.age,
      gender: row.gender,
      location: row.location?.label ?? "",
      createdAt: row.createdAt.toISOString(),
      ...responseData,
    };
  });

  return {
    rows,
    columns: dynamicQuestions,
  };
}
