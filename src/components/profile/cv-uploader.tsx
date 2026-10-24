"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface CvUploaderProps {
  onUploadSuccess: (updatedProfile: any) => void;
}

export function CvUploader({ onUploadSuccess }: CvUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/profile/upload-cv", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ocurrió un error al procesar el currículum.");
        }

        setSuccessMsg(data.message || `CV "${file.name}" analizado con éxito.`);
        if (data.profile) {
          onUploadSuccess(data.profile);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error inesperado al subir el documento.");
        }
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
          isDragActive
            ? "border-primary bg-primary/10"
            : uploading
            ? "opacity-60 cursor-not-allowed border-border bg-card"
            : "border-border hover:border-primary/50 hover:bg-secondary/40 bg-card"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <>
              <Loader2 className="h-9 w-9 text-primary animate-spin" />
              <p className="text-sm font-semibold">Analizando y extrayendo datos con IA...</p>
              <p className="text-xs text-muted-foreground">
                Procesando secciones, tecnologías y trayectoria laboral.
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-secondary rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isDragActive ? "Suelta tu CV aquí" : "Arrastra tu CV o haz clic para seleccionarlo"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Formatos compatibles: PDF o Word (.docx) hasta 10 MB
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-full mt-2">
                <Upload className="h-3.5 w-3.5" /> Seleccionar archivo
              </span>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
