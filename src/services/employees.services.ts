import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch employees (search, pagination)
export const getEmployeesList = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getEmployeesList, payload);
    return response.data;
};

export const getEmployeesListForShare = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getEmployeesListForShare, payload);
    return response.data;
};



// Add employee
export const addEmployee = async (payload: any) => {
    const response = await axios.post(API_URL.addEmployee, payload);
    return response.data;
};

// Update employee
export const updateEmployee = async (employeeId: number, payload: any) => {
    const response = await axios.put(`${API_URL.updateEmployee}/${employeeId}`, payload);
    return response.data;
};

// Delete employee
export const deleteEmployee = async (employeeId: number) => {
    const response = await axios.delete(`${API_URL.deleteEmployee}/${employeeId}`);
    return response.data;
};

export const getCompanyDesignations = async () => {
    const response = await axios.get((API_URL.getCompanyDesignations));
    return response.data;
};
