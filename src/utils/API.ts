import SubmitDocument from "../pages/Documents/Components/submitDocument";

export const API_URL = {
  // Auth
  login: "/request-otp",
  verifyOTP: "/verify-otp",

  // Companies
  getCompaniesList: "/getCompanies",
  addCompany: "/addCompany",
  updateCompany: "/updateCompanyDetails",
  deleteCompany: "/deleteCompany",

  // Departments
  getDepartmentsList: "/company/getDepartments",
  getDepartmentsListWithoutPagination: "/company/getDepartmentList",
  addDepartment: "/company/addDepartments",
  updateDepartment: "/company/updateDepartment",
  deleteDepartment: "/company/deleteDepartment",

  // Employees
  getEmployeesList: "/company/getEmployees",
  addEmployee: "/company/addEmployee",
  updateEmployee: "/company/updateEmployee",
  deleteEmployee: "/company/deleteEmployee",

  //Awaiting Approval
  getApprovalList: "/newdocuments/approver/inbox",
  approveDocumentByID: "/newdocuments/approver/inbox",

  // ========================================
  //   Documents
  // ===========================================
  getDocumentList: "/employee/documents",
  uploadDocument: "/newdocuments/upload",
  getEmployeeList: "/employee/assignable-hierarchy",
  getDocumentById: (id: number | string) => `/newdocuments/${id}/details`,
  // regenarateSummary: (id: number | string) => `ai/summary/${id}`,
  saveMetaData: (id: number | string) => `newdocuments/${id}/save`,
  submitDocumentForReview: (id: number | string) => `/employee/${id}/assign`,

  getaichat: "/ai/chat",

  startSummary: (id: number | string) => `/ai/summary/start/${id}`,
  sumarryStatus: (id: number | string) => `/ai/summary/status/${id}`,
};
