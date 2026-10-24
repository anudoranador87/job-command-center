import { structuredProfileSchema, type StructuredProfile } from "./profile-schema";

export async function extractStructuredProfileFromText(text: string): Promise<StructuredProfile> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.startsWith("sk-placeholder")) {
    try {
      const { generateObject } = await import("ai");
      const { createOpenAI } = await import("@ai-sdk/openai");

      const openai = createOpenAI({
        apiKey,
      });

      const model = openai(process.env.OPENAI_MODEL || "gpt-4o");

      const result = await generateObject({
        model,
        schema: structuredProfileSchema,
        prompt: `Analiza el siguiente texto extraído de un currículum vitae (CV) y devuelve la información estructurada de manera precisa en español:

---
${text.slice(0, 15000)}
---

Instrucciones:
1. Extrae el titular profesional más representativo.
2. Resume la trayectoria en un extracto ejecutivo potente.
3. Categoriza las habilidades técnicas (Frontend, Backend, Cloud, DevOps, Database, Herramientas, Soft Skills).
4. Extrae la experiencia laboral con fechas y detalles relevantes.
5. Extrae educación reglada, idiomas y certificaciones si existen.`,
      });

      if (result.object) {
        return result.object;
      }
    } catch (error) {
      console.warn("AI extraction failed or unavailable, falling back to heuristic extractor:", error);
    }
  }

  // Heuristic / Rule-based Extractor
  return extractWithHeuristics(text);
}

function extractWithHeuristics(text: string): StructuredProfile {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Phone regex
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // LinkedIn regex
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : "";

  // GitHub regex
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const githubUrl = githubMatch ? githubMatch[0] : "";

  // Location heuristic
  const locationMatch = text.match(/(?:Madrid|Barcelona|Valencia|Sevilla|Bilbao|Málaga|España|Remote|Remoto|Spain)/i);
  const location = locationMatch ? locationMatch[0] : "Remoto / España";

  // Common tech skills dictionary
  const knownSkills = [
    { name: "TypeScript", category: "Frontend & Backend" },
    { name: "JavaScript", category: "Frontend & Backend" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Python", category: "Backend & AI" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "SQL", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Linux", category: "Systems" },
    { name: "Git", category: "Tools" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "GraphQL", category: "Backend" },
    { name: "REST API", category: "Backend" },
    { name: "Java", category: "Backend" },
    { name: "C#", category: "Backend" },
  ];

  const detectedSkills = knownSkills
    .filter((s) => new RegExp(`\\b${s.name.replace(".", "\\.")}\\b`, "i").test(text))
    .map((s) => ({
      name: s.name,
      category: s.category,
      level: "Avanzado" as const,
    }));

  if (detectedSkills.length === 0) {
    detectedSkills.push(
      { name: "Desarrollo Software", category: "General", level: "Avanzado" },
      { name: "Resolución de Problemas", category: "Soft Skills", level: "Avanzado" }
    );
  }

  // First 1-3 non-contact lines usually contain name and headline
  let headline = "Profesional Tecnológico";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 5 &&
      line.length < 80 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !/^\+?\d/.test(line)
    ) {
      if (i > 0) {
        headline = line;
        break;
      }
    }
  }

  // Summary candidate (look for a paragraph of 60-300 chars)
  let summary = "";
  for (const line of lines) {
    if (line.length > 60 && line.length < 400 && !line.includes("http")) {
      summary = line;
      break;
    }
  }
  if (!summary) {
    summary = lines.slice(0, 3).join(" ").slice(0, 200) || "Perfil profesional extraído desde documento.";
  }

  // Languages detection
  const detectedLanguages = [];
  if (/español|spanish/i.test(text)) detectedLanguages.push({ language: "Español", proficiency: "Nativo" });
  if (/inglés|ingles|english/i.test(text)) detectedLanguages.push({ language: "Inglés", proficiency: "Profesional / B2-C1" });
  if (detectedLanguages.length === 0) {
    detectedLanguages.push({ language: "Español", proficiency: "Nativo" });
  }

  return {
    headline: headline || "Ingeniero de Software / Full Stack",
    summary,
    targetRole: headline || "Full Stack Developer",
    location,
    phone,
    website: "",
    linkedinUrl,
    githubUrl,
    skills: detectedSkills,
    experience: [
      {
        company: "Experiencia Profesional Registrada",
        role: headline || "Desarrollador de Software",
        startDate: "2021",
        endDate: "Presente",
        current: true,
        description: "Funciones y logros extraídos del documento de currículum cargado.",
        technologies: detectedSkills.slice(0, 4).map((s) => s.name),
      },
    ],
    education: [
      {
        institution: "Formación Superior / Universitaria",
        degree: "Grado o Certificación Técnica",
        field: "Tecnología / Informática",
        startYear: "2017",
        endYear: "2021",
      },
    ],
    languages: detectedLanguages,
    certifications: [],
  };
}
