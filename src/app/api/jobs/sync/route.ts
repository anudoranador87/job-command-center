import { NextResponse } from "next/server";
import { syncJobsFromConnector } from "@/lib/job-connectors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const source = body.source || "REMOTIVE";
    const search = body.search || undefined;
    const limit = body.limit || 30;

    const result = await syncJobsFromConnector(source, { search, limit });

    return NextResponse.json({
      success: true,
      message: `Sincronización completada desde ${source}.`,
      result,
    });
  } catch (error: any) {
    console.error("Error in jobs sync:", error);
    return NextResponse.json(
      { error: error.message || "Error al sincronizar ofertas externas" },
      { status: 500 }
    );
  }
}
