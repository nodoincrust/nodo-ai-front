import axios from "../api/axios";
import type { ApiPayload } from "../types/common";
import { API_URL } from "../utils/API";

// Fetch documents assigned to the approver inbox
export const getApprovalList = async (payload: ApiPayload = {}) => {
    const response = await axios.post(API_URL.getApprovalList, payload);
    return response.data;
};

// Fetch awaiting-approval document details (optionally for a specific version)
export const getAwaitingApprovalDetails = (
    documentId: string | number,
    version?: number
) => {
    const versionQuery =
        typeof version === "number" ? `?version=${encodeURIComponent(version)}` : "";

    return axios.get(`/newdocuments/${documentId}/details${versionQuery}`);
};

// Approve a document by ID
export const approveDocumentByID = async (documentId: number | string) => {
    const response = await axios.post(`${API_URL.approveDocumentByID}/${documentId}`, {
        document_id: documentId,
    });
    return response.data;
};

// Reject a document by ID
export const rejectDocumentByID = async (documentId: number | string, reason: string) => {
    const response = await axios.post(`${API_URL.rejectDocumentByID}/${documentId}`, {
        document_id: documentId,
        reason,
    });
    return response.data;
};
