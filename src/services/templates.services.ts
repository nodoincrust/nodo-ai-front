import axios from "../api/axios";
import { API_URL } from "../utils/API";

/* ================= GET TEMPLATES LIST ================= */
export const getTemplatesList = async (payload: {
    page?: number;
    pagelimit?: number;
    search?: string;
    status?: "active" | "inactive";
}) => {
    const response = await axios.post(
        API_URL.getTemplatesList,
        payload
    );

    return response.data;
};

/* ================= SAVE TEMPLATE ================= */
export const saveTemplate = async (payload: {
    templateId?: string;
    templateName: string;
    rows: { rowId: string; rowOrder: number; fields: any[] }[];
}) => {
    const response = await axios.post(API_URL.saveTemplate, payload);
    return response.data;
};

/* ================= LOAD TEMPLATE (FIELDS BY ID) ================= */
export const getTemplateById = async (templateId: string | number) => {
    const response = await axios.post(
        `${API_URL.getTemplateById}/${templateId}`
    );
    return response.data;
};

/* ================= DELETE TEMPLATE ================= */
export const deleteTemplate = async (templateId: number | string) => {
    const response = await axios.delete(
        `${API_URL.deleteTemplate}/${templateId}`
    );
    return response.data;
};

/* ================= SUBMIT FILLED TEMPLATE ================= */
export const submitTemplateForm = async (payload: FormData) => {
    const response = await axios.post(
        API_URL.submitTemplateForm,
        payload,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

/* ================= GET FILLED TEMPLATE SUBMISSION ================= */
export const getFilledTemplateSubmission = async (payload: {
    template_id: number;
    submitted_by: number;
}) => {
    const response = await axios.post(
        API_URL.getFilledTemplateSubmission,
        payload
    );
    return response.data;
};