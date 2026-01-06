import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch all listings
export const getDepartmentsList = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getDepartmentsList, payload);
    return response.data;
};

// Add department
export const addDepartment = async (payload: any) => {
    const response = await axios.post(API_URL.addDepartment, payload);
    return response.data;
};

// Update department
export const updateDepartment = async (departmentId: number, payload: any) => {
    const response = await axios.put(
        `${API_URL.updateDepartment}/${departmentId}`,
        payload
    );
    return response.data;
};

// Delete department
export const deleteDepartment = async (departmentId: number) => {
    const response = await axios.delete(
        `${API_URL.deleteDepartment}/${departmentId}`
    );
    return response.data;
};

// Fetch employees (search, pagination)
export const getEmployeesList = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getEmployeesList, payload);
    return response.data;
};