import axios from "../api/axios";
import { API_URL } from "../utils/API";

export const getSharedData = async (payload: {
  key: "doc" | "boq" | "template";
  page: number;
  pagelimit: number;
  query?: string;
  sort?: string;
  order?: "asc" | "desc";
}) => {
  const response = await axios.post(API_URL.getSharedDocuments, payload);
  return response.data;
};

