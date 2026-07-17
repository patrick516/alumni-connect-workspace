// frontend/src/types/directory.ts
export interface DirectoryUser {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  graduationYear?: string;
  company?: string;
  position?: string;
  department?: string;
  location?: string;
  role: string;
  bio?: string;
  skills?: string[];
}

export interface DirectoryFilters {
  department?: string;
  skills?: string;
  location?: string;
  search?: string;
}

export interface FilterOptions {
  departments: string[];
  skills: string[];
  locations: string[];
}
