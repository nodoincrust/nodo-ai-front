import axios from "../api/axios";
// adminDashboard.service.ts
export interface CompanyApi {
  id: number;
  name: string;
  contact_email: string;
  contact_person: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

// Request payload for adding company
export interface AddCompanyRequest {
  name: string;
  contact_email: string;
  contact_person: string;
  is_active: boolean;
}
export interface UpdateCompanyRequest {
  name: string;
  contact_person: string;
  contact_email: string;
}
// Paginated response
export interface CompaniesResponse {
  page: number;
  size: number;
  total: number;
  data: CompanyApi[];
}

export const adminDashboardService = {
  // ✅ Get all companies
  getCompanies: () => axios.get<CompaniesResponse>("/getCompanies"),

  // ✅ Add new company
  addCompany: (payload: AddCompanyRequest) =>
    axios.post<CompanyApi>("/addCompany", payload),
// ✅ Delete company
   deleteCompany: (companyId: number) =>
    axios.put(`/deleteCompany/${companyId}`),

// ✅ update company stauts 
   updateCompanyStatus: (companyId: number, isActive: boolean) =>
    axios.put(`/companies/${companyId}/status`, {
      is_active: isActive,
    }),

  // ✅ Update company details
  updateCompanyDetails: (
    companyId: number,
    payload: UpdateCompanyRequest
  ) =>
    axios.put(`/updateCompanyDetails/${companyId}`, payload),

  // ✅ Search companies
  // Note: Search API might return direct array or wrapped response
  searchCompanies: (query: string, page = 1, size = 10) =>
    axios.get<CompanyApi[] | CompaniesResponse>("/search", {
      params: { query, page, size },
    }),
}
