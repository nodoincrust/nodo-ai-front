import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch documents assigned to the approver inbox
export const getApprovalList = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getApprovalList, payload);
    return response.data;
};


// Approve a document by ID
export const approveDocumentByID = async (documentId: number | string) => {
    const response = await axios.post(`${API_URL.approveDocumentByID}/${documentId}/approve`, {
        document_id: documentId,
    });
    return response.data;
};
