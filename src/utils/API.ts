import SubmitDocument from "../pages/Documents/Components/submitDocument";
import { rejectDocumentByID } from "../services/awaitingApproval.services";
import { getEmployeesList } from "../services/employees.services";

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
  getDepartemetsEmployeeListForShare: "/department/getDeptEmployees",

  // Employees
  getEmployeesList: "/company/getEmployees",
  getEmployeesListForShare: "/company/getEmployeeList",
  addEmployee: "/company/addEmployee",
  updateEmployee: "/company/updateEmployee",
  deleteEmployee: "/company/deleteEmployee",
  getCompanyDesignations: "/company/designations",

  //Awaiting Approval
  getApprovalList: "/newdocuments/approver/inbox",
  approveDocumentByID: "/newdocuments/approve",
  rejectDocumentByID: "/newdocuments/reject",

  // ========================================
  //   Documents
  // ===========================================
  getDocumentList: "/employee/documents",
  uploadDocument: "/newdocuments/upload",
  reuploadDocument: (id: number) => `/newdocuments/reupload/${id}`,
  getEmployeeList: "/employee/assignable-hierarchy",
  getDocumentById: (id: number | string) => `/newdocuments/${id}/details`,

  // regenarateSummary: (id: number | string) => `ai/summary/${id}`,
  saveMetaData: (id: number | string) => `newdocuments/${id}/save`,
  submitDocumentForReview: (id: number | string) => `/employee/${id}/assign`,
  shareDocument: "/newdocuments/share",

  // AI
  getaichat: "/ai/chat",
  getaicharhistory: (id: number | string) => `/ai/chat/history/${id}`,
  startSummary: (id: number | string) => `/ai/summary/start/${id}`,
  sumarryStatus: (id: number | string) => `/ai/summary/status/${id}`,

  // Templates
  getTemplatesList: "/newdocuments/templates",
  saveTemplate: "/newdocuments/savetemplate",
  getTemplateById: "/newdocuments/templatesFeilds",
  deleteTemplate: "/newdocuments/deleteTemplate",

  //Bouuquet
  getBouquetsList: "/newdocuments/getAllBoq",
  addBouquet: "/newdocuments/createBouquet",
  updateBouquet: "/newdocuments/updateBouquet",
  deleteBouquet: "/newdocuments/deleteBouquet",
  getBouquetDocuments: (boqId: number | string) =>
    `/newdocuments/boqDocuments/${boqId}`,

  addDocumentsToBouquet: (boqId: number | string) =>
    `/newdocuments/appendDocuments/${boqId}`,

  getApprovedDocuments: "/newdocuments/getApprovedDocs",

  // Shared Workspace
  getSharedDocuments: "/newdocuments/sharedDocument",
  removeDocumentFromBouquet: (boqId: number | string) =>
    `/newdocuments/removeDocuments/${boqId}`,

 onlyOfficeFileStream: (token: string) => `/newdocuments/internal/onlyoffice/file/${token}`,
};
