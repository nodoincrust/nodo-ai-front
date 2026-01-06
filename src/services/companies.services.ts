import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch all listings
export const getCompaniesList = async (payload: ApiPayload = {}) => {
  const response = await axios.post(API_URL.getCompaniesList, payload);
  return response.data;
};

// Add company
export const addCompany = async (payload: any) => {
  const response = await axios.post(API_URL.addCompany, payload);
  return response.data;
};

// Update company
export const updateCompany = async (companyId: number, payload: any) => {
  const response = await axios.put(`${API_URL.updateCompany}/${companyId}`, payload);
  return response.data;
};

// Delete company
export const deleteCompany = async (companyId: number) => {
  const response = await axios.delete(
    `${API_URL.deleteCompany}/${companyId}`
  );
  return response.data;
};
