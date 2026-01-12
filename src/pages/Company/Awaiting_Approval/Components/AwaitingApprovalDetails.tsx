import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import AwaitingApprovalDocumentLayout from "./AwaitingApprovalDocumentLayout";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import DocumentPreview from "../../../Documents/DocumentPreview";
import {
    ApiDocument,
    ApiDocumentVersion,
    AwaitingDocumentHeaderProps,
    DocumentHeaderAction,
    DocumentStatus,
} from "../../../../types/common";
import { getApprovalList, approveDocumentByID } from "../../../../services/awaitingApproval.services";

const AwaitingApprovalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<ApiDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch document
    useEffect(() => {
        if (id) fetchDocument(id);
    }, [id]);

    const fetchDocument = async (docId: string) => {
        setIsLoading(true);
        getLoaderControl()?.showLoader();
        try {
            const res = await getApprovalList({ page: 1, size: 1, document_id: docId });
            const docData = res?.data?.[0];
            if (docData) {
                const version: ApiDocumentVersion = {
                    version_number: docData.version_number || 1,
                    file_size_bytes: docData.file_size_bytes || 0,
                    file_name: docData.file_name,
                    file_url: docData.file_url,
                    tags: docData.tags || [],
                    summary: docData.summary || "",
                };

                setDocument({
                    document_id: docData.document_id,
                    status: "IN_REVIEW", // Use any default internal status
                    current_version: docData.version_number || 1, // required
                    version,
                });
            }
        } catch (err: any) {
            notification.error({
                message: err?.response?.data?.message || "Failed to fetch document",
            });
        } finally {
            setIsLoading(false);
            getLoaderControl()?.hideLoader();
        }
    };

    const handleBackClick = () => navigate("/awaitingApproval");

    const handleSummaryChange = (summary: string) => {
        setDocument((prev) =>
            prev ? { ...prev, version: { ...prev.version, summary } } : prev
        );
    };

    const handleSaveMetadata = async () => {
        if (!document) return;

        getLoaderControl()?.showLoader();
        try {
            setTimeout(() => {
                notification.success({ message: "Metadata saved successfully" });
            }, 500);
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    const handleApprove = async () => {
        if (!document) return;

        getLoaderControl()?.showLoader();
        try {
            const res = await approveDocumentByID(document.document_id);
            notification.success({ message: res?.message || "Document approved successfully" });
            setDocument((prev) => prev && { ...prev, status: "APPROVED" });
        } catch (err: any) {
            notification.error({
                message: err?.response?.data?.message || "Failed to approve document",
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    if (isLoading || !document) {
        return <p style={{ padding: 24 }}>Loading document...</p>;
    }

    // extraActions array is now type-safe
    const extraActions: DocumentHeaderAction[] =
        document.status === "IN_REVIEW"
            ? [
                {
                    label: "Approve",
                    onClick: handleApprove,
                    type: "primary",
                },
            ]
            : [];

    const headerProps: AwaitingDocumentHeaderProps = {
        breadcrumb: [
            { label: "Awaiting Approval", path: "/awaitingApproval" },
            { label: document.version.file_name || "Document" },
        ],
        fileName: document.version.file_name || "",
        status: "AWAITING_APPROVAL",
        onBackClick: handleBackClick,
        extraActions,
    };

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