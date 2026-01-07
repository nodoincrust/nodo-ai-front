import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "./DocumentLayout";
import DocumentPreview from "../DocumentPreview";
import SubmitDocument from "./submitDocument";
import {
  getDocumentById,
  regenerateSummary,
  saveDocumentMetadata,
  submitDocumentForReview,
  getAssignableEmployees,
} from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import type {
  DocumentHeaderProps,
  ApiDocument,
  AssignableEmployee,
} from "../../../types/common";
import "./Styles/DocumentLayout.scss";

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const autoSummaryTriggeredRef = useRef(false);
  const [assignableEmployees, setAssignableEmployees] = useState<
    AssignableEmployee[]
  >([]);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);

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
    setDocument((prev) => {
      if (!prev) return prev;

      const currentTags = prev.version.tags || [];
      if (currentTags.includes(tag)) return prev;

      return {
        ...prev,
        version: {
          ...prev.version,
          tags: [...currentTags, tag],
        },
      };
    });
  };

  const handleRemoveTag = (tag: string) => {
    setDocument((prev) => {
      if (!prev) return prev;

      const currentTags = prev.version.tags || [];
      return {
        ...prev,
        version: {
          ...prev.version,
          tags: currentTags.filter((t) => t !== tag),
        },
      };
    });
  };

  const handleCreateTag = (tag: string) => {
    // Update document tags as well when a new tag is created
    setDocument((prev) => {
      if (!prev) return prev;

      const currentTags = prev.version.tags || [];
      if (currentTags.includes(tag)) return prev;

      return {
        ...prev,
        version: {
          ...prev.version,
          tags: [...currentTags, tag],
        },
      };
    });

    notification.success({ message: `Tag "${tag}" created` });
  };

  const handleSaveMetadata = async () => {
    if (!document) return;

    const payload = {
      summary: document.version?.summary ?? "",
      tags: (document.version?.tags ?? []).filter(Boolean),
    };

    try {
      getLoaderControl()?.showLoader();

      await saveDocumentMetadata(document.document_id, payload);

      notification.success({
        message: "Metadata saved successfully",
      });
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

    // Don't show global loader - let SummarySidebar show its own loader
    notification.info({
      message: "Regenerating summary",
      description: "AI is generating a new summary...",
    });

    try {
      const response = await regenerateSummary(docId);

      /**
       * Actual API response structure:
       * {
       *   status: "success",
       *   refined: true,
       *   summary: "The document provides information...",
       *   tags: ["Rahul Gote", "Software Developer"],
       *   citations: [{page_number: 1}]
       * }
       */

      const newSummary = response?.summary || response?.data?.summary;
      const newTags = response?.tags || response?.data?.tags || [];

      // ✅ Update document state immutably
      setDocument((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          version: {
            ...prev.version,
            summary: newSummary ?? prev.version.summary,
            tags: newTags.length > 0 ? newTags : prev.version.tags,
          },
        };
      });

      notification.success({
        message: "Summary regenerated successfully",
      });
    } catch (error: any) {
      notification.error({
        message: "Failed to regenerate summary",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong",
      });
    }
  };

  // Handler for ChatSidebar
  const handleSendMessage = async (message: string, documentId: number) => {
    // TODO: Implement API call to send chat message
    // This should call the chat API and update messages
    console.log("Sending message:", message, "for document:", documentId);
    // Placeholder: You'll need to implement the actual API call here
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
  const status = document.status;
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

  const headerProps: DocumentHeaderProps = {
    breadcrumb: [
      { label: "Documents", path: "/documents" },
      { label: fileName },
    ],
    fileName: documentTitle,
    status,
    onBackClick: handleBackClick,
    versionOptions: versionOptions,
    selectedVersion: String(selectedVersion),
    onVersionChange: (value: string) => handleVersionChange(Number(value)),
    // Only show submit button when status is DRAFT
    onSubmit: status === "DRAFT" ? handleSubmit : undefined,
  };
  console.log(
    "Document status:",
    status,
    "isSubmitModalOpen:",
    isSubmitModalOpen
  );
  console.log(fileUrl);
  return (
    <>
      <DocumentLayout
        headerProps={headerProps}
        showSummarySidebar={true}
        showChatSidebar={true}
        document={document}
        onSummaryChange={handleSummaryChange}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
        onSaveMetadata={handleSaveMetadata}
        onRegenerate={handleRegenerate}
        onSendMessage={handleSendMessage}
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
        }))}
        loading={isEmployeeLoading}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleDocumentSubmission}
      />
    </>
  );
};

export default DocumentDetail;
