import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const remote = searchParams.get("remote") || "";
    const source = searchParams.get("source") || "";

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { company: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (remote && remote !== "ALL") {
      where.remoteType = remote;
    }

    if (source && source !== "ALL") {
      where.source = source;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ error: "Error al obtener ofertas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      title,
      company,
      location,
      remoteType = "REMOTE",
      jobType = "FULL_TIME",
      salaryMin,
      salaryMax,
      currency = "EUR",
      description,
      requirements = [],
      url,
    } = body;

    if (!title || !company || !description) {
      return NextResponse.json(
        { error: "Título, empresa y descripción son obligatorios." },
        { status: 400 }
      );
    }

    const externalId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const job = await prisma.job.create({
      data: {
        userId: session?.user?.id || null,
        source: "MANUAL",
        externalId,
        title,
        company,
        location: location || "Remoto",
        remoteType,
        jobType,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        currency,
        description,
        requirements: Array.isArray(requirements)
          ? requirements
          : typeof requirements === "string"
          ? requirements.split(",").map((s) => s.trim())
          : [],
        url,
      },
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Error al guardar la oferta" }, { status: 500 });
  }
}
