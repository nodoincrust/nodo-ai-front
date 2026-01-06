import axios from "../api/axios";
import type { Document, DocumentsListResponse, GetDocumentsParams, ApiDocument, ApiDocumentDetailResponse } from "../types/common";
import { API_URL } from "../utils/API";
import { config } from "../config";

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
export const getDocumentById = async (id: number): Promise<ApiDocument> => {
  const response = await axios.get<ApiDocumentDetailResponse>(
    API_URL.getDocumentById(id)
  );
  
  // Map API response to normalized ApiDocument format
  const apiData = response.data.data;
  
  // Build file URL from file_path or file_url
  // file_path is relative (e.g., "/storage/companies/8/documents/17/v1_DMS (1).pdf")
  // file_url is full URL (if provided)
  // Note: API requires /nodo prefix in the URL path
  let fileUrl = "";
  if (apiData.file.file_url) {
    fileUrl = apiData.file.file_url;
  } else if (apiData.file.file_path) {
    // Construct full URL from relative path using API base URL
    // Add /nodo prefix as required by the API
    const baseUrl = config.docBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    const path = apiData.file.file_path.startsWith("/") 
      ? apiData.file.file_path 
      : `/${apiData.file.file_path}`;
    // Prepend /nodo to the path: /storage/... -> /nodo/storage/...
    const pathWithNodo = `${path}`;
    fileUrl = `${baseUrl}${pathWithNodo}`;
  }
  
  return {
    document_id: apiData.document.id,
    status: apiData.document.status,
    current_version: apiData.document.current_version,
    version: {
      version_number: apiData.file.version_number,
      file_name: apiData.file.file_name,
      file_size_bytes: apiData.file.file_size_bytes,
      file_url: fileUrl,
      tags: apiData.summary.tags || [],
      summary: apiData.summary.text || undefined,
    },
  };
};

// Search documents (using the same GET endpoint with search parameter)
export const searchDocuments = async (query: string, params: GetDocumentsParams = {}) => {
  return getDocumentsList({
    ...params,
    search: query,
  });
};




