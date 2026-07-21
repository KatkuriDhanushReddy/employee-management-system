export type Role = 'Super Admin' | 'HR Manager' | 'Employee';
export type Status = 'Active' | 'Inactive';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager?: Employee | null;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgNode {
  _id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  role: Role;
  status: Status;
  profileImage?: string | null;
  children: OrgNode[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  byDepartment: { _id: string; count: number }[];
  byRole: { _id: string; count: number }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  errors?: { field: string; message: string }[];
}

export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Support',
] as const;

export const ROLES: Role[] = ['Super Admin', 'HR Manager', 'Employee'];
export const STATUSES: Status[] = ['Active', 'Inactive'];
