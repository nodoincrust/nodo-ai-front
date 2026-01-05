import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../utils/Messages";
import "./Styles/Documents.scss";
import { useDebounce } from "../../../hooks/useDebounce";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import { ApiDocument, Document } from "../../../types/common";
import { getDocumentsList } from "../../../services/documents.service";
import AddDocument from "./AddDocument";

export default function Documents() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<"all" | "APPROVED" | "DRAFT" | "REJECTED" | "SUBMITTED" | "IN_REVIEW">("all");
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  // Get file type icon path
  const getFileTypeIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (type === "pdf") return "/assets/pdf_icon.svg";
    if (type === "docx" || type === "doc") return "/assets/doc_icon.svg";
    if (type === "xlsm" || type === "xlsx" || type === "xls" || type === "xlc") return "/assets/xlc_icon.svg";
    if (type === "pptx" || type === "ppt") return "/assets/ppt_icon.svg";
    // For image files, we can use a default or add an image icon later
    if (type === "png" || type === "jpg" || type === "jpeg" || type === "gif") return "/assets/doc_icon.svg";
    // Default to doc icon for unknown types
    return "/assets/doc_icon.svg";
  };

  // Map API status to display status
  const getDisplayStatus = (status: string): string => {
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
      default:
        return status;
    }
  };

  // Get status badge class
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "APPROVED":
        return "approved";
      case "DRAFT":
        return "draft";
      case "REJECTED":
        return "rejected";
      case "SUBMITTED":
        return "submitted";
      case "IN_REVIEW":
        return "in-review";
      default:
        return "";
    }
  };

  const fetchDocuments = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res = await getDocumentsList({
        page: currentPage,
        size: pageSize,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
      });

      if (res?.data) {
        const normalizedDocuments: Document[] = res.data.map((doc: ApiDocument) => ({
          document_id: doc.document_id,
          status: doc.status,
          current_version: doc.current_version,
          // Normalized fields used by UI
          name: doc.version?.file_name ?? "Unknown Document",
          size: doc.version?.file_size_bytes ?? 0,
          tags: Array.isArray(doc.version?.tags) ? doc.version.tags : [],
          file_type: doc.version?.file_name
            ?.split(".")
            .pop()
            ?.toLowerCase() ?? "doc",
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


  useEffect(() => {
    fetchDocuments();
  }, [currentPage, debouncedSearch, status, pageSize]);

  useEffect(() => {
    scrollLayoutToTop();
  }, [currentPage, location.pathname]);

  const openAddDocument = () => {
    setIsAddDocumentOpen(true);
  };

  const handleAddDocumentSuccess = () => {
    // Refresh the documents list after successful upload
    fetchDocuments();
  };

  const handleViewDocument = (document: Document) => {
    navigate(`/documents/${document.document_id}`);
  };

  return (
    <div className="documents-container">
      <Header
        title="Documents"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by document name or tag"
        onAddClick={openAddDocument}
        addButtonText="Add Document"
        categoryButtonText={`Status: ${status === "all" ? "All" : getDisplayStatus(status)}`}
        categoryButtonClassName="status-dropdown"
        categoryButtonTextClassName="status-dropdown-text"
        categoryMenu={{
          items: [
            { key: "all", label: "All" },
            { key: "APPROVED", label: "Approved" },
            { key: "DRAFT", label: "Draft" },
            { key: "REJECTED", label: "Rejected" },
            { key: "SUBMITTED", label: "Submitted" },
            { key: "IN_REVIEW", label: "In Review" },
          ],
          onClick: ({ key } :{key:string})=> {
            setStatus(key as typeof status);
            setCurrentPage(1);
          },
        }}
      />

      <Table
        data={documentList}
        columns={[
          {
            title: "SR.NO",
            render: (row, index = 0) => {
              const srNo = (currentPage - 1) * pageSize + index + 1;
              return String(srNo).padStart(2, "0");
            },
          },
          {
            title: "DOCUMENT NAME",
            render: (row) => {
              const fileExtension = row.name.split('.').pop()?.toLowerCase() || row.file_type;
              const iconPath = getFileTypeIcon(fileExtension);
              return (
                <div className="document-cell">
                  <div className="document-icon">
                    <img 
                      src={iconPath} 
                      alt={fileExtension.toUpperCase()} 
                      className="file-type-icon"
                    />
                  </div>
                  <span className="document-name">{row.name}</span>
                </div>
              );
            },
          },
          {
            title: "SIZE",
            render: (row) => <span className="document-size">{formatFileSize(row.size)}</span>,
          },
          {
            title: "TAGS",
            render: (row) => (
              <div className="tags-container">
                {row.tags.map((tags, idx) => (
                  <span key={idx} className="tag-badge">
                    {tags}
                  </span>
                ))}
              </div>
            ),
          },
          {
            title: "STATUS",
            render: (row) => (
              <span className={`status-badge ${getStatusClass(row.status)}`}>
                <span className="badge-dot" />
                <span>{getDisplayStatus(row.status)}</span>
              </span>
            ),
          },
        ]}
        actions={(row) => (
          <div className="documents-actions">
            <div
              className="view-icon"
              onClick={() => handleViewDocument(row)}
              title="View Document"
            >
                 <img src="/assets/Eye.svg" alt="View Document" />
                <span className="spantext">View</span>
            </div>
          </div>
        )}
        actionsTitle="ACTION"
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize)}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        totalRecords={count}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        emptyText="No documents found"
      />

      <AddDocument
        open={isAddDocumentOpen}
        onClose={() => setIsAddDocumentOpen(false)}
        onSuccess={handleAddDocumentSuccess}
      />
    </div>
  );
}

