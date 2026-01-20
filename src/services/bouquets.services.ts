import axios from "../api/axios";
import { API_URL } from "../utils/API";

export const getBouquetsList = async (payload: any) => {
    const response = await axios.post(API_URL.getBouquetsList, payload);
    return response.data;
};

export const addBouquet = async (payload: any) => {
    const response = await axios.post(API_URL.addBouquet, payload);
    return response.data;
};

export const updateBouquet = async (bouquetId: number, payload: any) => {
    const response = await axios.post(
        `${API_URL.updateBouquet}/${bouquetId}`,
        payload
    );
    return response.data;
};

export const deleteBouquet = async (bouquetId: number) => {
    const response = await axios.delete(`${API_URL.deleteBouquet}/${bouquetId}`
    );
    return response.data;
};