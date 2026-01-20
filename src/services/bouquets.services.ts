import axios from "../api/axios";
import { API_URL } from "../utils/API";

export const getBouquetsList = async (payload: any) => {
    const response = await axios.post(API_URL.getBouquetsList, payload);
    return response.data;
};

export const getBouquetDocuments = async (
  boqId: number | string,
  payload: {
    search?: string;
    page: number;
    pagelimit: number;
  }
) => {
  const response = await axios.post(
    API_URL.getBouquetDocuments(boqId),
    payload
  );
  return response.data;
};


export const removeDocumentFromBouquet = async (
  boqId: number | string,
  documentId: number | string
) => {
  const response = await axios.delete(
    API_URL.removeDocumentFromBouquet(boqId),
    {
      data: { documentId }, // ✅ axios delete body
    }
  );

  return response.data;
}

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

export const addDocumentsToBouquet = async (
  boqId: number | string,
  payload: {
    documentIds: number[];
  }
) => {
  const response = await axios.post(
    API_URL.addDocumentsToBouquet(boqId),
    payload
  );
  return response.data;
};


export const getApprovedDocuments = async (payload: {
  search?: string;
  page: number;
  pagelimit: number;
 bouquetId:number;
}) => {
  const response = await axios.post(
    API_URL.getApprovedDocuments,
    payload
  );
  return response.data;
};