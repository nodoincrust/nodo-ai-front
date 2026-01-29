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
    templateName: string;
    fields: any[];
}) => {
    const response = await axios.post(
        API_URL.saveTemplate,
        payload
    );
    return response.data;
};

/* ================= LOAD TEMPLATE (FIELDS BY ID) ================= */
export const getTemplateById = async (templateId: string | number) => {
    const response = await axios.post(
        `${API_URL.getTemplateById}/${templateId}`
    );
    return response.data;
};
