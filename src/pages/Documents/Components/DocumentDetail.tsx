import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "./DocumentLayout";
import DocumentPreview from "../DocumentPreview";
import { getDocumentById } from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import type { DocumentHeaderProps, ApiDocument } from "../../../types/common";
import "./Styles/DocumentLayout.scss";


const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSubmit = () => {
    notification.success({ 
      message: "Document submitted successfully",
      description: "Your document has been submitted for review."
    });
  };

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
    status: status,
    onBackClick: handleBackClick,
    versionOptions: versionOptions,
    selectedVersion: String(selectedVersion),
    onVersionChange: (value: string) => handleVersionChange(Number(value)),
    onSubmit: handleSubmit,
  };

  // Handlers for SummarySidebar
  const handleSummaryChange = (summary: string) => {
    // TODO: Implement API call to update summary
    if (document?.version) {
      document.version.summary = summary;
    }
  };

  const handleAddTag = (tag: string) => {
    // TODO: Implement API call to add tag
    if (document?.version?.tags && !document.version.tags.includes(tag)) {
      document.version.tags.push(tag);
    }
  };

  const handleRemoveTag = (tag: string) => {
    // TODO: Implement API call to remove tag
    if (document?.version?.tags) {
      document.version.tags = document.version.tags.filter((t) => t !== tag);
    }
  };

  const handleCreateTag = (tag: string) => {
    // TODO: Implement API call to create new tag
    notification.success({ message: `Tag "${tag}" created` });
  };

  const handleSaveMetadata = () => {
    // TODO: Implement API call to save metadata
    notification.success({ message: "Metadata saved successfully" });
  };

  const handleRegenerate = () => {
    // TODO: Implement API call to regenerate summary
    notification.info({ message: "Regenerating summary..." });
  };

  // Handler for ChatSidebar
  const handleSendMessage = async (message: string, documentId: number) => {
    // TODO: Implement API call to send chat message
    // This should call the chat API and update messages
    console.log("Sending message:", message, "for document:", documentId);
    // Placeholder: You'll need to implement the actual API call here
  };
console.log(fileUrl)
  return (
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
  );
};

export default DocumentDetail;
