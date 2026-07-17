import type { DirectoryUser } from "./directory";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

/** Student's view: one row per alumni they interacted with */
export interface StudentConnectionRow {
  _id: string;
  status: ConnectionStatus;
  alumni: DirectoryUser;
  updatedAt?: string;
}

export interface AlumniPendingRow {
  _id: string;
  status: ConnectionStatus;
  student: DirectoryUser;
  createdAt: string;
}

export interface AlumniAcceptedRow {
  _id: string;
  status: ConnectionStatus;
  student: DirectoryUser;
  updatedAt?: string;
}

export interface AlumniConnectionsResponse {
  pending: AlumniPendingRow[];
  accepted: AlumniAcceptedRow[];
}
