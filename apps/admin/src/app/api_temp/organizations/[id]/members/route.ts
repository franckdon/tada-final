import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/organizations/[id]/members
 * Récupère la liste des membres d'une organisation
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id },
    });
    
    if (!organization) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization not found" 
        },
        { status: 404 }
      );
    }
    
    // Récupérer les membres
    const members = await prisma.member.findMany({
      where: { organizationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    
    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch members",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[id]/members
 * Ajoute un membre à une organisation
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { userId, email, name, role, position } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id },
    });
    
    if (!organization) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization not found" 
        },
        { status: 404 }
      );
    }
    
    // Validation
    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Member role is required" 
        },
        { status: 400 }
      );
    }
    
    let user;
    
    // Si userId est fourni, vérifier que l'utilisateur existe
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: "User not found" 
          },
          { status: 404 }
        );
      }
      
      // Vérifier si l'utilisateur est déjà membre
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: userId,
          organizationId: id,
        },
      });
      
      if (existingMember) {
        return NextResponse.json(
          { 
            success: false, 
            error: "User is already a member of this organization" 
          },
          { status: 409 }
        );
      }
    } else {
      // Créer un nouvel utilisateur
      if (!email || !name) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Email and name are required to create a new user" 
          },
          { status: 400 }
        );
      }
      
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { 
            success: false, 
            error: "A user with this email already exists. Please use the existing user." 
          },
          { status: 409 }
        );
      }
      
      // Créer le nouvel utilisateur
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          role: "client",
          position: position || null,
        },
      });
    }
    
    // Créer le membre
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: id,
        role: role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            image: true,
            role: true,
          },
        },
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        data: member,
        message: "Member added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to add member",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
