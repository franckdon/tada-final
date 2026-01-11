import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreateOrganization } from "@/lib/validations/organization";

/**
 * GET /api/organizations
 * Récupère la liste de toutes les organisations avec pagination et filtres
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Paramètres de filtrage
    const search = searchParams.get("search");
    const sector = searchParams.get("sector");
    const status = searchParams.get("status");
    
    // Construction du filtre
    const where: any = {};
    
    if (sector) {
      where.sector = sector;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    
    // Récupération des organisations avec pagination
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          metadata: true,
          status: true,
          country: true,
          sector: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              members: true,
              missions: true,
              projects: true,
            },
          },
        },
      }),
      prisma.organization.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch organizations",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Crée une nouvelle organisation avec un propriétaire (User + Member)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Données reçues par l'API:", JSON.stringify(body, null, 2));
    
    // Validation des données
    const validation = validateCreateOrganization(body);
    console.log("Résultat de la validation:", validation);
    
    if (!validation.valid) {
      console.error("Erreurs de validation:", validation.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }
    
    const { organization: orgData, owner: ownerData } = validation.data!;
    
    // Vérifier si le slug existe déjà
    const existingOrg = await prisma.organization.findFirst({
      where: { slug: orgData.slug },
    });
    
    if (existingOrg) {
      return NextResponse.json(
        { 
          success: false, 
          error: "An organization with this slug already exists" 
        },
        { status: 409 }
      );
    }
    
    // Vérifier si l'email du propriétaire existe déjà
    let owner = await prisma.user.findUnique({
      where: { email: ownerData.email },
    });
    
    // Transaction pour créer l'organisation, le propriétaire et le lien
    const result = await prisma.$transaction(async (tx) => {
      // Créer ou récupérer l'utilisateur propriétaire
      if (!owner) {
        owner = await tx.user.create({
          data: {
            email: ownerData.email,
            name: ownerData.name,
            role: "client_admin",
            position: ownerData.position || null,
            country: orgData.country || null,
          },
        });
      }
      
      // Créer l'organisation
      const organization = await tx.organization.create({
        data: orgData,
      });
      
      // Créer le lien Member (propriétaire de l'organisation)
      await tx.member.create({
        data: {
          userId: owner.id,
          organizationId: organization.id,
          role: "owner",
        },
      });
      
      return { organization, owner };
    });
    
    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "Organization created successfully with owner",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create organization",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
