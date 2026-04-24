export type Role = "admin" | "user";

export type Department =
  | "IT Support"
  | "Hardware"
  | "Network"
  | "Software"
  | "HR"
  | "Other";

export type Priority = "low" | "medium" | "high";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";

export interface TicketNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: Department;
  priority: Priority;
  status: TicketStatus;
  assignedTo: Department | null;
  notes: TicketNote[];
  createdBy: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}