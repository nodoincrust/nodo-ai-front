import { api } from "../api/axios";

/* =======================
   Types & Interfaces
======================= */

export interface DepartmentApi {
  id: number;
  company_id: number;
  name: string;
  reporting_department_id?: number | null;
  contact_person?: string | null;
  contact: string;
  contact_email: string;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
}

export interface AddDepartmentRequest {
  name: string;
  reporting_department_id?: number | null;
  contact_person?: string | null;
  contact: string;
  contact_email: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  reporting_department_id?: number | null;
  contact_person?: string | null;
  contact: string;
  contact_email: string;
}

export interface UpdateDeptStatusRequest {
  is_active: boolean;
}

export interface DepartmentsResponse {
  page: number;
  size: number;
  total: number;
  data: DepartmentApi[];
}

/* =======================
   API Service
======================= */

export const companyDashboardService = {
  // ✅ Add Department
  addDepartment: (payload: AddDepartmentRequest) =>
    api.post("/department/addDept", payload),

  // ✅ Get Department List (with pagination)
  getDepartments: (page = 1, size = 10) =>
    api.get<DepartmentsResponse>("/department/getDeptList", {
      params: { page, size },
    }),
    
  

  // ✅ Update Department Details
  updateDepartmentDetails: (
    deptId: number,
    payload: UpdateDepartmentRequest
  ) =>
    api.put(`/department/updateDeptDetails/${deptId}`, payload),

  // ✅ Update Department Status
  updateDepartmentStatus: (deptId: number, isActive: boolean) =>
    api.put(`/department/${deptId}/status`, {
      is_active: isActive,
    }),

  // ✅ Delete Department
  deleteDepartment: (deptId: number) =>
    api.put(`/department/deleteDept/${deptId}`),

  // ✅ Search Departments
  searchDepartments: (query: string, page = 1, size = 10) =>
    api.get<DepartmentsResponse>("/department/search", {
      params: { query, page, size },
    }),
};
