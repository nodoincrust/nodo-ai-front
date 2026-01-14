import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import AddDocument from "./AddDocument";
import { config } from "../../../config";

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  //edit document propose
  const [isEditMode, setIsEditMode] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);

  const [isReuploadOpen, setIsReuploadOpen] = useState(false);
  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async (version?: number) => {
    if (!id) return;

    setIsLoading(true);
    getLoaderControl()?.showLoader();

    try {
      const doc = await getDocumentById(Number(id), version);
      setDocument(doc);

      setSuggestedTags(doc.summary?.tags ?? []);
      setActiveTags(doc.summary?.tags ?? []);
      console.log("API summary tags:", doc.summary?.tags);

      setSelectedVersion(version ?? doc.version?.version_number ?? doc.current_version);

    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to load document details.",
      });
    } finally {
      setIsLoading(false);
      getLoaderControl()?.hideLoader();
    }
  };

  const handleBackClick = () => {
    navigate("/documents", {
      state: location.state ?? undefined,
    });
  };

  const handleEdit = () => {
    notification.info({
      message: "Edit Mode Enabled",
      description: "You can now edit this document.",
    });

    // Example options:
    // 1. Enable editable preview
    // 2. Open editor modal
    // 3. Navigate to edit screen
    // navigate(`/documents/${document?.document_id}/edit`);
  const handleVersionChange = (version: number) => {
    setSelectedVersion(version);
    fetchDocument(version);
  };

// const handleVersionChange = async (version: number) => {
//   if (!id) return;

//   setSelectedVersion(version);
//   setIsMetadataSaved(false); // metadata already saved for old versions

//   try {
//     getLoaderControl()?.showLoader();
//     const data = await getDocumentById(Number(id), version);
//     setDocument(data);

//     // Reset tags for selected version
//     setSuggestedTags(data.version?.tags || []);
//     setActiveTags([]);
//   } catch (error) {
//     notification.error({
//       message: "Failed to load version",
//       description: "Unable to load selected document version",
//     });
//   } finally {
//     getLoaderControl()?.hideLoader();
//   }
// };



  const handleSubmit = async () => {
    setIsEmployeeLoading(true);
    try {
      const employees = await getAssignableEmployees();
      setAssignableEmployees(employees);
      setIsSubmitModalOpen(true);
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to fetch employees",
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
        // description: `Document has been submitted to ${selectedReviewers.length} reviewer(s).`,
      });

      setIsSubmitModalOpen(false);
      fetchDocument();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to submit document",
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


// const handleSave = async () => {
//   if (!document) return;

//   try {
//     getLoaderControl()?.showLoader();

//     // ✅ Convert edited text into a File
//     const blob = new Blob([textContent], { type: "text/plain" });
//     const fileName = document.version.file_name || "document.txt";
//     const file = new File([blob], fileName, { type: "text/plain" });

//     const formData = new FormData();
//     formData.append("file", file);

//     // ✅ Call REUPLOAD API (creates new version)
//     await reuploadDocument(document.document_id, formData);

//     notification.success({
//       message: "Document saved",
//       description: "A new version has been created successfully.",
//     });

//     setIsEditMode(false);
//     setTextContent("");

//     // ✅ Reload latest version
//     await fetchDocument();
//   } catch (error: any) {
//     notification.error({
//       message: "Save failed",
//       description:
//         error?.response?.data?.message ||
//         error?.response?.data?.detail ||
//         "Unable to save document",
//     });
//   } finally {
//     getLoaderControl()?.hideLoader();
//   }
// };


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
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to save metadata",
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

 const handleRegenerate = async (documentId?: number) => {
  const docId = documentId || document?.document_id;
  if (!docId) return;

  // ✅ version from dropdown
  const version = selectedVersion;

  notification.info({
    message: "Generating summary",
    description: `AI is analyzing version ${version} of the document...`,
  });

  try {
    const jobId = await startSummary(docId, version);

    setIsSummaryGenerating(true);

    pollSummaryStatus(
      jobId,
      (result) => {
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

        if (!result?.summary) {
          setIsSummaryGenerating(false);
          notification.error({
            message: "Summary generation failed",
            duration: 0,
          });
          return;
        }

        // ✅ Update summary for SAME version
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

        if (result.tags) {
          setSuggestedTags(result.tags);
        }

        setIsSummaryGenerating(false);

        notification.success({
          message: "Summary generated",
          description: `Summary generated for version ${version}`,
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
        message:
          error?.response?.data?.message || "Unable to get response from AI",
      });

      throw error;
    }
  };

  // Handler for Re-Upload button
  const handleReupload = () => {
    setIsReuploadOpen(true);
  };

  // MUST be after all other hooks but before any conditional returns
  useEffect(() => {
  if (autoSummaryTriggeredRef.current) return;
  if (!document || isLoading) return;

  // 🚫 Only for latest version
  if (selectedVersion !== document.current_version) return;

  const hasNoSummary =
    !document.version?.summary || document.version.summary.trim() === "";

  if (hasNoSummary) {
    autoSummaryTriggeredRef.current = true;
    void handleRegenerate(document.document_id);
  }
}, [document, isLoading, selectedVersion]);


  const fileUrl = document?.version?.file_url || "";
  const isTextFile = document?.version?.file_name?.endsWith(".txt");
  useEffect(() => {
    const loadTextFile = async () => {
      if (!fileUrl || !isTextFile || !isEditMode) return;

      try {
        setIsTextLoading(true);
        const response = await fetch(fileUrl);
        const text = await response.text();
        setTextContent(text);
      } catch {
        notification.error({ message: "Failed to load text file" });
      } finally {
        setIsTextLoading(false);
      }
    };

    loadTextFile();
  }, [fileUrl, isTextFile, isEditMode]);

  // Early return AFTER all hooks
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
  const fileName = document.version?.file_name || "Unknown Document";
  const documentStatus = document.status;
  const documentTitle = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension for display

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
  } else if (normalizedStatus === "REUPLOADED") {
    status = "REUPLOADED" as any;
  } else {
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
      label: "Reupload",
      onClick: handleReupload,
      type: "default",
    });
  }

  if (status === "DRAFT" && document.version?.file_name?.endsWith(".txt")) {
    extraActions.push({
      label: "Edit",
      onClick: () => setIsEditMode(true),
      type: "default",
    });
  }

  
  if (status === "DRAFT" && document.version?.file_name?.endsWith(".txt")) {
    extraActions.push({
      label: "Save",
      onClick: () => setIsEditMode(true),
      type: "default",
    });
  }
  const hideSubmit = status === "REUPLOADED";

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
    onSubmit: !hideSubmit && status === "DRAFT" ? handleSubmit : undefined,
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
          {isEditMode && isTextFile ? (
            isTextLoading ? (
              <p>Loading text...</p>
            ) : (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={25}
                style={{
                  width: "100%",
                  fontFamily: "monospace",
                  padding: "12px",
                  fontSize: "14px",
                }}
              />
            )
          ) : (
            <DocumentPreview
              fileName={document.version?.file_name || "Unknown Document"}
              fileUrl={document.version?.file_url || ""}
            />
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

      <AddDocument
        open={isReuploadOpen}
        documentId={document.document_id}
        onClose={() => setIsReuploadOpen(false)}
        onSuccess={() => {
          setIsReuploadOpen(false);
          fetchDocument(); // refresh document + version
        }}
      />
    </>
  );
};

export default DocumentDetail;
