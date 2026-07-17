export interface GenderDistributionItem {
  label: string;
  value: number;
  employmentRate: number;
}

export interface DepartmentDistributionItem {
  sector: string;
  value: number;
}

export interface CohortTrendItem {
  cohort: string;
  employment: number;
}

export interface AnalyticsOverview {
  employmentRate: number;
  totalReported: number;
  genderDistribution: GenderDistributionItem[];
  departmentDistribution: DepartmentDistributionItem[];
  cohortTrends: CohortTrendItem[];
}

export async function getAnalyticsOverview(params?: {
  cohorts?: string[];
  gender?: string;
}): Promise<AnalyticsOverview> {
  const query = new URLSearchParams();
  if (params?.cohorts && params.cohorts.length > 0) {
    query.set("cohorts", params.cohorts.join(","));
  }
  if (params?.gender && params.gender !== "all") {
    query.set("gender", params.gender);
  }

  const base = process.env.NEXT_PUBLIC_API_URL;
  const url = `${base}/analytics/overview${query.toString() ? `?${query.toString()}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics overview");
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error("Analytics request was not successful");
  }
  return data.analytics as AnalyticsOverview;
}
