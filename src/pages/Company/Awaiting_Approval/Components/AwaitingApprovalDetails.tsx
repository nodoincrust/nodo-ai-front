import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";

import AwaitingApprovalDocumentLayout from "./AwaitingApprovalDocumentLayout";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import DocumentPreview from "../../../Documents/DocumentPreview";
import { getRoleFromToken } from "../../../../utils/jwt";
import { getDocumentById } from "../../../../services/documents.service";
import { API_URL } from "../../../../utils/API";

import {
  ApiDocument,
  ApiDocumentVersion,
  DocumentHeaderAction,
  DocumentHeaderProps,
} from "../../../../types/common";

import {
  approveDocumentByID,
  getAwaitingApprovalDetails,
  rejectDocumentByID,
} from "../../../../services/awaitingApproval.services";

import { config } from "../../../../config";
import OnlyOfficeEditor from "../../../Documents/Components/OnlyofficeEditor";

const AwaitingApprovalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const previousState = location.state as any;

  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<number>();
  const [tracking, setTracking] = useState<any>(null);
  const ONLYOFFICE_PREVIEW_TYPES = ["xlsx", "xls", "ppt", "pptx"];
  /* ------------------------------ Fetch Document ------------------------------ */
  useEffect(() => {
    if (id) fetchDocumentDetails(selectedVersion);
  }, [id, reloadKey, selectedVersion]);

  const fetchDocumentDetails = async (version?: number) => {
    if (!id) return;

    setIsLoading(true);
    getLoaderControl()?.showLoader();

    try {
      const res = await getAwaitingApprovalDetails(id, version);
      const data = res.data?.data;

      if (!data) throw new Error("Document not found");

      /* ---------- File URL ---------- */
      let fileUrl = "";
      if (data.file?.file_url) {
        fileUrl = data.file.file_url;
      } else if (data.file?.file_path) {
        const baseUrl = config.docBaseUrl.replace(/\/$/, "");
        const path = data.file.file_path.startsWith("/")
          ? data.file.file_path
          : `/${data.file.file_path}`;
        fileUrl = `${baseUrl}${path}`;
      }

      /* ---------- Status Mapping ---------- */
      const mappedStatus: ApiDocument["status"] =
        data.review?.status === "PENDING"
          ? "IN_REVIEW"
          : data.review?.status === "APPROVED"
            ? "APPROVED"
            : data.review?.status === "REJECTED"
              ? "REJECTED"
              : "IN_REVIEW";

      const docVersion: ApiDocumentVersion = {
        version_number: data.file?.version_number || 1,
        file_name: data.file?.file_name || "",
        file_url: fileUrl,
        summary: data.summary?.text || "",
        tags: data.summary?.tags || [],
        file_size_bytes: data.file?.file_size_bytes || 0,
      };

      const token = localStorage.getItem("accessToken");
      let isPrivileged = false;
      try {
        const authDataStr = localStorage.getItem("authData");
        const authData = authDataStr ? JSON.parse(authDataStr) : {};
        if (authData?.is_department_head) isPrivileged = true;
        const role = token ? getRoleFromToken(token)?.toUpperCase() : null;
        if (role === "COMPANY_ADMIN" || role === "COMPANY_HEAD")
          isPrivileged = true;
      } catch (err) {
        console.warn("Could not parse Data from localStorage:", err);
      }

      if (isPrivileged) {
        try {
          const doc = await getDocumentById(Number(id), version);
          if (
            (!doc.version.file_url || doc.version.file_url === "") &&
            doc.editor?.token
          ) {
            doc.version.file_url = API_URL.onlyOfficeFileStream(
              doc.editor.token,
            );
          }
          setSelectedVersion(doc.version.version_number);
          setDocument(doc);
          setTracking((doc as any).tracking);
          return;
        } catch (err) {
          console.warn("Failed to fetch privileged docuemnt data:", err);
        }
      }

      setSelectedVersion(docVersion.version_number);

      setDocument({
        document_id: data.document.id,
        status: mappedStatus,
        display_status: data.document.display_status,
        current_version: data.document.current_version,
        is_actionable: data.document.is_actionable,
        version: docVersion,
      });
      setTracking(data.tracking);
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message || "Could not load document details",
      });
      navigate("/documents");
    } finally {
      setIsLoading(false);
      getLoaderControl()?.hideLoader();
    }
  };

  /* ------------------------------ Handlers ------------------------------ */
  const handleBackClick = () => {
    navigate("/documents", {
      state: {
        documentFilter: previousState?.documentFilter || "AWAITING",
        status: previousState?.status || "all",
        page: previousState?.page || 1,
      },
    });
  };

  const handleSummaryChange = (summary: string) => {
    setDocument((prev) =>
      prev ? { ...prev, version: { ...prev.version, summary } } : prev,
    );
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

  /* ------------------------------ Loading ------------------------------ */
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

  /* ------------------------------ Header ------------------------------ */
  const extraActions: DocumentHeaderAction[] = document.is_actionable
    ? []
    : [
        { label: "Reject", type: "danger", onClick: () => {} },
        { label: "Approve", type: "primary", onClick: handleApprove },
      ];

  const versionOptions = Array.from(
    { length: document.current_version || 1 },
    (_, i) => ({
      label: `V${i + 1}`,
      value: i + 1,
    }),
  );

  const headerProps: any = {
    breadcrumb: [
      { label: "Awaiting Approval", path: "/documents" },
      { label: document.version.file_name || "Document" },
    ],
    fileName: document.version.file_name || "",
    status: document.display_status,
    onBackClick: handleBackClick,
    versionOptions,
    selectedVersion,
    onVersionChange: (val: number) => setSelectedVersion(val),
    extraActions,
    tracking,
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <AwaitingApprovalDocumentLayout
      headerProps={{ ...headerProps, onReject: handleReject }}
      document={document}
      onSummaryChange={handleSummaryChange}
    >
      <div className="document-viewer">
        {/* Determine file extension and whether the current user is privileged (dept head / company admin) */}
        {(() => {
          const fileExtension = document.version.file_name
            ?.split(".")
            .pop()
            ?.toLowerCase();
          const token = localStorage.getItem("accessToken");
          let currentUserPrivileged = false;
          try {
            const authDataStr = localStorage.getItem("authData");
            const authData = authDataStr ? JSON.parse(authDataStr) : {};
            if (authData?.is_department_head) currentUserPrivileged = true;
            const role = token ? getRoleFromToken(token)?.toUpperCase() : null;
            if (role === "COMPANY_ADMIN" || role === "COMPANY_HEAD")
              currentUserPrivileged = true;
          } catch (err) {
            console.warn("Failed to parse the data form localStorage:", err);
          }

          // If the user is privileged and the file type is previewable, prefer OnlyOffice viewer (view mode)
          if (
            currentUserPrivileged &&
            ONLYOFFICE_PREVIEW_TYPES.includes(fileExtension || "") &&
            (document as any).editor
          ) {
            console.info(
              "AwaitingApproval: rendering OnlyOfficeEditor for privileged user",
              {
                documentId: document.document_id,
                file: document.version.file_name,
              },
            );
            return (
              <OnlyOfficeEditor
                editor={{
                  ...(document as any).editor,
                  editorConfig: {
                    ...(document as any).editor?.editorConfig,
                    mode: "view",
                  },
                }}
                canEdit={false}
              />
            );
          }

          // Fallback to existing file preview
          if (document.version.file_url) {
            return (
              <DocumentPreview
                fileName={document.version.file_name}
                fileUrl={document.version.file_url}
              />
            );
          }

          return (
            <div className="document-placeholder">
              <span className="document-placeholder-label">
                Document preview not available
              </span>
            </div>
          );
        })()}
      </div>
    </AwaitingApprovalDocumentLayout>
  );
};

export default AwaitingApprovalDetails;
