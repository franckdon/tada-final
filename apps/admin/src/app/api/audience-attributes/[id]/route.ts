import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer un attribut spécifique
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attribute = await prisma.audienceAttribute.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    if (!attribute) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(attribute);
  } catch (error) {
    console.error("Error fetching audience attribute:", error);
    return NextResponse.json(
      { error: "Failed to fetch audience attribute" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un attribut
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      name,
      key,
      type,
      category,
      description,
      required,
      enrichmentOnly,
      options,
      active,
    } = body;

    // Vérifier si l'attribut existe
    const existingAttribute = await prisma.audienceAttribute.findUnique({
      where: { id: params.id },
    });

    if (!existingAttribute) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    // Si la clé change, vérifier qu'elle n'existe pas déjà
    if (key && key !== existingAttribute.key) {
      const keyExists = await prisma.audienceAttribute.findUnique({
        where: { key },
      });

      if (keyExists) {
        return NextResponse.json(
          { error: "An attribute with this key already exists" },
          { status: 409 }
        );
      }
    }

    // Convertir les options en JSON string si c'est un tableau
    const optionsString = Array.isArray(options)
      ? JSON.stringify(options)
      : options;

    // Mettre à jour l'attribut
    const attribute = await prisma.audienceAttribute.update({
      where: { id: params.id },
      data: {
        name: name || existingAttribute.name,
        key: key || existingAttribute.key,
        type: type || existingAttribute.type,
        category: category || existingAttribute.category,
        description: description !== undefined ? description : existingAttribute.description,
        required: required !== undefined ? required : existingAttribute.required,
        enrichmentOnly: enrichmentOnly !== undefined ? enrichmentOnly : existingAttribute.enrichmentOnly,
        options: optionsString !== undefined ? optionsString : existingAttribute.options,
        active: active !== undefined ? active : existingAttribute.active,
      },
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.error("Error updating audience attribute:", error);
    return NextResponse.json(
      { error: "Failed to update audience attribute" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un attribut
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si l'attribut existe
    const existingAttribute = await prisma.audienceAttribute.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    if (!existingAttribute) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    // Avertir si l'attribut a des valeurs associées
    if (existingAttribute._count.values > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete attribute with ${existingAttribute._count.values} associated values. Please remove values first or deactivate the attribute instead.`,
        },
        { status: 409 }
      );
    }

    // Supprimer l'attribut
    await prisma.audienceAttribute.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("Error deleting audience attribute:", error);
    return NextResponse.json(
      { error: "Failed to delete audience attribute" },
      { status: 500 }
    );
  }
}
