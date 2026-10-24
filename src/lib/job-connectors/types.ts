export interface NormalizedJob {
  externalId: string;
  source: string;
  title: string;
  company: string;
  location?: string;
  remoteType: "REMOTE" | "HYBRID" | "ONSITE" | "UNKNOWN";
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requirements: string[];
  url?: string;
  publishedAt?: string;
}

export interface JobSearchOptions {
  search?: string;
  category?: string;
  limit?: number;
}

export interface JobSourceConnector {
  sourceName: string;
  displayName: string;
  search(options?: JobSearchOptions): Promise<NormalizedJob[]>;
  testConnection(): Promise<{ ok: boolean; message: string }>;
}
