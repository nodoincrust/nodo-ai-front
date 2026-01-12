import axios from "../api/axios";
import type {
  Document,
  DocumentsListResponse,
  GetDocumentsParams,
  ApiDocument,
  ApiDocumentDetailResponse,
  AssignableEmployee,
  AssignableEmployeeResponse,
  AiChatResponse
} from "../types/common";
import { API_URL } from "../utils/API";
import { config } from "../config";

// Fetch all documents with filters
export const getDocumentsList = async (params: GetDocumentsParams = {}) => {
  const response = await axios.get<DocumentsListResponse>(
    API_URL.getDocumentList,
    {
      params: {
        search: params.search,
        status: params.status,
        version: params.version,
        tag: params.tag,
        page: params.page || 1,
        size: params.size || 10,
      },
    }
  );
  return response.data;
};

// Add new document
export const addDocument = async (payload: FormData) => {
  const response = await axios.post(API_URL.uploadDocument, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get document by ID
export const getDocumentById = async (id: number): Promise<ApiDocument> => {
  const response = await axios.get<ApiDocumentDetailResponse>(
    API_URL.getDocumentById(id)
  );

  // Map API response to normalized ApiDocument format
  const apiData = response.data.data;

  // Construct file URL
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
    display_status: apiData.document.display_status,
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
export const searchDocuments = async (
  query: string,
  params: GetDocumentsParams = {}
) => {
  return getDocumentsList({
    ...params,
    search: query,
  });
};

export const saveDocumentMetadata = async (
  id: number | string,
  payload: {
    summary: string;
    tags: string[];
  }
) => {
  const response = await axios.post(
    API_URL.saveMetaData(id),
    payload
  );

  return response.data;
};


export const getAssignableEmployees = async (): Promise<AssignableEmployee[]> => {
  const response = await axios.get<AssignableEmployeeResponse>(
    API_URL.getEmployeeList
  );

  // Sort by hierarchy order (LOW → HIGH)
  return response.data.data.sort((a, b) => a.order - b.order);
};

export const submitDocumentForReview = async (
  documentId: number | string,
  assigneeIds: number[]
) => {
  const payload = {
    assignee_ids: assigneeIds,
  };

  const response = await axios.post(
    API_URL.submitDocumentForReview(documentId),
    payload
  );

  return response.data;
};

export const getAiChatResponse = async (
  documentId: number | string,
  query: string
): Promise<AiChatResponse> => {
  const response = await axios.get<AiChatResponse>(
    API_URL.getaichat, // "/ai/chat"
    {
      params: {
        document_id: documentId,
        query,
      },
      timeout: 30000,
    }
  );

  return response.data;
};

export async function startSummary(documentId: number | string) {
  const res = await axios.post(API_URL.startSummary(documentId));
  return res.data.job_id;
}

export function pollSummaryStatus(
  jobId: number | string,
  onSuccess: (result: any) => void,
  onError: (err: any) => void
) {
  const interval = setInterval(async () => {
    try {
      const res = await axios.get(API_URL.sumarryStatus(jobId));
      const data = res.data;

      if (data.status === "done") {
        clearInterval(interval);
        onSuccess(data.result);
      }

      if (data.status === "error") {
        clearInterval(interval);
        onError(data.error);
      }
    } catch (err) {
      clearInterval(interval);
      onError(err);
    }
  }, 20000);

  return () => clearInterval(interval); // optional cancel
}

// Approve document

