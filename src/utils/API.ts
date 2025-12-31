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
    getCompanyDetails: "/company/company-detail",
    createCompany: "/company/create-company",
    updateCompany: "/company/update-company",

    // ======================
    // Filters
    // ======================
    getFilterParams: "/category/filter-params",
    applyFilters: "/category/filter-apply",
};
