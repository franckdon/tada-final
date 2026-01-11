import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
// import { assertWorkspaceMemberOrOwner } from "@/lib/workspaces"; // si tu as un helper du genre

const DATASET_UPLOAD_DIR =
  process.env.AI_DATASET_UPLOAD_DIR || "public/uploads/ai-datasets";

// Petit helper pour sérialiser AiDataset (notamment BigInt fileSize)
function serializeAiDataset(dataset: any) {
  return {
    ...dataset,
    fileSize: dataset.fileSize !== null && dataset.fileSize !== undefined
      ? Number(dataset.fileSize)
      : null,
  };
}

// Petit helper pour deviner le type de fichier
function guessFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "csv":
      return "csv";
    case "tsv":
      return "tsv";
    case "xlsx":
    case "xls":
      return "xlsx";
    case "pdf":
      return "pdf";
    case "doc":
    case "docx":
      return "docx";
    case "json":
      return "json";
    default:
      return ext || "unknown";
  }
}

// Inférer le type JS d’une valeur
function inferJsType(value: any): string {
  if (value === null || value === undefined || value === "") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  const n = Number(value);
  if (!Number.isNaN(n) && value !== "") return "number";
  return "string";
}

function inferRole(type: string): "metric" | "dimension" {
  return type === "number" ? "metric" : "dimension";
}

// GET /api/ai/datasets
// ?workspaceId=xxx (optionnel)
// ?organizationId=xxx (optionnel)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const organizationId = searchParams.get("organizationId");

    // Filtrage basique : on ne renvoie que les datasets appartenant à l'utilisateur
    // (et éventuellement filtrés par workspace/org)
    const where: any = {
      ownerId: user.id,
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // const datasets = await prisma.aiDataset.findMany({
    //   where,
    //   orderBy: { createdAt: "desc" },
    // });
    const datasets = await prisma.aiDataset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json(datasets.map(serializeAiDataset), { status: 200 });
    
  } catch (error) {
    console.error("[AI_DATASETS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// POST /api/ai/datasets
// multipart/form-data
//  - file: File (obligatoire)
//  - name: string (optionnel, sinon on prend le nom du fichier)
//  - description: string (optionnel)
//  - workspaceId: string (recommandé)
//  - organizationId: string (optionnel)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Le contenu doit être de type multipart/form-data" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni (champ 'file' manquant)" },
        { status: 400 },
      );
    }

    const workspaceId = (formData.get("workspaceId") as string) || null;
    const organizationId = (formData.get("organizationId") as string) || null;
    const description = ((formData.get("description") as string) || "").trim();

    let name =
      ((formData.get("name") as string) || "").trim() ||
      file.name.replace(/\.[^.]+$/, "");

    // Préparation dossier upload
    const uploadDir = path.isAbsolute(DATASET_UPLOAD_DIR)
      ? DATASET_UPLOAD_DIR
      : path.join(process.cwd(), DATASET_UPLOAD_DIR);

    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "dat";
    const randomName = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, randomName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sauvegarde du fichier
    await fs.writeFile(filePath, buffer);

    const fileType = guessFileType(file.name);
    const fileSize = BigInt(file.size);

    const storagePath = path
      .join(DATASET_UPLOAD_DIR, randomName)
      .replace(/\\/g, "/");

    // =========  NOUVEAU : DETECTION SCHEMA + SAMPLE  =========
    let rowCount: number | null = null;
    let columnCount: number | null = null;
    let detectedSchema: any = null;
    let sampleData: any = null;

    if (fileType === "csv" || fileType === "tsv") {
      const text = buffer.toString("utf-8");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const delimiter = fileType === "tsv" ? "\t" : ",";
        const headers = lines[0].split(delimiter).map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const cols = line.split(delimiter);
          const row: Record<string, any> = {};
          headers.forEach((h, idx) => {
            const raw = (cols[idx] ?? "").trim();
            if (raw === "") {
              row[h] = null;
            } else if (!Number.isNaN(Number(raw))) {
              row[h] = Number(raw);
            } else {
              row[h] = raw;
            }
          });
          return row;
        });

        rowCount = rows.length;
        columnCount = headers.length;
        sampleData = rows.slice(0, 50);

        detectedSchema = {
          columns: headers.map((h) => {
            const nonNull = rows
              .map((r) => r[h])
              .find((v) => v !== null && v !== "" && v !== undefined);
            const jsType = inferJsType(nonNull);
            return {
              name: h,
              type: jsType,
              role: inferRole(jsType),
            };
          }),
        };
      }
    } else if (fileType === "json") {
      try {
        const json = JSON.parse(buffer.toString("utf-8"));
        const rows = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : [];

        if (rows.length > 0 && typeof rows[0] === "object") {
          const keys = Object.keys(rows[0]);
          rowCount = rows.length;
          columnCount = keys.length;
          sampleData = rows.slice(0, 50);

          detectedSchema = {
            columns: keys.map((k) => {
              const nonNull = rows
                .map((r: any) => r[k])
                .find((v: any) => v !== null && v !== "" && v !== undefined);
              const jsType = inferJsType(nonNull);
              return {
                name: k,
                type: jsType,
                role: inferRole(jsType),
              };
            }),
          };
        }
      } catch (e) {
        console.warn("[AI_DATASET_JSON_PARSE_WARNING]", e);
      }
    }

    const dataset = await prisma.aiDataset.create({
      data: {
        name,
        description: description || null,
        organizationId: organizationId || null,
        workspaceId: workspaceId || null,
        ownerId: user.id,
        sourceType: "upload",
        originalFilename: file.name,
        fileType,
        fileSize,
        storagePath,
        status: "uploaded",
        errorMessage: null,
        rowCount,
        columnCount,
        detectedSchema,
        sampleData,
      },
    });

    // sérialisation safe des BigInt
    const safe = JSON.parse(
      JSON.stringify(dataset, (_, value) =>
        typeof value === "bigint" ? Number(value) : value,
      ),
    );

    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error("[AI_DATASETS_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}