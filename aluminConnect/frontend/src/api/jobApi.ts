import type { Job } from "../types";
import { api, getErrorMessage } from "./client";

export async function getJobsApi(): Promise<Job[]> {
  try {
    const { data } = await api.get("/jobs");
    return Array.isArray(data) ? data : (data.jobs ?? []);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch jobs"));
  }
}

export async function createJobApi(data: Partial<Job>): Promise<Job> {
  try {
    const { data: job } = await api.post<Job>("/jobs", data);
    return job;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to create job"));
  }
}

export async function updateJobApi(
  id: string,
  data: Partial<Job>,
): Promise<Job> {
  try {
    const { data: updatedJob } = await api.put<Job>(`/jobs/${id}`, data);
    return updatedJob;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update job"));
  }
}

export async function deleteJobApi(id: string): Promise<void> {
  try {
    await api.delete(`/jobs/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to delete job"));
  }
}

export async function approveJobApi(id: string): Promise<void> {
  try {
    await api.put(`/admin/approve-job/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to approve job"));
  }
}

export async function applyJobApi(id: string): Promise<void> {
  try {
    await api.post(`/jobs/${id}/apply`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to apply"));
  }
}

export interface JobStats {
  totalAvailable: number;
  applied: number;
  remaining: number;
}

export const getJobStatsApi = async (): Promise<JobStats> => {
  const { data } = await api.get<{ success: boolean; stats: JobStats }>(
    "/jobs/stats",
  );
  return data.stats;
};
