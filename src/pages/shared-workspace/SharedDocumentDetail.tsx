import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "../Documents/Components/DocumentLayout";
import DocumentPreview from "../Documents/DocumentPreview";
import {
  getDocumentById,
} from "../../services/documents.service";
import { getLoaderControl } from "../../CommonComponents/Loader/loader";
import type {
  DocumentHeaderProps,
  ApiDocument,
} from "../../types/common";
import "../Documents/Components/Styles/DocumentLayout.scss";

const SharedDocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<string[]>([]);

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
      setActiveTags(doc.summary?.tags ?? []);
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
    // Navigate back to shared workspace
    navigate("/sharedworkspace", {
      state: {
        sharedFilter: "DOCUMENTS",
        page: location.state?.page || 1,
      },
    });
  };

  if (isLoading || !document) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading document...
      </div>
    );
  }

  const isTextFile = ["txt"].includes(
    document.version?.file_name?.split(".").pop()?.toLowerCase() || ""
  );

  const headerProps: DocumentHeaderProps = {
    breadcrumb: [
      { label: "Shared Workspace", path: "/sharedworkspace" },
      { label: document.version?.file_name || "Unknown Document" },
    ],
    fileName: document.version?.file_name || "Unknown Document",
    // No version switching for shared documents (read-only)
    onBackClick: handleBackClick,
  };

  return (
    <DocumentLayout
      headerProps={headerProps}
      showSummarySidebar={true}
      showChatSidebar={false} // No chat sidebar for shared documents
      document={document}
      suggestedTags={[]}
      activeTags={activeTags}
      // Remove all edit/save/regenerate handlers - read-only mode
      onSummaryChange={undefined}
      onAddTag={undefined}
      onRemoveTag={undefined}
      onCreateTag={undefined}
      onSaveMetadata={undefined}
      onRegenerate={undefined}
      onSendMessage={undefined}
      onEditSummaryClick={undefined}
      onWriteOwnSummaryClick={undefined}
      isUserWrittenSummary={false}
    >
      <div className="document-viewer">
        <DocumentPreview
          fileName={document.version?.file_name || "Unknown Document"}
          fileUrl={document.version?.file_url || ""}
        />
      </div>
    </DocumentLayout>
  );
};

export default SharedDocumentDetail;

