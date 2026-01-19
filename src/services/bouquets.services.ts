import axios from "../api/axios";
import { API_URL } from "../utils/API";

export const getBouquetsList = async (payload: any) => {
    const response = await axios.post(API_URL.getBouquetsList, payload);
    return response.data;
};