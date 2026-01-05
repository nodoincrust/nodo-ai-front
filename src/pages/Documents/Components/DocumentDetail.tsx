import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "./DocumentLayout";
import { getDocumentById } from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import type { DocumentHeaderProps, ApiDocument } from "../../../types/common";
import "./Styles/DocumentLayout.scss";


// Dummy data for UI design
const DUMMY_DOCUMENT: ApiDocument = {
  document_id: 99283,
  status: "APPROVED",
  current_version: 1,
  version: {
    version_number: 1,
    file_name: "Q3_Financial_Report.pdf",
    file_size_bytes: 2456789,
    tags: ["Financials", "Q3 2023", "Confidential", "Sales"],
    summary: "This document outlines the Q3 financial performance, highlighting a 15% increase in recurring revenue driven by enterprise adoption. Key risks identified include market volatility in the APAC region and supply chain disruptions affecting hardware delivery timelines.",
  },
};

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<ApiDocument | null>(DUMMY_DOCUMENT);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [useDummyData] = useState(true); // Toggle to use dummy data

  const getFileType = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  useEffect(() => {
    if (!useDummyData && id) {
      fetchDocument();
    }
  }, [id, useDummyData]);

  const fetchDocument = async () => {
    if (!id) return;

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

  if (!document) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>Loading document...</p>
      </div>
    );
  }

  const fileName = document.version?.file_name || "Unknown Document";
  const status = document.status;
  const documentTitle = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension for display

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

  return (
    <DocumentLayout 
      headerProps={headerProps} 
      showSummarySidebar={true}
      showChatSidebar={true}
    >
      <div className="document-viewer">
        <div className="document-content">
          {/* Document Title Section */}
          <div className="document-title-section">
            <h1 className="document-main-title">{documentTitle}</h1>
            <div className="document-meta">
              <span className="document-confidential">CONFIDENTIAL</span>
              <span className="document-id">Doc ID: #{document.document_id}-AX</span>
            </div>
          </div>

          <div className="document-divider"></div>

          {/* Document Introduction */}
          <div className="document-intro">
            <p>
              This document provides a comprehensive overview of the financial performance 
              for the third quarter of the fiscal year 2023. Key metrics indicate a significant 
              uptick in recurring revenue streams, driven primarily by the expansion of our 
              enterprise tier offerings.
            </p>
          </div>

          {/* Bar Chart Placeholder */}
          <div className="document-chart">
            <div className="chart-container">
              <div className="chart-bar" style={{ height: "40%" }}></div>
              <div className="chart-bar" style={{ height: "60%" }}></div>
              <div className="chart-bar" style={{ height: "80%" }}></div>
              <div className="chart-bar" style={{ height: "100%" }}></div>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="document-section">
            <h2 className="document-section-title">Executive Summary</h2>
            <p>
              Despite macroeconomic headwinds, the organization has demonstrated resilience. 
              Operating margins have improved by 150 basis points due to strategic cost 
              optimization initiatives implemented in Q1.
            </p>
          </div>

          {/* Additional Content Placeholder */}
          <div className="document-section">
            <p>
              The financial results reflect strong execution across all business units, 
              with particular strength in our software-as-a-service offerings. Customer 
              retention rates have remained above 95%, indicating strong product-market fit 
              and customer satisfaction.
            </p>
          </div>

          {/* Document Preview Component - Commented out for now as it requires fileUrl */}
          {/* {document.version?.file_name && (
            <div className="document-preview">
              <DocumentPreview 
                fileName={document.version.file_name}
                fileUrl="https://example.com/documents/Q3_Financial_Report.pdf"
              />
            </div>
          )} */}
        </div>
      </div>
    </DocumentLayout>
  );
};

export default DocumentDetail;
