export type UserRole = "student" | "alumni" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  graduationYear?: string;
  university?: string;
  profilePhoto?: string;
  company?: string;
  position?: string;
  skills?: string[];
  bio?: string;
  cvUrl?: string;
  isApproved?: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
  // NEW FIELDS
  registrationNumber?: string;
  department?: string;
  interests?: string[];
  gender?: "male" | "female" | "other";
  employmentStatus?: "employed" | "unemployed" | "self-employed" | "freelance";
}

export interface AuthUser extends User {
  token: string;
}
