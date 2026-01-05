import axios from "../api/axios";
import type { Document, DocumentsListResponse, GetDocumentsParams, ApiDocument } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch all documents with filters
export const getDocumentsList = async (params: GetDocumentsParams = {}) => {
  const response = await axios.get<DocumentsListResponse>(API_URL.getDocumentList, {
    params: {
      search: params.search,
      status: params.status,
      version: params.version,
      tag: params.tag,
      page: params.page || 1,
      size: params.size || 10,
    },
  });
  return response.data;
};

// Add new document
export const addDocument = async (payload: FormData) => {
  const response = await axios.post(
    API_URL.uploadDocument,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Get document by ID
export const getDocumentById = async (id: number) => {
  const response = await axios.get<ApiDocument>(`${API_URL.getDocumentList}/${id}`);
  return response.data;
};

// Search documents (using the same GET endpoint with search parameter)
export const searchDocuments = async (query: string, params: GetDocumentsParams = {}) => {
  return getDocumentsList({
    ...params,
    search: query,
  });
};




