import { z } from "zod";

export const compatibilityReportSchema = z.object({
  score: z.number().min(0).max(100),
  fitLevel: z.enum(["EXCELENTE", "BUENO", "MODERADO", "BAJO"]),
  summary: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type CompatibilityReport = z.infer<typeof compatibilityReportSchema>;

export async function analyzeCompatibility(
  profile: any,
  job: any
): Promise<CompatibilityReport> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.startsWith("sk-placeholder")) {
    try {
      const { generateObject } = await import("ai");
      const { createOpenAI } = await import("@ai-sdk/openai");

      const openai = createOpenAI({ apiKey });
      const model = openai(process.env.OPENAI_MODEL || "gpt-4o");

      const prompt = `Actúa como un experto director de RRHH técnico y ATS (Applicant Tracking System).
Evalúa de forma objetiva la compatibilidad entre este candidato y la oferta de empleo.

--- PERFIL DEL CANDIDATO ---
Titular: ${profile.headline || "No especificado"}
Extracto: ${profile.summary || "No especificado"}
Habilidades: ${JSON.stringify(profile.skills || [])}
Experiencia: ${JSON.stringify(profile.experience || [])}
Educación: ${JSON.stringify(profile.education || [])}

--- OFERTA DE EMPLEO ---
Puesto: ${job.title}
Empresa: ${job.company}
Ubicación/Modalidad: ${job.location || ""} (${job.remoteType || ""})
Requisitos/Etiquetas: ${JSON.stringify(job.requirements || [])}
Descripción: ${job.description.slice(0, 4000)}

--- INSTRUCCIONES ---
1. Asigna un score de 0 a 100 realista.
2. Identifica habilidades clave que el candidato sí posee.
3. Identifica requisitos o tecnologías que la oferta exige y el candidato no tiene o no menciona.
4. Proporciona recomendaciones tácticas para adaptar la candidatura o superar la entrevista.`;

      const result = await generateObject({
        model,
        schema: compatibilityReportSchema,
        prompt,
      });

      if (result.object) {
        return result.object;
      }
    } catch (error) {
      console.warn("AI compatibility call failed, using heuristic engine:", error);
    }
  }

  // Heuristic / Algorithmic fallback
  return analyzeCompatibilityHeuristic(profile, job);
}

function analyzeCompatibilityHeuristic(profile: any, job: any): CompatibilityReport {
  const userSkills: string[] = [];
  if (Array.isArray(profile.skills)) {
    profile.skills.forEach((s: any) => {
      if (typeof s === "string") userSkills.push(s.toLowerCase());
      else if (s?.name) userSkills.push(s.name.toLowerCase());
    });
  }

  const jobTags: string[] = [];
  if (Array.isArray(job.requirements)) {
    job.requirements.forEach((r: any) => {
      if (typeof r === "string") jobTags.push(r.toLowerCase());
    });
  }

  // Search skills mentioned in job description
  const jobText = `${job.title} ${job.description} ${jobTags.join(" ")}`.toLowerCase();

  const matching: string[] = [];
  const missing: string[] = [];

  // Check which user skills match the job
  userSkills.forEach((skill) => {
    if (jobText.includes(skill)) {
      matching.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  // Check which job tags are missing from user profile
  jobTags.forEach((tag) => {
    const isPresent = userSkills.some((s) => s.includes(tag) || tag.includes(s));
    if (!isPresent) {
      missing.push(tag.charAt(0).toUpperCase() + tag.slice(1));
    }
  });

  // Calculate score
  let score = 50; // baseline
  if (jobTags.length > 0) {
    const matchRatio = (matching.length) / Math.max(jobTags.length, 1);
    score = Math.min(Math.round(40 + matchRatio * 55), 98);
  } else {
    score = Math.min(50 + matching.length * 10, 92);
  }

  // Boost if title matches
  if (profile.headline && job.title) {
    const titleWords = job.title.toLowerCase().split(" ").filter((w: string) => w.length > 3);
    const hasWord = titleWords.some((w: string) => profile.headline.toLowerCase().includes(w));
    if (hasWord) score = Math.min(score + 10, 99);
  }

  let fitLevel: "EXCELENTE" | "BUENO" | "MODERADO" | "BAJO" = "MODERADO";
  if (score >= 80) fitLevel = "EXCELENTE";
  else if (score >= 65) fitLevel = "BUENO";
  else if (score >= 45) fitLevel = "MODERADO";
  else fitLevel = "BAJO";

  return {
    score,
    fitLevel,
    summary: `Tu perfil presenta una afinidad del ${score}% con este puesto de ${job.title} en ${job.company}. Tienes un sólido encaje en tecnologías como ${matching.slice(0, 3).join(", ") || "desarrollo general"}.`,
    matchingSkills: matching.slice(0, 10),
    missingSkills: missing.slice(0, 6),
    strengths: [
      `Experiencia alineada con los requisitos de ${job.company}`,
      matching.length > 0 ? `Dominio demostrado en ${matching.slice(0, 3).join(", ")}` : "Perfil técnico adaptable",
      job.remoteType === "REMOTE" ? "Disponibilidad y encaje con trabajo remoto" : "Alineación geográfica",
    ],
    recommendations: [
      missing.length > 0
        ? `Destaca en tu carta de presentación cualquier proyecto o conocimiento sobre: ${missing.slice(0, 3).join(", ")}.`
        : "Tu perfil técnico cubre los requisitos prioritarios de la vacante.",
      "Adapta el resumen de tu CV enfatizando tus logros medibles más recientes.",
      "Prepara ejemplos concretos de resolución de problemas para la primera entrevista técnica.",
    ],
  };
}
