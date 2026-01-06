export const API_URL = {
    // ======================
    // Auth
    // ======================
    login: "/admin/admin-login",
    verifyOTP: "/admin/admin-otpverify",
    resetPassword: "admin/reset-user/password",
    getResetPasswordDetails: "admin/reset-user/detail",

    // ======================
    // Companies
    // ======================
    getCompaniesList: "/getCompanies",
    addCompany: "/addCompany",
    updateCompany: "/updateCompanyDetails",
    deleteCompany: "/deleteCompany",

    // ======================
    // Departments
    // ======================
    getDepartmentsList: "/company/getDepartments",
    addDepartment: "/company/addDepartments",
    updateDepartment: "/company/updateDepartment",
    deleteDepartment: "/company/deleteDepartment",

    // ======================
    // Employees
    // ======================
    getEmployeesList: "/company/getEmployees",

    // ======================
    // Filters
    // ======================
    getFilterParams: "/category/filter-params",
    applyFilters: "/category/filter-apply",


    // ========================================
    //   Documents
    // ===========================================
    getDocumentList:"/employee/documents",
    uploadDocument:"/newdocuments/upload"
};
