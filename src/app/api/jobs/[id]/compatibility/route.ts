import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCompatibility } from "@/lib/compatibility-engine";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { id: jobId } = await params;

    const [job, profile] = await Promise.all([
      prisma.job.findUnique({ where: { id: jobId } }),
      userId ? prisma.profile.findUnique({ where: { userId } }) : null,
    ]);

    if (!job) {
      return NextResponse.json({ error: "Oferta no encontrada." }, { status: 404 });
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Debes configurar tu Perfil Maestro o subir un CV antes de calcular la compatibilidad." },
        { status: 400 }
      );
    }

    const report = await analyzeCompatibility(profile, job);

    // Save score in job record
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        compatibilityScore: report.score,
        compatibilityData: report as any,
      },
    });

    return NextResponse.json({
      success: true,
      report,
      job: updatedJob,
    });
  } catch (error: any) {
    console.error("Error in compatibility analysis:", error);
    return NextResponse.json(
      { error: error.message || "Error al analizar compatibilidad" },
      { status: 500 }
    );
  }
}
