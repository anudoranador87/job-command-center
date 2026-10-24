import { RemotiveConnector } from "./remotive-connector";
import { JobSourceConnector, NormalizedJob } from "./types";
import { prisma } from "@/lib/prisma";

const remotive = new RemotiveConnector();

export const jobConnectors: Record<string, JobSourceConnector> = {
  REMOTIVE: remotive,
};

export async function syncJobsFromConnector(
  sourceName: string,
  options?: { search?: string; limit?: number }
): Promise<{ added: number; updated: number; totalFetched: number }> {
  const connector = jobConnectors[sourceName.toUpperCase()];
  if (!connector) {
    throw new Error(`Conector desconocido: ${sourceName}`);
  }

  const jobs = await connector.search(options);
  let added = 0;
  let updated = 0;

  for (const job of jobs) {
    const existing = await prisma.job.findUnique({
      where: {
        source_externalId: {
          source: job.source,
          externalId: job.externalId,
        },
      },
    });

    if (existing) {
      await prisma.job.update({
        where: { id: existing.id },
        data: {
          title: job.title,
          company: job.company,
          location: job.location,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          requirements: job.requirements as any,
          url: job.url,
        },
      });
      updated++;
    } else {
      await prisma.job.create({
        data: {
          externalId: job.externalId,
          source: job.source,
          title: job.title,
          company: job.company,
          location: job.location,
          remoteType: job.remoteType,
          jobType: job.jobType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          description: job.description,
          requirements: job.requirements as any,
          url: job.url,
        },
      });
      added++;
    }
  }

  return { added, updated, totalFetched: jobs.length };
}
