import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Met à jour le rôle d'un membre
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id, memberId } = params;
    const body = await req.json();
    const { role } = body;
    
    if (!id || !memberId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization ID and Member ID are required" 
        },
        { status: 400 }
      );
    }
    
    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Role is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si le membre existe
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
    });
    
    if (!existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Member not found" 
        },
        { status: 404 }
      );
    }
    
    // Vérifier que le membre appartient bien à cette organisation
    if (existingMember.organizationId !== id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Member does not belong to this organization" 
        },
        { status: 400 }
      );
    }
    
    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { role },
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
    
    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update member",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Supprime un membre d'une organisation
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { id, memberId } = params;
    
    if (!id || !memberId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization ID and Member ID are required" 
        },
        { status: 400 }
      );
    }
    
    // Vérifier si le membre existe
    const existingMember = await prisma.member.findUnique({
      where: { id: memberId },
    });
    
    if (!existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Member not found" 
        },
        { status: 404 }
      );
    }
    
    // Vérifier que le membre appartient bien à cette organisation
    if (existingMember.organizationId !== id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Member does not belong to this organization" 
        },
        { status: 400 }
      );
    }
    
    // Vérifier qu'il reste au moins un owner
    if (existingMember.role === "owner") {
      const ownerCount = await prisma.member.count({
        where: {
          organizationId: id,
          role: "owner",
        },
      });
      
      if (ownerCount <= 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Cannot remove the last owner of the organization" 
          },
          { status: 400 }
        );
      }
    }
    
    // Supprimer le membre
    await prisma.member.delete({
      where: { id: memberId },
    });
    
    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to remove member",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
