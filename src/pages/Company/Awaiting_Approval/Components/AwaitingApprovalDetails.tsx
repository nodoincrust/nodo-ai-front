import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";

import AwaitingApprovalDocumentLayout from "./AwaitingApprovalDocumentLayout";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import DocumentPreview from "../../../Documents/DocumentPreview";

import {
    ApiDocument,
    ApiDocumentVersion,
    DocumentHeaderAction,
    DocumentHeaderProps,
} from "../../../../types/common";

import {
    approveDocumentByID,
    getAwaitingApprovalDetails,
    rejectDocumentByID,
} from "../../../../services/awaitingApproval.services";

import { config } from "../../../../config"; // Make sure config.docBaseUrl is imported

const AwaitingApprovalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<ApiDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    /* ------------------------------ Fetch Document ------------------------------ */
    useEffect(() => {
        if (id) fetchDocumentDetails();
    }, [id]);

    const fetchDocumentDetails = async () => {
        if (!id) return;

        setIsLoading(true);
        getLoaderControl()?.showLoader();

        try {
            const res = await getAwaitingApprovalDetails(id);
            const data = res.data?.data;

            if (!data) throw new Error("Document not found");

            /* ---------------- File URL ---------------- */
            let fileUrl = "";

            if (data.file?.file_url) {
                // Use full URL if provided
                fileUrl = data.file.file_url;
            } else if (data.file?.file_path) {
                // Build URL from path
                const baseUrl = config.docBaseUrl.replace(/\/$/, "");
                const path = data.file.file_path.startsWith("/")
                    ? data.file.file_path
                    : `/${data.file.file_path}`;
                fileUrl = `${baseUrl}${path}`;
            }

            /* ---------------- Version ---------------- */
            const version: ApiDocumentVersion = {
                version_number: data.file?.version_number || 1,
                file_size_bytes: data.file?.file_size_bytes || 0,
                file_name: data.file?.file_name || "",
                file_url: fileUrl,
                tags: data.summary?.tags || [],
                summary: data.summary?.text || "",
            };

            /* ---------------- Status Mapping ---------------- */
            const mappedStatus: ApiDocument["status"] =
                data.review?.status === "PENDING"
                    ? "IN_REVIEW"
                    : data.review?.status === "APPROVED"
                        ? "APPROVED"
                        : data.review?.status === "REJECTED"
                            ? "REJECTED"
                            : data.document?.status === "SUBMITTED"
                                ? "SUBMITTED"
                                : "IN_REVIEW";

            /* ---------------- Set Document ---------------- */
            setDocument({
                document_id: data.document.id,
                status: mappedStatus,
                display_status: data.document.display_status,
                current_version: data.document.current_version,
                version,
            });
        } catch (error: any) {
            notification.error({
                message: "Failed to load document",
                description:
                    error?.response?.data?.message ||
                    "Could not load document details",
            });
            navigate("/awaitingApproval");
        } finally {
            setIsLoading(false);
            getLoaderControl()?.hideLoader();
        }
    };

    /* ------------------------------ Handlers ------------------------------ */
    const handleBackClick = () => navigate("/awaitingApproval");

    const handleSummaryChange = (summary: string) => {
        setDocument((prev) =>
            prev
                ? { ...prev, version: { ...prev.version, summary } }
                : prev
        );
    };

    const handleSaveMetadata = async () => {
        getLoaderControl()?.showLoader();
        try {
            notification.success({ message: "Metadata saved successfully" });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    const handleApprove = async () => {
        if (!document) return;

        getLoaderControl()?.showLoader();
        try {
            await approveDocumentByID(document.document_id);
            notification.success({ message: "Document approved successfully" });

            setDocument(prev =>
                prev
                    ? {
                        ...prev,
                        status: "APPROVED",
                        display_status: "Approved & Public", // ✅ UPDATE THIS
                    }
                    : prev
            );
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || "Failed to approve document",
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    const handleReject = async () => {
        if (!document) return;

        getLoaderControl()?.showLoader();
        try {
            await rejectDocumentByID(document.document_id);
            notification.success({ message: "Document rejected successfully" });

            setDocument(prev =>
                prev
                    ? {
                        ...prev,
                        status: "REJECTED",
                        display_status: "Rejected", // ✅ UPDATE THIS
                    }
                    : prev
            );
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || "Failed to reject document",
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    /* ------------------------------ Loading ------------------------------ */
    if (isLoading || !document) {
        return (
            <div className="empty-state-wrapper">
                <div className="empty-state">
                    <img src="/assets/table-fallback.svg" alt="No document" />
                    <p>{isLoading ? "Loading document..." : "Document not found"}</p>
                </div>
            </div>
        );
    }


    /* ------------------------------ Header ------------------------------ */
    const extraActions: DocumentHeaderAction[] = [
        { label: "Reject", onClick: handleReject, type: "danger" },
        { label: "Approve", onClick: handleApprove, type: "primary" },
    ];

    const headerProps: any = {
        breadcrumb: [
            { label: "Awaiting Approval", path: "/awaitingApproval" },
            { label: document.version.file_name || "Document" },
        ],
        fileName: document.version.file_name || "",
        status: document.display_status,
        onBackClick: handleBackClick,
        extraActions,
        versionOptions: [
            {
                label: `v${document.current_version}`,
                value: document.current_version,
            },
        ],
        selectedVersion: document.current_version,
        onVersionChange: (val: number) => {
            console.log("Selected version:", val);
            // optionally fetch version-specific data here
        },
    };

    /* ------------------------------ Render ------------------------------ */
    return (
        <AwaitingApprovalDocumentLayout
            headerProps={headerProps}
            document={document}
            onSummaryChange={handleSummaryChange}
            onSaveMetadata={handleSaveMetadata}
        >
            <div className="document-viewer">
                {document.version.file_url ? (
                    <DocumentPreview
                        fileName={document.version.file_name}
                        fileUrl={document.version.file_url}
                    />
                ) : (
                    <div className="document-placeholder">
                        <span className="document-placeholder-label">
                            Document preview not available
                        </span>
                    </div>
                )}
            </div>
        </AwaitingApprovalDocumentLayout>
    );
};

export default AwaitingApprovalDetails;