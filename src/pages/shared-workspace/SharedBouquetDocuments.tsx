import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../CommonComponents/Header/Header";
import Table from "../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../utils/Messages";
import { useDebounce } from "../../hooks/useDebounce";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoaderControl } from "../../CommonComponents/Loader/loader";
import ConfirmModal from "../../CommonComponents/Confirm Modal/ConfirmModal";
import {
  getDisplayStatus,
  getStatusClass,
  scrollLayoutToTop,
} from "../../utils/utilFunctions";
import { Document, DocumentStatus } from "../../types/common";
import { getBouquetDocuments, removeDocumentFromBouquet } from "../../services/bouquets.services";
import AddBoquetDocuments from "../Bouquet/AddBoquetDocuments";
import "./Styles/SharedBouquetDocuments.scss";

export default function SharedBouquetDocuments() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const bouquetId = state?.bouquetId;

  // Lazy initialize from location.state, then sessionStorage, then default
  const [status, setStatus] = useState<DocumentStatus>(
    () =>
      state?.status ||
      (sessionStorage.getItem("sharedBouquetDocumentStatus") as DocumentStatus) ||
      "all"
  );

  const [currentPage, setCurrentPage] = useState<number>(
    () =>
      state?.page ||
      (sessionStorage.getItem("sharedBouquetDocumentPage")
        ? Number(sessionStorage.getItem("sharedBouquetDocumentPage"))
        : 1)
  );

  useEffect(() => {
    sessionStorage.setItem("sharedBouquetDocumentStatus", status);
    sessionStorage.setItem("sharedBouquetDocumentPage", currentPage.toString());
  }, [status, currentPage]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("sharedBouquetDocumentStatus");
      sessionStorage.removeItem("sharedBouquetDocumentPage");
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
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif")
      return "/assets/imag.svg";
    if (ext === "txt") return "/assets/doc icons.svg";
    return "/assets/doc_icon.svg";
  };

  // --- Fetch Functions ---
  const fetchBouquetDocuments = async () => {
    if (!bouquetId) return;

    getLoaderControl()?.showLoader();

    try {
      const res = await getBouquetDocuments(bouquetId, {
        search: debouncedSearch || "",
        page: currentPage,
        pagelimit: pageSize,
      });

      if (res?.data && Array.isArray(res.data)) {
        const normalizedDocuments: Document[] = res.data.map((doc: any) => ({
          document_id: doc.documentId,
          name: doc.fileName,
          status: doc.status,
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          current_version: doc.version,
          size: doc.size,
          file_type: doc.fileName?.split(".").pop()?.toLowerCase(),
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

  // --- Handlers ---
  const openAddDocument = () => setIsAddDocumentOpen(true);

  const handleAddDocumentSuccess = () => {
    fetchBouquetDocuments();
  };

  const handleViewDocument = (document: Document) => {
    const sharedFilter = location.state?.sharedFilter;
    const sharedPage = location.state?.page;

    if (!bouquetId) return;

    navigate(`/sharedworkspace/bouquets/${bouquetId}/documents/${document.document_id}`, {
      state: {
        bouquetId,
        status,
        page: sharedPage || currentPage,
        sharedFilter,
      },
    });
  };

  useEffect(() => {
    fetchBouquetDocuments();
    scrollLayoutToTop();
  }, [bouquetId, debouncedSearch, currentPage, pageSize]);

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

  const columns = [
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
  ];

  const statusMenu = {
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
      setStatus(key as DocumentStatus);
      setCurrentPage(1);
    },
  };

  const handleDeleteDocument = async () => {
    if (!bouquetId || !documentToDelete) return;

    try {
      getLoaderControl()?.showLoader();

      await removeDocumentFromBouquet(
        bouquetId,
        documentToDelete.document_id
      );

      notification.success({
        message: "Document removed from bouquet successfully",
      });

      fetchBouquetDocuments();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const sharedFilter = location.state?.sharedFilter;
  const sharedPage = location.state?.page;

  return (
    <div className="shared-bouquet-documents-container">
      <Header
        breadcrumb={{
          parent: "Shared Workspace",
          parentPath: "/sharedworkspace",
          current: "Documents",
          parentState: {
            sharedFilter: sharedFilter || "BOUQUETS",
            page: sharedPage || 1,
          },
        }}
        count={`${count} Documents`}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by document name or tag"
        onAddClick={openAddDocument}
      />

      <div className="language-table">
        <Table
          data={documentList}
          columns={columns}
          actions={(row) => (
            <div className="Boquet-documents-actions">
              <img
                src="/assets/Eye.svg"
                alt="View"
                onClick={() => handleViewDocument(row)}
              />
              {/* <img
                src="/assets/trash.svg"
                alt="Delete"
                onClick={() => {
                  setDocumentToDelete(row);
                  setShowDeleteModal(true);
                }}
              /> */}
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
          emptyText="No documents found"
        />
      </div>

      {bouquetId && (
        <AddBoquetDocuments
          open={isAddDocumentOpen}
          onClose={() => setIsAddDocumentOpen(false)}
          onSuccess={handleAddDocumentSuccess}
          bouquetId={bouquetId}
        />
      )}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setDocumentToDelete(null);
        }}
        onConfirm={handleDeleteDocument}
        title="Delete Document?"
        description={
          "Deleting this document will permanently remove it from the bouquet.\nThis action cannot be undone."
        }
        confirmText="Delete"
        icon="/assets/trash-hover.svg"
      />
    </div>
  );
}

