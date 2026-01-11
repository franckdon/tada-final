import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les attributs d'audience
export async function GET() {
  try {
    const attributes = await prisma.audienceAttribute.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("Error fetching audience attributes:", error);
    return NextResponse.json(
      { error: "Failed to fetch audience attributes" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel attribut d'audience
export async function POST(req: Request) {
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
    } = body;

    // Validation des champs requis
    if (!name || !key || !type || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, key, type, category" },
        { status: 400 }
      );
    }

    // Vérifier si la clé existe déjà
    const existingAttribute = await prisma.audienceAttribute.findUnique({
      where: { key },
    });

    if (existingAttribute) {
      return NextResponse.json(
        { error: "An attribute with this key already exists" },
        { status: 409 }
      );
    }

    // Convertir les options en JSON string si c'est un tableau
    const optionsString = Array.isArray(options)
      ? JSON.stringify(options)
      : options;

    // Créer l'attribut
    const attribute = await prisma.audienceAttribute.create({
      data: {
        name,
        key,
        type,
        category,
        description: description || null,
        required: required || false,
        enrichmentOnly: enrichmentOnly || false,
        options: optionsString || null,
        active: true,
      },
    });

    return NextResponse.json(attribute, { status: 201 });
  } catch (error) {
    console.error("Error creating audience attribute:", error);
    return NextResponse.json(
      { error: "Failed to create audience attribute" },
      { status: 500 }
    );
  }
}
