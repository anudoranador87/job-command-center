"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  FileCheck,
  History,
  FileText,
} from "lucide-react";

interface ProfileEditorProps {
  initialProfile: any;
  initialDocuments: any[];
}

export function ProfileEditor({ initialProfile, initialDocuments }: ProfileEditorProps) {
  const [profile, setProfile] = useState<any>(initialProfile || {});
  const [documents, setDocuments] = useState<any[]>(initialDocuments || []);
  const [activeTab, setActiveTab] = useState<"general" | "skills" | "experience" | "education" | "documents">("general");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item draft states
  const [newSkill, setNewSkill] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Frontend");

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const updated = [...currentSkills, { name: newSkill.trim(), category: newSkillCategory, level: "Avanzado" }];
    setProfile({ ...profile, skills: updated });
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    const currentSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const updated = currentSkills.filter((_: unknown, i: number) => i !== index);
    setProfile({ ...profile, skills: updated });
  };

  const addExperience = () => {
    const currentExp = Array.isArray(profile.experience) ? profile.experience : [];
    const updated = [
      ...currentExp,
      {
        company: "Nueva Empresa",
        role: "Desarrollador Software",
        startDate: "2023",
        endDate: "Presente",
        current: true,
        description: "Responsabilidades y logros alcanzados...",
        technologies: [],
      },
    ];
    setProfile({ ...profile, experience: updated });
  };

  const updateExperience = (index: number, field: string, val: any) => {
    const currentExp = Array.isArray(profile.experience) ? [...profile.experience] : [];
    if (currentExp[index]) {
      currentExp[index] = { ...currentExp[index], [field]: val };
      setProfile({ ...profile, experience: currentExp });
    }
  };

  const removeExperience = (index: number) => {
    const currentExp = Array.isArray(profile.experience) ? profile.experience : [];
    setProfile({ ...profile, experience: currentExp.filter((_: unknown, i: number) => i !== index) });
  };

  const addEducation = () => {
    const currentEdu = Array.isArray(profile.education) ? profile.education : [];
    const updated = [
      ...currentEdu,
      {
        institution: "Universidad o Instituto",
        degree: "Grado / Máster",
        field: "Ingeniería Informática",
        startYear: "2018",
        endYear: "2022",
      },
    ];
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    const currentEdu = Array.isArray(profile.education) ? profile.education : [];
    setProfile({ ...profile, education: currentEdu.filter((_: unknown, i: number) => i !== index) });
  };

  const skillsList = Array.isArray(profile.skills) ? profile.skills : [];
  const experienceList = Array.isArray(profile.experience) ? profile.experience : [];
  const educationList = Array.isArray(profile.education) ? profile.education : [];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Top action bar */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-secondary/20">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-500" />
          <div>
            <h2 className="text-sm font-bold">Perfil Maestro & CV Estructurado</h2>
            <p className="text-[11px] text-muted-foreground">
              Fuente de verdad para la generación y adaptación de currículums
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "general"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" /> Información General
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "skills"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="h-4 w-4" /> Habilidades ({skillsList.length})
        </button>

        <button
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "experience"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Experiencia ({experienceList.length})
        </button>

        <button
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "education"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Educación & Idiomas
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "documents"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> Documentos Originales ({documents.length})
        </button>
      </div>

      {/* Tab contents */}
      <div className="p-6">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Titular Profesional</label>
                <input
                  type="text"
                  value={profile.headline || ""}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="Ej. Senior Full Stack Engineer"
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Rol Objetivo</label>
                <input
                  type="text"
                  value={profile.targetRole || ""}
                  onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                  placeholder="Ej. Tech Lead / Full Stack"
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Extracto Ejecutivo / Resumen</label>
              <textarea
                rows={4}
                value={profile.summary || ""}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                placeholder="Breve presentación de tus fortalezas técnicas y trayectoria..."
                className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ubicación</label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Teléfono</label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.linkedinUrl || ""}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  placeholder="linkedin.com/in/usuario"
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
                <input
                  type="text"
                  value={profile.githubUrl || ""}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  placeholder="github.com/usuario"
                  className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Añadir habilidad (ej. Docker, Python, Next.js)..."
                className="flex-1 p-2 bg-secondary border border-border rounded-md text-sm"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="p-2 bg-secondary border border-border rounded-md text-sm"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps & Cloud</option>
                <option value="Herramientas">Herramientas</option>
                <option value="Soft Skills">Soft Skills</option>
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Añadir
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium border border-border group"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                      {skill.category || "General"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Historial de Experiencia Profesional</h3>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-xs font-semibold rounded-md border border-border"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir Puesto
              </button>
            </div>

            <div className="space-y-4">
              {experienceList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
                  No hay puestos de trabajo registrados. Sube tu CV o añade un puesto manualmente.
                </p>
              ) : (
                experienceList.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 bg-secondary/30 border border-border rounded-lg space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                      title="Eliminar experiencia"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Cargo / Rol</label>
                        <input
                          type="text"
                          value={exp.role || ""}
                          onChange={(e) => updateExperience(idx, "role", e.target.value)}
                          className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Empresa</label>
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => updateExperience(idx, "company", e.target.value)}
                          className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Fecha Inicio</label>
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                          placeholder="2021"
                          className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Fecha Fin</label>
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                          placeholder="Presente"
                          className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Descripción y Logros</label>
                      <textarea
                        rows={3}
                        value={exp.description || ""}
                        onChange={(e) => updateExperience(idx, "description", e.target.value)}
                        className="mt-1 w-full p-2 bg-secondary border border-border rounded text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* EDUCATION & LANGUAGES TAB */}
        {activeTab === "education" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Educación y Titulaciones</h3>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-xs font-semibold rounded-md border border-border"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir Titulación
              </button>
            </div>

            <div className="space-y-3">
              {educationList.map((edu: any, idx: number) => (
                <div key={idx} className="p-3 bg-secondary/30 border border-border rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold">{edu.degree} · {edu.field}</h4>
                    <p className="text-[11px] text-muted-foreground">{edu.institution} ({edu.startYear} - {edu.endYear})</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-sm font-semibold">Historial de CVs Importados</h3>
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
                No hay documentos guardados aún.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg bg-card">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold">{doc.originalName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {(doc.size / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                      Procesado
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
