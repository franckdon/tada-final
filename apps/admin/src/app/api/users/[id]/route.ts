import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUpdateUser } from "@/lib/validations/user";

/**
 * GET /api/users/[id]
 * Récupère les détails d'un utilisateur spécifique
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
          error: "User ID is required" 
        },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
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
        members: {
          select: {
            id: true,
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            createdAt: true,
          },
        },
        missionAssignments: {
          select: {
            id: true,
            status: true,
            progress: true,
            mission: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            assignedAt: true,
          },
          orderBy: { assignedAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            missionAssignments: true,
            surveyResponses: true,
            subDashboard: true,
            contributorData: true,
          },
        },
      },
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
    
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch user",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Met à jour les informations d'un utilisateur (y compris le rôle)
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const validation = validateUpdateUser(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // Si email changé → vérifier doublon
    if (validation.data!.email && validation.data!.email !== existingUser.email) {
      const mailExists = await prisma.user.findUnique({
        where: { email: validation.data!.email },
      });

      if (mailExists) {
        return NextResponse.json(
          { success: false, error: "This email is already in use" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...validation.data!,
        image: validation.data!.image ?? existingUser.image, // ⚡ ici
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

    return NextResponse.json({
      success: true,
      data: updated,
      message: "User updated successfully",
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Supprime un compte utilisateur
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérification si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            missionAssignments: true,
            surveyResponses: true,
            subDashboard: true,
            contributorData: true,
            validationComments: true,
          },
        },
      },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found" 
        },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur a des données associées
    const hasRelatedData = 
      existingUser._count.members > 0 ||
      existingUser._count.missionAssignments > 0 ||
      existingUser._count.surveyResponses > 0 ||
      existingUser._count.subDashboard > 0 ||
      existingUser._count.contributorData > 0 ||
      existingUser._count.validationComments > 0;
    
    if (hasRelatedData) {
      // Au lieu de supprimer, on peut bannir l'utilisateur
      const bannedUser = await prisma.user.update({
        where: { id },
        data: { banned: true },
        select: {
          id: true,
          email: true,
          name: true,
          banned: true,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: bannedUser,
        message: "User has related data and has been banned instead of deleted",
        warning: "User has been banned instead of deleted due to existing relationships",
      });
    }
    
    // Suppression de l'utilisateur s'il n'a pas de données associées
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete user",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
