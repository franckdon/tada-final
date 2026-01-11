import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreateUser } from "@/lib/validations/user";

/**
 * GET /api/users
 * Récupère la liste de tous les utilisateurs avec pagination et filtres
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Paramètres de pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Paramètres de filtrage
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const banned = searchParams.get("banned");
    const kyc_status = searchParams.get("kyc_status");
    
    // Construction du filtre
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (banned !== null && banned !== undefined) {
      where.banned = banned === "true";
    }
    
    if (kyc_status) {
      where.kyc_status = kyc_status;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    
    // Récupération des utilisateurs avec pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          adminSubRole: true,
          position: true,
          country: true,
          sector: true,
          image: true,
          kyc_status: true,
          job: true,
          location: true,
          banned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              members: true,
              missionAssignments: true,
              surveyResponses: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch users",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Crée un nouveau compte utilisateur
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ajout important : on laisse image passer dans validation
    const validation = validateCreateUser(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Vérification email
    const existingUser = await prisma.user.findUnique({
      where: { email: validation.data!.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // Création (⚠️ image = URL envoyée depuis le front)
    const user = await prisma.user.create({
      data: {
        ...validation.data!,
        image: validation.data!.image ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminSubRole: true,
        position: true,
        country: true,
        sector: true,
        image: true,
        kyc_status: true,
        job: true,
        location: true,
        banned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
