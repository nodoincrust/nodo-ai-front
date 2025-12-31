import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch all listings
export const getCompaniesList = async (payload: ApiPayload = {}) => {
  const response = await axios.post(API_URL.getCompaniesList, payload);
  return response.data;
};
