import mammoth from "mammoth";

export async function extractTextFromBuffer(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const isPdf = mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
  const isDocx =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.toLowerCase().endsWith(".docx");

  if (isPdf) {
    try {
      // Dynamic import to avoid edge runtime issues if invoked in different contexts
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (error) {
      console.error("Error parsing PDF:", error);
      throw new Error("No se pudo extraer texto del archivo PDF.");
    }
  }

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      throw new Error("No se pudo extraer texto del archivo Word (DOCX).");
    }
  }

  // Fallback for plain text
  if (mimeType.startsWith("text/") || filename.toLowerCase().endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error("Formato de archivo no compatible. Por favor sube un archivo PDF o DOCX.");
}
