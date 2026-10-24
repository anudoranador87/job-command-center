import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 5,
        },
      },
    });

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ profile, documents });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });

    const nextVersion = (existingProfile?.versions[0]?.version || 0) + 1;

    const updated = await prisma.profile.upsert({
      where: { userId },
      update: {
        headline: data.headline,
        summary: data.summary,
        targetRole: data.targetRole,
        location: data.location,
        phone: data.phone,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        languages: data.languages,
        certifications: data.certifications,
      },
      create: {
        userId,
        headline: data.headline,
        summary: data.summary,
        targetRole: data.targetRole,
        location: data.location,
        phone: data.phone,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        languages: data.languages,
        certifications: data.certifications,
      },
    });

    // Save profile version snapshot
    await prisma.profileVersion.create({
      data: {
        profileId: updated.id,
        version: nextVersion,
        data: data as any,
        changeLog: "Actualización manual desde el editor de perfil",
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error al guardar perfil" }, { status: 500 });
  }
}
