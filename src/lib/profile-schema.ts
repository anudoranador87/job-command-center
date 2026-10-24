import { z } from "zod";

export const skillItemSchema = z.object({
  name: z.string().min(1, "Nombre de la habilidad requerido"),
  category: z.string().default("General"),
  level: z.enum(["Principiante", "Intermedio", "Avanzado", "Experto"]).default("Avanzado"),
});

export const experienceItemSchema = z.object({
  company: z.string().min(1, "Empresa requerida"),
  role: z.string().min(1, "Cargo o rol requerido"),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
});

export const educationItemSchema = z.object({
  institution: z.string().min(1, "Institución requerida"),
  degree: z.string().min(1, "Titulación requerida"),
  field: z.string().default(""),
  startYear: z.string().default(""),
  endYear: z.string().default(""),
});

export const languageItemSchema = z.object({
  language: z.string().min(1, "Idioma requerido"),
  proficiency: z.string().default("Intermedio"),
});

export const certificationItemSchema = z.object({
  name: z.string().min(1, "Nombre de la certificación"),
  issuer: z.string().default(""),
  year: z.string().default(""),
});

export const structuredProfileSchema = z.object({
  headline: z.string().default(""),
  summary: z.string().default(""),
  targetRole: z.string().default(""),
  location: z.string().default(""),
  phone: z.string().default(""),
  website: z.string().default(""),
  linkedinUrl: z.string().default(""),
  githubUrl: z.string().default(""),
  skills: z.array(skillItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  languages: z.array(languageItemSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
});

export type StructuredProfile = z.infer<typeof structuredProfileSchema>;
