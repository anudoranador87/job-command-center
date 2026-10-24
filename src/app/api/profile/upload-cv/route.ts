import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromBuffer } from "@/lib/document-parser";
import { extractStructuredProfileFromText } from "@/lib/ai-extractor";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo." }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type || "application/octet-stream";
    const size = file.size;

    // Buffer from file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file to uploads/documents
    const uploadDir = path.join(process.cwd(), "uploads", "documents");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    // Extract text from document
    let parsedText = "";
    try {
      parsedText = await extractTextFromBuffer(buffer, mimeType, filename);
    } catch (parseError: unknown) {
      console.error("Text extraction failed:", parseError);
      return NextResponse.json(
        { error: parseError instanceof Error ? parseError.message : "Error al procesar el archivo" },
        { status: 422 }
      );
    }

    // Save document record in DB
    const documentRecord = await prisma.document.create({
      data: {
        userId,
        filename: safeName,
        originalName: filename,
        mimeType,
        size,
        path: filePath,
        parsedText: parsedText.slice(0, 50000),
      },
    });

    // Extract structured data using AI / heuristics
    const extractedData = await extractStructuredProfileFromText(parsedText);

    // Upsert Profile in DB
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });

    const nextVersion = (existingProfile?.versions[0]?.version || 0) + 1;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        headline: extractedData.headline,
        summary: extractedData.summary,
        targetRole: extractedData.targetRole,
        location: extractedData.location,
        phone: extractedData.phone || undefined,
        website: extractedData.website || undefined,
        linkedinUrl: extractedData.linkedinUrl || undefined,
        githubUrl: extractedData.githubUrl || undefined,
        skills: extractedData.skills as any,
        experience: extractedData.experience as any,
        education: extractedData.education as any,
        languages: extractedData.languages as any,
        certifications: extractedData.certifications as any,
        rawExtracted: extractedData as any,
      },
      create: {
        userId,
        headline: extractedData.headline,
        summary: extractedData.summary,
        targetRole: extractedData.targetRole,
        location: extractedData.location,
        phone: extractedData.phone || undefined,
        website: extractedData.website || undefined,
        linkedinUrl: extractedData.linkedinUrl || undefined,
        githubUrl: extractedData.githubUrl || undefined,
        skills: extractedData.skills as any,
        experience: extractedData.experience as any,
        education: extractedData.education as any,
        languages: extractedData.languages as any,
        certifications: extractedData.certifications as any,
        rawExtracted: extractedData as any,
      },
    });

    // Create snapshot in ProfileVersion
    await prisma.profileVersion.create({
      data: {
        profileId: updatedProfile.id,
        version: nextVersion,
        data: extractedData as any,
        changeLog: `Extracción automática desde CV: ${filename}`,
      },
    });

    return NextResponse.json({
      success: true,
      documentId: documentRecord.id,
      profile: updatedProfile,
      message: `CV "${filename}" procesado con éxito y perfil actualizado a la versión ${nextVersion}.`,
    });
  } catch (error) {
    console.error("Error in upload-cv route:", error);
    return NextResponse.json(
      { error: "Error en el servidor al procesar el currículum." },
      { status: 500 }
    );
  }
}
