import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";
import DocumentLayout from "../Documents/Components/DocumentLayout";
import DocumentPreview from "../Documents/DocumentPreview";
import SubmitDocument from "../Documents/Components/submitDocument";
import EditSummary from "../Documents/Components/EditSummary";
import WriteownSummary from "../Documents/Components/WriteownSummary";
import {
  getDocumentById,
  startSummary,
  pollSummaryStatus,
  saveDocumentMetadata,
  submitDocumentForReview,
  getAssignableEmployees,
  getAiChatResponse,
} from "../../services/documents.service";
import { getLoaderControl } from "../../CommonComponents/Loader/loader";
import { getRoleFromToken } from "../../utils/jwt";
import type {
  DocumentHeaderProps,
  ApiDocument,
  AssignableEmployee,
  DocumentHeaderAction,
} from "../../types/common";
import "../Documents/Components/Styles/DocumentLayout.scss";
import AddDocument from "../Documents/Components/AddDocument";

const SharedBouquetDocumentDetails: React.FC = () => {
  const { id, bouquetId: bouquetIdParam } = useParams<{
    id: string;
    bouquetId: string;
  }>();
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);

  const [tracking, setTracking] = useState<any>(null);

  const navState = location.state as any;
  const bouquetId = bouquetIdParam || navState?.bouquetId;

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



      setSelectedVersion(
        version ?? doc.version?.version_number ?? doc.current_version,
      );
      setTracking(doc.tracking);
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
    const sharedFilter = navState?.sharedFilter;
    const sharedPage = navState?.page;
    const status = navState?.status;

    navigate("/sharedworkspace/bouquets/documents", {
      state: {
        bouquetId,
        status,
        page: sharedPage || 1,
        sharedFilter: sharedFilter || "BOUQUETS",
      },
    });
  };

  const handleVersionChange = (version: number) => {
    setSelectedVersion(version);
    fetchDocument(version);
  };

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
  const documentTitle = fileName.replace(/\.[^/.]+$/, "");

  const versionOptions = Array.from(
    { length: document.current_version || 1 },
    (_, i) => ({
      value: String(i + 1),
      label: `V${i + 1}`,
    }),
  );

  const getUserRole = (): "EMPLOYEE" | "DEPARTMENT_HEAD" | "COMPANY_HEAD" => {
    const token = localStorage.getItem("accessToken");
    if (!token) return "EMPLOYEE";

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
  }

  const extraActions: DocumentHeaderAction[] = [];

  const hideSubmit = status === "REUPLOADED";

  const headerProps: DocumentHeaderProps = {
    breadcrumb: [
      { label: "Shared Workspace", path: "/sharedworkspace" },
      { label: "Documents", path: "/sharedworkspace/bouquets/documents" },
      { label: fileName },
    ],
    fileName: documentTitle,
    status,
    displayStatus: document.display_status,
    rejectionRemark: document.remark,
    onBackClick: handleBackClick,
    // versionOptions: versionOptions,
    // selectedVersion: String(selectedVersion),

   
  };

  return (
    <>
      <DocumentLayout
        headerProps={headerProps}
        showSummarySidebar={true}
        showChatSidebar={false}
        document={document}
        suggestedTags={[]}
        activeTags={activeTags}
        readOnlySummary={true}
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
    </>
  );
};

export default SharedBouquetDocumentDetails;
