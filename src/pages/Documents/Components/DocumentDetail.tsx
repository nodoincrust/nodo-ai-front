import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "./DocumentLayout";
import DocumentPreview from "../DocumentPreview";
import SubmitDocument from "./submitDocument";
import {
  getDocumentById,
  startSummary,
  pollSummaryStatus,
  saveDocumentMetadata,
  submitDocumentForReview,
  getAssignableEmployees,
  getAiChatResponse,
} from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { getRoleFromToken } from "../../../utils/jwt";
import type {
  DocumentHeaderProps,
  ApiDocument,
  AssignableEmployee,
  DocumentHeaderAction,
} from "../../../types/common";
import "./Styles/DocumentLayout.scss";

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false);

  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const autoSummaryTriggeredRef = useRef(false);
  const [assignableEmployees, setAssignableEmployees] = useState<
    AssignableEmployee[]
  >([]);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [isMetadataSaved, setIsMetadataSaved] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    if (!id) return;

    setIsLoading(true);
    getLoaderControl()?.showLoader();
    try {
      const doc = await getDocumentById(Number(id));
      setDocument(doc);
      // Set suggested tags from API (AI-generated suggestions)
      setSuggestedTags(doc.version?.tags || []);
      // Active tags start empty - user must manually select them
      setActiveTags([]);
      if (doc?.current_version) {
        setSelectedVersion(doc.current_version);
      }
    } catch (error: any) {
      notification.error({
        message: "Failed to load document",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Could not load document details.",
      });
      navigate("/documents");
    } finally {
      setIsLoading(false);
      getLoaderControl()?.hideLoader();
    }
  };

  const handleBackClick = () => {
    navigate("/documents");
  };

  const handleVersionChange = (version: number) => {
    setSelectedVersion(version);
    // Optionally fetch version-specific data here
  };

  const handleSubmit = async () => {
    setIsEmployeeLoading(true);
    try {
      const employees = await getAssignableEmployees();
      setAssignableEmployees(employees);
      setIsSubmitModalOpen(true);
    } catch (error: any) {
      notification.error({
        message: "Failed to fetch employees",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Could not load employees list.",
      });
    } finally {
      setIsEmployeeLoading(false);
    }
  };

  const handleDocumentSubmission = async (selectedReviewers: number[]) => {
    if (!document) return;

    try {
      getLoaderControl()?.showLoader();

      // ✅ REAL API CALL USING SELECTED EMPLOYEES
      await submitDocumentForReview(
        document.document_id,
        selectedReviewers // ← from hierarchy API
      );

      // Update document status
      setDocument((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "SUBMITTED" as const,
        };
      });

      notification.success({
        message: "Document submitted successfully",
        description: `Document has been submitted to ${selectedReviewers.length} reviewer(s).`,
      });

      setIsSubmitModalOpen(false);
      fetchDocument();
    } catch (error: any) {
      notification.error({
        message: "Failed to submit document",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong",
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  const handleSummaryChange = (summary: string) => {
    setIsMetadataSaved(false);
    setDocument((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        version: {
          ...prev.version,
          summary,
        },
      };
    });
  };

  const handleAddTag = (tag: string) => {
    setIsMetadataSaved(false);
    // Add to active tags if not already present
    setActiveTags((prev) => {
      if (prev.includes(tag)) return prev;
      return [...prev, tag];
    });
  };

  const handleRemoveTag = (tag: string) => {
    setIsMetadataSaved(false);
    // Remove from active tags
    setActiveTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleCreateTag = (tag: string) => {
    setIsMetadataSaved(false);
    // Add newly created tag to active tags
    setActiveTags((prev) => {
      if (prev.includes(tag)) return prev;
      return [...prev, tag];
    });

    notification.success({ message: `Tag "${tag}" created` });
  };

  const handleSaveMetadata = async () => {
    if (!document) return;

    const payload = {
      summary: document.version?.summary ?? "",
      tags: activeTags.filter(Boolean),
    };

    try {
      getLoaderControl()?.showLoader();

      await saveDocumentMetadata(document.document_id, payload);

      notification.success({
        message: "Metadata saved successfully",
      });
      setIsMetadataSaved(true);
    } catch (error: any) {
      notification.error({
        message: "Failed to save metadata",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong",
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  const handleRegenerate = async (documentId?: number) => {
    const docId = documentId || document?.document_id;
    if (!docId) return;

    notification.info({
      message: "Generating summary",
      description: "AI is analyzing the document...",
    });

    try {
      const jobId = await startSummary(docId);
      setIsSummaryGenerating(true);
      pollSummaryStatus(
        jobId,
        (result) => {
          // Check if chunks are not ready yet
          if (
            result?.status === "processing" ||
            result?.message?.includes("Chunks not ready")
          ) {
            setIsSummaryGenerating(false);
            notification.error({
              message: "Summary generation failed",

              duration: 0,
            });
            return;
          }

          // Check if summary is actually available
          if (!result?.summary) {
            setIsSummaryGenerating(false);
            notification.error({
              message: "Summary generation failed",

              duration: 0,
            });
            return;
          }

          // Success case - update document with summary
          setDocument((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              version: {
                ...prev.version,
                summary: result.summary,
              },
            };
          });
          // Update suggested tags from AI result, but don't auto-add to active tags
          if (result.tags) {
            setSuggestedTags(result.tags);
          }
          setIsSummaryGenerating(false);
          notification.success({
            message: "Summary generated",
            description: "AI summary has been generated successfully.",
            duration: 0,
          });
        },
        (err) => {
          setIsSummaryGenerating(false);
          notification.error({
            message: "Summary failed",
            description: String(err),
            duration: 0,
          });
        }
      );
    } catch (err) {
      setIsSummaryGenerating(false);
      notification.error({
        message: "Failed to start summary",
      });
    }
  };

  // Handler for ChatSidebar
  const handleSendMessage = async (message: string, documentId: number) => {
    try {
      const response = await getAiChatResponse(documentId, message);

      return {
        text: response.answer,
        sessionId: response.session_id,
        citations: response.citations,
      };
    } catch (error: any) {
      notification.error({
        message: "AI Chat failed",
        description:
          error?.response?.data?.message || "Unable to get response from AI",
      });

      throw error;
    }
  };

  // Handler for Re-Upload button
  const handleReupload = () => {
    if (!document) return;

    // TODO: Implement reupload functionality
    // This could open a file upload modal or navigate to upload page
    notification.info({
      message: "Re-Upload Document",
      description:
        "Re-upload functionality will be implemented here. You can upload a new version of this document.",
    });

    // For now, you could navigate to documents list or open upload modal
    // navigate("/documents");
  };

  // Auto-trigger regenerate summary once if there is no summary yet
  // MUST be after all other hooks but before any conditional returns
  useEffect(() => {
    if (autoSummaryTriggeredRef.current) return;
    if (!document) return;
    if (isLoading) return;

    // Check if summary is missing or empty
    const hasNoSummary =
      !document.version?.summary || document.version.summary.trim() === "";

    if (hasNoSummary && document.document_id) {
      autoSummaryTriggeredRef.current = true;
      // Automatically trigger summary regeneration
      void handleRegenerate(document.document_id);
    }
  }, [document, isLoading]);

  // Early return AFTER all hooks
  if (isLoading || !document) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>Loading document...</p>
      </div>
    );
  }

  const fileName = document.version?.file_name || "Unknown Document";
  const documentStatus = document.status;
  const documentTitle = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension for display

  // Get file URL from version (already processed in service to be full URL)
  const fileUrl = document.version?.file_url || "";

  // Create version options (assuming we might have multiple versions)
  const versionOptions = Array.from(
    { length: document.current_version || 1 },
    (_, i) => ({
      value: String(i + 1),
      label: `V${i + 1}`,
    })
  );

  // Get user role from token and authData
  const getUserRole = (): "EMPLOYEE" | "DEPARTMENT_HEAD" | "COMPANY_HEAD" => {
    const token = localStorage.getItem("accessToken");
    if (!token) return "EMPLOYEE";

    // Check authData for is_department_head flag
    try {
      const authDataStr = localStorage.getItem("authData");
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        if (authData.is_department_head) {
          return "DEPARTMENT_HEAD";
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }

    const role = getRoleFromToken(token);
    // Normalize role to uppercase
    const normalizedRole = role?.toUpperCase();

    if (normalizedRole === "DEPARTMENT_HEAD") {
      return "DEPARTMENT_HEAD";
    }
    if (
      normalizedRole === "COMPANY_HEAD" ||
      normalizedRole === "COMPANY_ADMIN"
    ) {
      return "COMPANY_HEAD";
    }
    return "EMPLOYEE";
  };

  const userRole = getUserRole();

  // Map document status to DocumentStatus type (IN_REVIEW -> SUBMITTED)
  // Normalize status to handle case variations
  const normalizedStatus = documentStatus?.toUpperCase();
  let status: DocumentHeaderProps["status"];

  if (normalizedStatus === "IN_REVIEW") {
    status = "SUBMITTED";
  } else if (normalizedStatus === "APPROVED") {
    status = "APPROVED";
  } else if (normalizedStatus === "REJECTED") {
    status = "REJECTED";
  } else if (normalizedStatus === "DRAFT") {
    status = "DRAFT";
  } else if (normalizedStatus === "SUBMITTED") {
    status = "SUBMITTED";
  } else {
    // Default to DRAFT if status is missing or invalid
    status = "DRAFT";
    console.warn(
      "Unknown document status:",
      documentStatus,
      "- defaulting to DRAFT"
    );
  }

  // Build extra actions based on user role and document status
  const extraActions: DocumentHeaderAction[] = [];

  // Re-Upload button for employees when document is rejected
  if (status === "REJECTED") {
    extraActions.push({
      label: "Re-Upload",
      onClick: handleReupload,
      type: "default",
    });
  }

  const headerProps: DocumentHeaderProps = {
    breadcrumb: [
      { label: "Documents", path: "/documents" },
      { label: fileName },
    ],
    fileName: documentTitle,
    status,
    displayStatus: document.display_status,
    rejectionRemark: document.remark,
    onBackClick: handleBackClick,
    versionOptions: versionOptions,
    selectedVersion: String(selectedVersion),
    onVersionChange: (value: string) => handleVersionChange(Number(value)),
    // Only show submit button when status is DRAFT (no role restriction)
    onSubmit: status === "DRAFT" ? handleSubmit : undefined,
    // Disable submit until metadata has been saved at least once
    submitDisabled: status === "DRAFT" && !isMetadataSaved,
    extraActions: extraActions.length > 0 ? extraActions : undefined,
  };
  console.log(
    "Document status:",
    status,
    "isSubmitModalOpen:",
    isSubmitModalOpen
  );
  console.log("Document remark:", document.remark);
  console.log("Rejection remark passed to header:", document.remark);
  console.log("Extra actions:", extraActions);
  console.log(fileUrl);
  return (
    <>
      <DocumentLayout
        headerProps={headerProps}
        showSummarySidebar={true}
        showChatSidebar={true}
        document={document}
        suggestedTags={suggestedTags}
        activeTags={activeTags}
        onSummaryChange={handleSummaryChange}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
        onSaveMetadata={handleSaveMetadata}
        onRegenerate={handleRegenerate}
        onSendMessage={handleSendMessage}
        isSummaryGenerating={isSummaryGenerating}
      >
        <div className="document-viewer">
          {fileUrl && document.version?.file_name ? (
            <DocumentPreview
              fileName={document.version.file_name}
              fileUrl={fileUrl}
            />
          ) : (
            <div className="document-placeholder">
              <span className="document-placeholder-label">
                Document preview not available
              </span>
            </div>
          )}
        </div>
      </DocumentLayout>

      <SubmitDocument
        open={isSubmitModalOpen}
        reviewers={assignableEmployees.map((emp) => ({
          id: emp.user_id,
          name: emp.name,
          role: emp.role,
          self: emp.self,
        }))}
        loading={isEmployeeLoading}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleDocumentSubmission}
      />
    </>
  );
};

export default DocumentDetail;
