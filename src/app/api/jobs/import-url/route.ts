import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCompatibility } from "@/lib/compatibility-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { url, rawText } = body;

    if (!url && !rawText) {
      return NextResponse.json(
        { error: "Proporciona una URL de la oferta o pega el texto de la vacante." },
        { status: 400 }
      );
    }

    let fetchedText = rawText || "";

    // If URL is provided and no raw text, try fetching webpage content
    if (url && !rawText) {
      try {
        const resp = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (resp.ok) {
          const html = await resp.text();
          // Strip scripts and styles
          fetchedText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .slice(0, 10000);
        }
      } catch (e) {
        console.warn("Could not fetch URL directly (CORS/Anti-scraping), using URL metadata fallback:", e);
      }
    }

    // Heuristic extraction of title and company from text or URL
    let title = "Oferta de Empleo Importada";
    let company = "Empresa Externa";

    if (url) {
      const parsedUrl = new URL(url);
      company = parsedUrl.hostname.replace("www.", "").split(".")[0];
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }

    // Find likely title line
    const textLines = (fetchedText || rawText || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
    if (textLines.length > 0 && textLines[0].length < 80) {
      title = textLines[0];
    }

    const description = fetchedText || rawText || `Oferta importada desde: ${url}`;
    const externalId = `url-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Common skill keywords
    const detectedTags: string[] = [];
    const keywords = ["React", "TypeScript", "JavaScript", "Python", "Node.js", "Java", "Docker", "AWS", "SQL", "Tailwind", "Next.js", "PostgreSQL"];
    keywords.forEach((k) => {
      if (new RegExp(`\\b${k}\\b`, "i").test(description)) {
        detectedTags.push(k);
      }
    });

    const isRemote = /remoto|remote|teletrabajo/i.test(description) ? "REMOTE" : "HYBRID";

    const job = await prisma.job.create({
      data: {
        userId: session?.user?.id || null,
        source: url ? "URL_IMPORT" : "TEXT_IMPORT",
        externalId,
        title,
        company,
        location: isRemote === "REMOTE" ? "Remoto" : "España",
        remoteType: isRemote,
        description: description.slice(0, 12000),
        requirements: detectedTags as any,
        url: url || undefined,
      },
    });

    // Auto-calculate compatibility if user has a profile
    let compatibility = null;
    if (session?.user?.id) {
      const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
      if (profile) {
        compatibility = await analyzeCompatibility(profile, job);
        await prisma.job.update({
          where: { id: job.id },
          data: {
            compatibilityScore: compatibility.score,
            compatibilityData: compatibility as any,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      job,
      compatibility,
      message: `Oferta "${title}" importada con éxito.`,
    });
  } catch (error: any) {
    console.error("Error importing job:", error);
    return NextResponse.json({ error: error.message || "Error al importar la oferta" }, { status: 500 });
  }
}
