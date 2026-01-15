import { useEffect, useState } from "react";
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
import { ApiDocument, DocumentHeaderAction } from "../../../types/common";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { approveDocumentByID, getAwaitingApprovalDetails, rejectDocumentByID } from "../../../services/awaitingApproval.services";
import { config } from "../../../config";
import AwaitingApprovalDocumentLayout from "../../Company/Awaiting_Approval/Components/AwaitingApprovalDocumentLayout";
import DocumentPreview from "../DocumentPreview";

const AwaitingApprovalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state as any;

  const [document, setDocument] = useState<ApiDocument | null>(null);
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

  const handleEdit = () => {
    notification.info({
      message: "Edit Mode Enabled",
      description: "You can now edit this document.",
    });}

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
          <p>Document not found</p>
        </div>
      </div>
    );
  }

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

  // if (status === "DRAFT" && document.version?.file_name?.endsWith(".txt")) {
  //   extraActions.push({
  //     label: "Edit",
  //     onClick: () => setIsEditMode(true),
  //     type: "default",
  //   });
  // }

  
  // if (status === "DRAFT" && document.version?.file_name?.endsWith(".txt")) {
  //   extraActions.push({
  //     label: "Save",
  //     onClick: () => setIsEditMode(true),
  //     type: "default",
  //   });
  // }
  const hideSubmit = status === "REUPLOADED";

  const headerProps: DocumentHeaderProps = {
  const headerProps: any = {
    breadcrumb: [
      { label: "Documents", path: "/documents" },
      { label: fileName },
    ],
    fileName,
    status: document.status,
    displayStatus: document.display_status,
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