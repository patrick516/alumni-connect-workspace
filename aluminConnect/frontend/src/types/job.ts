export type JobStatus = "pending" | "approved" | "rejected";

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  salary?: string;
  deadline?: string;
  contactEmail?: string;
  type?: "full-time" | "part-time" | "internship" | "remote";
  postedBy: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  status: JobStatus;
  applicants?: string[];
  createdAt: string;
}
