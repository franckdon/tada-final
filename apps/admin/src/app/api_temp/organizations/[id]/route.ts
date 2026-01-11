import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUpdateOrganization } from "@/lib/validations/organization";

/**
 * GET /api/organizations/[id]
 * Récupère les détails d'une organisation spécifique
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
    
    const organization = await prisma.organization.findUnique({
      where: { id },
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
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                image: true,
              },
            },
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        missions: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            members: true,
            missions: true,
            projects: true,
            datasets: true,
          },
        },
      },
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
    
    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch organization",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Met à jour les informations d'une organisation
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérification si l'organisation existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });
    
    if (!existingOrg) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization not found" 
        },
        { status: 404 }
      );
    }
    
    // Validation des données
    const validation = validateUpdateOrganization(body);
    
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
    
    // Vérifier si le slug n'est pas déjà utilisé par une autre organisation
    if (validation.data!.slug && validation.data!.slug !== existingOrg.slug) {
      const slugExists = await prisma.organization.findFirst({
        where: { 
          slug: validation.data!.slug,
          id: { not: id }
        },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: "This slug is already in use" 
          },
          { status: 409 }
        );
      }
    }
    
    // Mise à jour de l'organisation
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: validation.data!,
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
      },
    });
    
    return NextResponse.json({
      success: true,
      data: updatedOrg,
      message: "Organization updated successfully",
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update organization",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Supprime une organisation
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
          error: "Organization ID is required" 
        },
        { status: 400 }
      );
    }
    
    // Vérification si l'organisation existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            missions: true,
            projects: true,
            datasets: true,
          },
        },
      },
    });
    
    if (!existingOrg) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Organization not found" 
        },
        { status: 404 }
      );
    }
    
    // Vérifier si l'organisation a des données associées
    const hasRelatedData = 
      existingOrg._count.missions > 0 ||
      existingOrg._count.projects > 0 ||
      existingOrg._count.datasets > 0;
    
    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete organization with related data. It has ${existingOrg._count.missions} missions, ${existingOrg._count.projects} projects, and ${existingOrg._count.datasets} datasets. Please remove or archive these first.`
        },
        { status: 409 }
      );
    }
    
    // Suppression de l'organisation et de ses membres dans une transaction
    await prisma.$transaction(async (tx) => {
      // Supprimer d'abord les membres
      await tx.member.deleteMany({
        where: { organizationId: id },
      });
      
      // Puis supprimer l'organisation
      await tx.organization.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete organization",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
