"use client";

import React, { useState } from "react";
import { CvUploader } from "./cv-uploader";
import { ProfileEditor } from "./profile-editor";
import { Sparkles, FileText } from "lucide-react";

interface CvUploaderWrapperProps {
  initialProfile: any;
  initialDocuments: any[];
}

export function CvUploaderWrapper({ initialProfile, initialDocuments }: CvUploaderWrapperProps) {
  const [profile, setProfile] = useState<any>(initialProfile);
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [editorKey, setEditorKey] = useState(0);

  const handleUploadSuccess = (newProfile: any) => {
    setProfile(newProfile);
    // Refresh editor with updated profile
    setEditorKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Upload Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Extracción Inteligente de CV</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sube tu currículum en formato PDF o Word. El sistema identificará tus roles previos, tecnologías clave y nivel de experiencia para construir tu CV maestro inmutable.
          </p>
          <div className="pt-2">
            <CvUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        <div className="md:col-span-2">
          <ProfileEditor
            key={editorKey}
            initialProfile={profile}
            initialDocuments={documents}
          />
        </div>
      </div>
    </div>
  );
}
