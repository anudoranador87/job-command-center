import { JobSourceConnector, JobSearchOptions, NormalizedJob } from "./types";

export class RemotiveConnector implements JobSourceConnector {
  sourceName = "REMOTIVE";
  displayName = "Remotive (Ofertas 100% Remotas)";

  async search(options?: JobSearchOptions): Promise<NormalizedJob[]> {
    const limit = options?.limit || 25;
    const searchParam = options?.search ? `&search=${encodeURIComponent(options.search)}` : "";
    const categoryParam = options?.category ? `&category=${encodeURIComponent(options.category)}` : "";

    const url = `https://remotive.com/api/remote-jobs?limit=${limit}${searchParam}${categoryParam}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "JobCommandCenter/1.0",
        },
        // Cache for 10 minutes to respect rate limits
        next: { revalidate: 600 },
      });

      if (!response.ok) {
        throw new Error(`Remotive API respondió con código: ${response.status}`);
      }

      const data = await response.json();
      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];

      return rawJobs.map((item: any): NormalizedJob => {
        // Strip HTML tags for clean text summary
        const cleanDescription = (item.description || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // Extract salary numbers if present
        let salaryMin: number | undefined;
        let salaryMax: number | undefined;
        if (item.salary && typeof item.salary === "string") {
          const numbers = item.salary.match(/\d[\d,.]*/g);
          if (numbers && numbers.length > 0) {
            const parsedNumbers = numbers
              .map((n: string) => parseFloat(n.replace(/,/g, "")))
              .filter((n: number) => !isNaN(n) && n > 1000);
            if (parsedNumbers.length === 1) salaryMin = parsedNumbers[0];
            if (parsedNumbers.length >= 2) {
              salaryMin = Math.min(parsedNumbers[0], parsedNumbers[1]);
              salaryMax = Math.max(parsedNumbers[0], parsedNumbers[1]);
            }
          }
        }

        return {
          externalId: String(item.id),
          source: "REMOTIVE",
          title: item.title || "Sin título",
          company: item.company_name || "Confidencial",
          location: item.candidate_required_location || "Cualquier lugar (Remoto)",
          remoteType: "REMOTE",
          jobType: item.job_type === "full_time" ? "FULL_TIME" : item.job_type || "FULL_TIME",
          salaryMin,
          salaryMax,
          currency: "USD",
          description: cleanDescription,
          requirements: Array.isArray(item.tags) ? item.tags : [],
          url: item.url,
          publishedAt: item.publication_date,
        };
      });
    } catch (error) {
      console.error("Error fetching jobs from Remotive:", error);
      throw error;
    }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch("https://remotive.com/api/remote-jobs?limit=1");
      if (response.ok) {
        return { ok: true, message: "Conexión exitosa con Remotive API pública." };
      }
      return { ok: false, message: `Error en Remotive API: código ${response.status}` };
    } catch (e: any) {
      return { ok: false, message: `No se pudo conectar a Remotive: ${e.message}` };
    }
  }
}
