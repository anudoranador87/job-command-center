import { prisma } from "@/lib/prisma";
import { JobsManager } from "@/components/jobs/jobs-manager";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <JobsManager initialJobs={jobs} />;
}
