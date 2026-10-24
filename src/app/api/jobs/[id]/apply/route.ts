import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesión para postularte." }, { status: 401 });
    }

    const { id: jobId } = await params;
    const userId = session.user.id;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Oferta no encontrada." }, { status: 404 });
    }

    // Check if user already applied
    const existing = await prisma.application.findFirst({
      where: {
        userId,
        jobId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes esta oferta registrada en tus candidaturas (Kanban)." },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: "WISHLIST",
        portalUrl: job.url || null,
        notesSummary: `Oferta importada desde ${job.source}.`,
        events: {
          create: {
            type: "STATUS_CHANGE",
            description: "Candidatura añadida a Deseadas (Wishlist)",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `¡"${job.title}" añadida a tu tablero Kanban!`,
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Error al registrar la candidatura." }, { status: 500 });
  }
}
