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
};
