import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";
import { ApiDocument, DocumentHeaderAction } from "../../../types/common";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { approveDocumentByID, getAwaitingApprovalDetails, rejectDocumentByID } from "../../../services/awaitingApproval.services";
import { config } from "../../../config";
import AwaitingApprovalDocumentLayout from "../../Company/Awaiting_Approval/Components/AwaitingApprovalDocumentLayout";
import DocumentPreview from "../DocumentPreview";
import { getDisplayStatus } from "../../../utils/utilFunctions";

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

      // ---- Normalize status ----
      const rawStatus = (data.review?.status || data.document.status)?.toUpperCase();

      let normalizedStatus: ApiDocument["status"];
      if (rawStatus === "PENDING" || rawStatus === "IN_REVIEW") normalizedStatus = "IN_REVIEW";
      else if (rawStatus === "APPROVED") normalizedStatus = "APPROVED";
      else if (rawStatus === "REJECTED") normalizedStatus = "REJECTED";
      else if (rawStatus === "DRAFT") normalizedStatus = "DRAFT";
      else if (rawStatus === "SUBMITTED") normalizedStatus = "SUBMITTED";
      else normalizedStatus = "DRAFT"; // fallback

      // Flatten document object
      const normalizedDocument: any = {
        document_id: data.document.id,
        status: normalizedStatus,
        display_status: data.document.display_status ?? normalizedStatus,
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
        message: error?.response?.data?.message || "Could not load document details",
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

  const handleApprove = async () => {
    if (!document) return;

    getLoaderControl()?.showLoader();
    try {
      await approveDocumentByID(document.document_id);
      notification.success({ message: "Document approved successfully" });
      setReloadKey((prev) => prev + 1);
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message || "Failed to approve document",
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
        message: error?.response?.data?.message || "Failed to reject document",
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
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

  const fileName = document.file?.file_name || "Document";

  // ---- Header extra actions ----
  const extraActions: DocumentHeaderAction[] = [];
  if (document.status === "REJECTED") {
    extraActions.push({
      label: "Reupload",
      type: "default",
      onClick: () => setShowRejectModal(false), // replace with real handler if any
    });
  }
  if (document.is_actionable) {
    extraActions.push(
      { label: "Reject", type: "danger", onClick: () => setShowRejectModal(true) },
      { label: "Approve", type: "primary", onClick: handleApprove }
    );
  }

  const versionOptions = document.versions.map((v) => ({
    label: `V${v.version}`,
    value: String(v.version),
  }));

  // Show submit button for DRAFT or IN_REVIEW
  const showSubmit = document.status === "DRAFT" || document.status === "IN_REVIEW";

  const headerProps: any = {
    breadcrumb: [
      { label: "Documents", path: "/documents" },
      { label: fileName },
    ],
    fileName,
    status: document.status,
    displayStatus: document.display_status || getDisplayStatus(document.status),
    rejectionRemark: document.remark ?? undefined,
    onBackClick: handleBackClick,
    versionOptions,
    selectedVersion: String(selectedVersion),
    onVersionChange: (value: any) => fetchDocumentDetails(Number(value)),
    onSubmit: showSubmit ? handleSaveMetadata : undefined,
    extraActions: extraActions.length > 0 ? extraActions : undefined,
  };

  const fileUrl =
    document.file?.file_path && config.docBaseUrl
      ? `${config.docBaseUrl.replace(/\/$/, "")}${document.file.file_path}`
      : "";

  return (
    <AwaitingApprovalDocumentLayout
      headerProps={headerProps}
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