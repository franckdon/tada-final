import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const organizationId = searchParams.get("organizationId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const contributorId = searchParams.get("contributorId");
    const export_format = searchParams.get("export");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (contributorId) {
      where.assignments = {
        some: {
          contributorId: contributorId,
        },
      };
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        missionAssignments: {
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        surveys: {
          include: {
            response: {
              where: {
                status: "completed",
              },
              select: {
                id: true,
                status: true,
                createdAt: true,
                userId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (export_format === "csv") {
      const csv = generateCSV(missions);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="missions-audit-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const stats = {
      total: missions.length,
      byStatus: missions.reduce((acc: any, m) => {
        const status = m.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byOrganization: missions.reduce((acc: any, m) => {
        if (m.organization) {
          acc[m.organization.name] = (acc[m.organization.name] || 0) + 1;
        }
        return acc;
      }, {}),
      totalAssignments: missions.reduce((sum, m) => sum + (m.missionAssignments?.length || 0), 0),
      totalCompletedResponses: missions.reduce(
        (sum, m) => sum + (m.surveys?.reduce((s, survey) => s + (survey.response?.length || 0), 0) || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: missions,
      stats,
      filters: {
        status,
        organizationId,
        dateFrom,
        dateTo,
        contributorId,
      },
    });
  } catch (error) {
    console.error("Error fetching mission audit:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch mission audit",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateCSV(missions: any[]): string {
  const headers = [
    "ID",
    "Nom",
    "Organisation",
    "Statut",
    "Date création",
    "Contributeurs assignés",
    "Réponses complétées",
  ];

  const rows = missions.map((mission) => [
    mission.id,
    mission.name || "",
    mission.organization?.name || "N/A",
    mission.status || "",
    new Date(mission.createdAt).toLocaleDateString(),
    mission.missionAssignments?.length || 0,
    mission.surveys?.reduce((sum, survey) => sum + (survey.response?.length || 0), 0) || 0,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}
