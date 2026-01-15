import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";

import AwaitingApprovalDocumentLayout from "./AwaitingApprovalDocumentLayout";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import DocumentPreview from "../../../Documents/DocumentPreview";

import {
    ApiDocument,
    DocumentHeaderAction,
    DocumentHeaderProps,
} from "../../../../types/common";

import {
    approveDocumentByID,
    getAwaitingApprovalDetails,
    rejectDocumentByID,
} from "../../../../services/awaitingApproval.services";

import { config } from "../../../../config";

const AwaitingApprovalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const previousState = location.state as any;

    const [document, setDocument] = useState<ApiDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedVersion, setSelectedVersion] = useState<number>(1);

    const [summaryText, setSummaryText] = useState<string>("");
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

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
                            : "IN_REVIEW";

            // Flatten the document object for easier access
            const normalizedDocument: any = {
                document_id: data.document.id,
                status: mappedStatus,
                display_status: data.document.display_status ?? mappedStatus,
                current_version: data.document.current_version,
                file: data.file,
                summary: {
                    text: data.summary?.text ?? "",
                    tags: data.summary?.tags ?? [],
                    citations: data.summary?.citations ?? [],
                },
                versions: data.versions ?? [],
                is_actionable: data.document.is_actionable,
                remark: data.document.remark ?? undefined,
            };

            setDocument(normalizedDocument);
            setSummaryText(normalizedDocument.summary.text);
            setSuggestedTags(normalizedDocument.summary.tags);
            setActiveTags(normalizedDocument.summary.tags);
            setSelectedVersion(version ?? data.document.current_version);
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || "Could not load document details",
            });
            navigate("/documents");
        } finally {
            setIsLoading(false);
            getLoaderControl()?.hideLoader();
        }
    };

    const handleBackClick = () => {
        navigate("/documents", {
            state: {
                documentFilter: "AWAITING",
                status: previousState?.status || "all",
                page: previousState?.page || 1,
            },
        });
    };

    const handleSummaryChange = (summary: string) => {
        setSummaryText(summary);
        setDocument((prev) =>
            prev ? { ...prev, summary: { ...prev.summary, text: summary } } : prev
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
            setReloadKey((prev) => prev + 1);
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
            await rejectDocumentByID(document.document_id, reason.trim());
            notification.success({ message: "Document rejected successfully" });
            setReloadKey((prev) => prev + 1);
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || "Failed to reject document",
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    if (isLoading || !document) {
        return (
            <div className="empty-state-wrapper">
                <div className="empty-state">
                    <img src="/assets/table-fallback.svg" alt="No document" />
                    <p>Document not found</p>
                </div>
            </div>
        );
    }

    // Header extra actions
    const extraActions: DocumentHeaderAction[] = document.is_actionable
        ? []
        : [
            {
                label: "Reject",
                type: "danger",
                onClick: () => setShowRejectModal(true),
            },
            {
                label: "Approve",
                type: "primary",
                onClick: handleApprove,
            },
        ];

    const fileName = document.file?.file_name || "Document";

    const versionOptions = document.versions.map((v) => ({
        label: `V${v.version}`,
        value: String(v.version),
    }));

    const headerProps: DocumentHeaderProps = {
        breadcrumb: [
            { label: "Documents", path: "/documents" },
            { label: document?.file?.file_name || "Unknown Document" }
        ],
        fileName: document?.file?.file_name || "Unknown Document",
        status: document?.status,                    // e.g., "SUBMITTED"
        displayStatus: document.display_status,   // ← pass the display_status here
        rejectionRemark: document?.remark ?? undefined,
        onBackClick: handleBackClick,
        versionOptions: document?.versions.map(v => ({
            value: String(v.version),
            label: `V${v.version}`
        })) || [],
        selectedVersion: String(selectedVersion),
        onVersionChange: (value) => fetchDocumentDetails(Number(value)),
        onSubmit: undefined, // or your submit handler
        extraActions: [],     // if needed
    };

    const fileUrl =
        document.file?.file_path && config.docBaseUrl
            ? `${config.docBaseUrl.replace(/\/$/, "")}${document.file.file_path}`
            : "";

    return (
        <AwaitingApprovalDocumentLayout
            headerProps={{ ...headerProps, onReject: handleReject }}
            document={document}
            summaryText={summaryText}
            suggestedTags={suggestedTags}
            activeTags={activeTags}
            onSummaryChange={handleSummaryChange}
            onSaveMetadata={handleSaveMetadata}
        >
            <div className="document-viewer">
                {fileUrl ? (
                    <DocumentPreview fileName={fileName} fileUrl={fileUrl} />
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