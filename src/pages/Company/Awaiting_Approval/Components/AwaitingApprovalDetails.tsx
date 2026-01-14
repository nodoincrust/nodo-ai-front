import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    const [reloadKey, setReloadKey] = useState(0);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [pendingRejectReason, setPendingRejectReason] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const location = useLocation();
    const previousState = location.state as any;
    /* ------------------------------ Fetch Document ------------------------------ */
    useEffect(() => {
        if (id) fetchDocumentDetails();
    }, [id, reloadKey]);

    const fetchDocumentDetails = async (version?: number) => {
        if (!id) return;

        setIsLoading(true);
        getLoaderControl()?.showLoader();

        try {
            const res = await getAwaitingApprovalDetails(id, version);
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
            const versionNumber = data.file?.version_number || data.document?.current_version || 1;
            const versionData: ApiDocumentVersion = {
                version_number: versionNumber,
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

            const currentVersion = data.document.current_version;

            /* ---------------- Set Document ---------------- */
            setDocument({
                document_id: data.document.id,
                status: mappedStatus,
                display_status: data.document.display_status,
                current_version: currentVersion,
                version: versionData,
                is_actionable: data.document.is_actionable,
            });

            // Ensure selectedVersion is kept in sync (default to current_version on first load)
            setSelectedVersion(prev =>
                prev !== null ? prev : String(versionNumber || currentVersion || 1)
            );
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message ||
                    "Could not load document details",
            });
            navigate("/documents");
        } finally {
            setIsLoading(false);
            getLoaderControl()?.hideLoader();
        }
    };

    /* ------------------------------ Handlers ------------------------------ */
    const handleBackClick = () => {
        navigate("/documents", {
            state: {
                documentFilter: previousState?.documentFilter || "AWAITING",
                status: previousState?.status || "all",
                page: previousState?.page || 1,
            },
        });
    };

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

            // setDocument(prev =>
            //     prev
            //         ? {
            //             ...prev,
            //             status: "APPROVED",
            //             display_status: "Approved & Public", // ✅ UPDATE THIS
            //         }
            //         : prev
            // );
            setReloadKey(prev => prev + 1);
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || "Failed to approve document",
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    const handleReject = async (reason: string) => {
        if (!document) return;

        getLoaderControl()?.showLoader();
        try {
            // Pass reason trimmed in payload
            await rejectDocumentByID(document.document_id, reason.trim());

            notification.success({ message: "Document rejected successfully" });

            // setDocument(prev =>
            //     prev
            //         ? {
            //             ...prev,
            //             status: "REJECTED",
            //             display_status: "Rejected",
            //         }
            //         : prev
            // );
            setReloadKey(prev => prev + 1);
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
                    <p>{isLoading ? "Document not found" : "Document not found"}</p>
                </div>
            </div>
        );
    }


    /* ------------------------------ Header ------------------------------ */
    const extraActions: DocumentHeaderAction[] =
        document.is_actionable
            ? []
            : [
                {
                    label: "Reject",
                    type: "danger",
                    //Wrap in zero-arg function
                    onClick: () => setShowRejectModal(true),
                },
                {
                    label: "Approve",
                    type: "primary",
                    onClick: handleApprove,
                },
            ];

    // Build version options for all available versions
    const versionOptions: DocumentHeaderProps["versionOptions"] = Array.from(
        { length: document.current_version || 1 },
        (_, i) => ({
            value: String(i + 1),
            label: `V${i + 1}`,
        })
    );

    const headerProps: any = {
        breadcrumb: [
            { label: "Awaiting Approval", path: "/documents" },
            { label: document.version.file_name || "Document" },
        ],
        fileName: document.version.file_name || "",
        status: document.display_status,
        onBackClick: handleBackClick,
        extraActions,
        versionOptions,
        selectedVersion: selectedVersion ?? String(document.current_version),
        onVersionChange: async (val: string) => {
            const versionNumber = Number(val);
            if (!Number.isNaN(versionNumber)) {
                setSelectedVersion(val);
                await fetchDocumentDetails(versionNumber);
            }
        },
        ...(document.is_actionable && { extraActions }),
    };

    /* ------------------------------ Render ------------------------------ */
    return (
        <AwaitingApprovalDocumentLayout
            headerProps={{ ...headerProps, onReject: handleReject }}
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