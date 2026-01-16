import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../utils/Messages";
import { useDebounce } from "../../../hooks/useDebounce";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import { ApiDocument, Document, DocumentStatus } from "../../../types/common";
import { getDocumentsList } from "../../../services/documents.service";
import { getApprovalList } from "../../../services/awaitingApproval.services";
import AddDocument from "./AddDocument";
import "./Styles/Documents.scss";
import "../../Company/Awaiting_Approval/Components/Styles/AwaitingApproval.scss";

type DocumentFilter = "MY_DOCUMENTS" | "AWAITING";

export default function DocumentsCombined() {
  // const [documentFilter, setDocumentFilter] =
  //   useState<DocumentFilter>("MY_DOCUMENTS");
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  // const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // const [status, setStatus] = useState<any>("all");
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Restore filter/status/page from location.state or sessionStorage

   const state = location.state as any;
 
  // Lazy initialize from location.state, then sessionStorage, then default
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>(
    () => state?.documentFilter || (sessionStorage.getItem("documentFilter") as DocumentFilter) || "MY_DOCUMENTS"
  );
 
  const [status, setStatus] = useState<DocumentStatus>(
    () => state?.status || (sessionStorage.getItem("documentStatus") as DocumentStatus) || "all"
  );
 
  const [currentPage, setCurrentPage] = useState<number>(
    () => state?.page || (sessionStorage.getItem("documentPage") ? Number(sessionStorage.getItem("documentPage")) : 1)
  );
 
  useEffect(() => {
    sessionStorage.setItem("documentFilter", documentFilter);
    sessionStorage.setItem("documentStatus", status);
    sessionStorage.setItem("documentPage", currentPage.toString());
  }, [documentFilter, status, currentPage]);
 
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("documentFilter");
      sessionStorage.removeItem("documentStatus");
      sessionStorage.removeItem("documentPage");
    };
 
    window.addEventListener("beforeunload", handleBeforeUnload);
 
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
 
  // --- Helpers ---
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  // Get file type icon path
  const getFileTypeIcon = (fileName: string): string => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (!ext) return "/assets/doc_icon.svg";
    if (ext === "pdf") return "/assets/pdf_icon.svg";
    if (ext === "docx" || ext === "doc") return "/assets/doc_icon.svg";
    if (ext === "xlsm" || ext === "xlsx" || ext === "xls" || ext === "xlc")
      return "/assets/xlc_icon.svg";
    if (ext === "pptx" || ext === "ppt") return "/assets/ppt_icon.svg";
    // For image files, we can use a default or add an image icon later
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif")
      return "/assets/imag.svg";
    if (ext === "txt") return "/assets/doc icons.svg";
    // Default to doc icon for unknown types
    return "/assets/doc_icon.svg";
  };

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "DRAFT":
        return "Draft";
      case "REJECTED":
        return "Rejected";
      case "SUBMITTED":
        return "Submitted";
      case "IN_REVIEW":
        return "In Review";
      case "PENDING":
      case "AWAITING_APPROVAL":
        return "Pending";
      case "REUPLOADED":
        return "Reuploaded";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "approved";
      case "DRAFT":
        return "draft";
      case "REJECTED":
        return "rejected";
      case "SUBMITTED":
        return "submitted";
      case "PENDING":
      case "AWAITING_APPROVAL":
        return "pending";
      case "REUPLOADED":
        return "reuploaded";
      default:
        return "";
    }
  };

  // --- Fetch Functions ---
  const fetchMyDocuments = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res = await getDocumentsList({
        page: currentPage,
        size: pageSize,
        search: debouncedSearch || undefined,
        ...(status && status !== "all" ? { status: status as Exclude<DocumentStatus, "all" | "PENDING" | "REUPLOADED"> } : {}),
      });

      if (res?.data) {
        const normalizedDocuments: any = res.data.map((doc: any) => ({
          document_id: doc.document_id,
          status: doc.status,
          pending_on: doc.pending_on,
          current_version: doc.current_version,
          name: doc.version?.file_name ?? "Unknown Document",
          size: doc.version?.file_size_bytes ?? 0,
          tags: Array.isArray(doc.version?.tags) ? doc.version.tags : [],
          file_type:
            doc.version?.file_name?.split(".").pop()?.toLowerCase() ?? "doc",
        }));
        setDocumentList(normalizedDocuments);
        setCount(res.total || 0);
      } else {
        setDocumentList([]);
        setCount(0);
      }
    } catch (error: any) {
      setDocumentList([]);
      setCount(0);
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  const fetchAwaitingDocuments = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res = await getApprovalList({
        page: currentPage,
        pagelimit: pageSize,
        search: debouncedSearch || undefined,
        ...(status && status !== "all" ? { status } : {}),
      });

      if (res?.data) {
        const normalizedDocuments: Document[] = res.data.map((doc: any) => ({
          document_id: doc.document_id,
          name: doc.file_name,
          current_version: doc.version_number,
          size: 0,
          tags: [],
          file_type: doc.file_name.split(".").pop()?.toLowerCase() || "doc",
          is_approved: doc.status === "Approved",
          status: doc.status || "-",
          pending_on: doc.pending_on,
          submitted_by: doc.uploaded_by?.name || "Unknown",
          submitted_at: doc.submitted_at,
        }));
        setDocumentList(normalizedDocuments);
        setCount(res.total || 0);
      } else {
        setDocumentList([]);
        setCount(0);
      }
    } catch (error: any) {
      setDocumentList([]);
      setCount(0);
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  // --- Effects ---
  useEffect(() => {
    scrollLayoutToTop();
    if (documentFilter === "MY_DOCUMENTS") fetchMyDocuments();
    else fetchAwaitingDocuments();
  }, [currentPage, debouncedSearch, pageSize, status, documentFilter]);

  // --- Handlers ---
  const openAddDocument = () => setIsAddDocumentOpen(true);

  const handleAddDocumentSuccess = () => {
    fetchMyDocuments();
  };

  const handleViewDocument = (document: Document) => {
    if (documentFilter === "MY_DOCUMENTS")
      navigate(`/documents/${document.document_id}`);
    else
      navigate(`/awaitingApproval/${document.document_id}`, {
        state: {
          documentFilter,
          status,
          page: currentPage,
        },
      });
  };

  // --- Columns ---
  const commonColumns = [
    {
      title: "SR.NO",
      render: (_row: any, index = 0) =>
        String((currentPage - 1) * pageSize + index + 1).padStart(2, "0"),
    },
    {
      title: "DOCUMENT NAME",
      render: (row: any) => (
        <div className="document-cell">
          <div className="document-icon">
            <img
              src={getFileTypeIcon(row.name)}
              alt={row.file_type?.toUpperCase()}
              className="file-type-icon"
            />
          </div>
          <span className="document-name">{row.name}</span>
        </div>
      ),
    },
  ];

  const myDocumentsColumns = [
    ...commonColumns,
    {
      title: "SIZE",
      render: (row: any) => (
        <span className="document-size">{formatFileSize(row.size)}</span>
      ),
    },
    {
      title: "TAGS",
      render: (row: any) => (
        <div className="tags-container">
          {Array.isArray(row?.tags) && row.tags.length > 0 ? (
            row.tags.map((tag: string, idx: number) => (
              <span key={idx} className="tag-badge">
                {tag}
              </span>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },

    {
      title: "STATUS",
      render: (row: any) => (
        <span className={`status-badge ${getStatusClass(row.status)}`}>
          <span className="badge-dot" />
          <span>{getDisplayStatus(row.status)}</span>
        </span>
      ),
    },
    {
      title: "PENDING ON",
      render: (row: any) => {
        const statusClass = row.status?.toLowerCase().replace(/\s/g, "-");
        return (
          <span className={`status-badge ${statusClass}`}>
            <span className="badge-dot" />
            <span>{row.pending_on || "-"}</span>
          </span>
        );
      },
    },
  ];

  const awaitingColumns = [
    ...commonColumns,
    {
      title: "UPLOADED BY",
      render: (row: any) => <span>{row.submitted_by}</span>,
    },
    // {
    //   title: "SUBMITTED AT",
    //   render: (row: any) => <span>{new Date(row.submitted_at).toLocaleString()}</span>,
    // },
    {
      title: "STATUS",
      render: (row: any) => {
        const statusClass = row.status.toLowerCase().replace(/\s/g, "-");
        return (
          <span className={`status-badge ${statusClass}`}>
            <span className="badge-dot" />
            <span>{row.status}</span>
          </span>
        );
      },
    },
    // {
    //   title: "REVIEWED BY",
    //   render: (row: any) => {
    //     const statusClass = row.status?.toLowerCase().replace(/\s/g, "-");
    //     return (
    //       <span className={`status-badge ${statusClass}`}>
    //         <span className="badge-dot" />
    //         <span>{row.pending_on || "-"}</span>
    //       </span>
    //     );
    //   },
    // },
  ];

  const awaitingStatusMenu = {
    selectable: true,
    selectedKeys: [status],
    items: [
      { key: "all", label: "All" },
      { key: "APPROVED", label: "Approved" },
      { key: "REJECTED", label: "Rejected" },
      { key: "PENDING", label: "Pending" },
    ],
    onClick: ({ key }: { key: string }) => {
      // setStatus(key === "all" ? "all" : key);
      setStatus(key as DocumentStatus);
      setCurrentPage(1);
    },
  };

  const myDocumentsStatusMenu = {
    selectable: true,
    selectedKeys: [status],
    items: [
      { key: "all", label: "All" },
      { key: "APPROVED", label: "Approved" },
      { key: "DRAFT", label: "Draft" },
      { key: "REJECTED", label: "Rejected" },
      { key: "SUBMITTED", label: "Submitted" },
      { key: "PENDING", label: "Pending" },
      { key: "REUPLOADED", label: "Reuploaded" },
    ],
    onClick: ({ key }: { key: string }) => {
      // setStatus(key === "all" ? "all" : key);
      setStatus(key as DocumentStatus);
      setCurrentPage(1);
    },
  };

  return (
    <div className="documents-container">
      <Header
        title={documentFilter === "MY_DOCUMENTS" ? "Documents" : "Documents"}
        count={`${count} Documents`}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by document name or tag"
        onAddClick={
          documentFilter === "MY_DOCUMENTS" ? openAddDocument : undefined
        }
        addButtonText="Add Document"
        documentFilterValue={documentFilter}
        onDocumentFilterChange={(val: DocumentFilter) => setDocumentFilter(val)}
        categoryButtonText={`Status: ${
          status === "all" ? "All" : getDisplayStatus(status)
        }`}
        categoryButtonClassName="status-dropdown"
        categoryButtonTextClassName="status-title"
        categoryMenu={
          documentFilter === "AWAITING"
            ? { ...awaitingStatusMenu, selectedKeys: [status] }
            : { ...myDocumentsStatusMenu, selectedKeys: [status] }
        }
      />

      <Table
        data={documentList}
        columns={
          documentFilter === "MY_DOCUMENTS"
            ? myDocumentsColumns
            : awaitingColumns
        }
        actions={(row) => (
          <div
            className="documents-actions"
            onClick={() => handleViewDocument(row)}
          >
            <img src="/assets/Eye.svg" alt="View" />
            <span className="spantext">View</span>
          </div>
        )}
        actionsTitle="ACTION"
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize)}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={count}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        emptyText={
          documentFilter === "MY_DOCUMENTS"
            ? "No documents found"
            : "No documents found"
        }
      />

      {documentFilter === "MY_DOCUMENTS" && (
        <AddDocument
          open={isAddDocumentOpen}
          onClose={() => setIsAddDocumentOpen(false)}
          onSuccess={handleAddDocumentSuccess}
        />
      )}
    </div>
  );
}