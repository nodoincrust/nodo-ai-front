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
  toCamelCase,
} from "../../utils/utilFunctions";
import { ApiDocument, Document, DocumentStatus } from "../../types/common";
import { getBouquetDocuments, removeDocumentFromBouquet } from "../../services/bouquets.services";
import AddBoquetDocuments from "./AddBoquetDocuments";
import { useParams } from "react-router-dom";
import "./Components/Styles/BouquetDocuments.scss";

type DocumentFilter = "MY_DOCUMENTS" | "AWAITING";

export default function BouquetDocuments() {
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
  const authData: any = JSON.parse(localStorage.getItem("authData") || "{}");
  const userRole = authData.user?.role || "";
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  // Get bouquet ID from location.state instead of route params
  const state = location.state as any;
  const bouquetId = state?.bouquetId;

  // Lazy initialize from location.state, then sessionStorage, then default
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>(
    () =>
      state?.documentFilter ||
      (sessionStorage.getItem("documentFilter") as DocumentFilter) ||
      "MY_DOCUMENTS"
  );

  const [status, setStatus] = useState<DocumentStatus>(
    () =>
      state?.status ||
      (sessionStorage.getItem("documentStatus") as DocumentStatus) ||
      "all"
  );

  const [currentPage, setCurrentPage] = useState<number>(
    () =>
      state?.page ||
      (sessionStorage.getItem("documentPage")
        ? Number(sessionStorage.getItem("documentPage"))
        : 1)
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
          document_id: doc.documentId, // ✅ correct
          name: doc.fileName, // ✅ correct
          status: doc.status, // ✅ correct
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          current_version: doc.version, // ✅ correct
          size: doc.size, // ❗ not provided by API
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
    navigate(`/bouquet/documents/${document.document_id}`, {
      state: {
        bouquetId,
        documentFilter,
        status,
        page: currentPage,
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
    // Only show "PENDING ON" if not COMPANY_ADMIN
    // ...(userRole !== "COMPANY_ADMIN"
    //   ? [
    //       {
    //         title: "PENDING ON",
    //         render: (row: any) => {
    //           const statusClass = row.status?.toLowerCase().replace(/\s/g, "-");
    //           return (
    //             <span
    //               className={`status-badge  ${getStatusClass(row.pending_on)}`}
    //             >
    //               <span className="badge-dot" />
    //               <span>{getDisplayStatus(row.pending_on || "-")}</span>
    //             </span>
    //           );
    //         },
    //       },
    //     ]
    //   : []),
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

    // Refresh list
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

  const myDocumentsStatusMenu = {
    selectable: true,
    selectedKeys: [status],
    items:
      userRole === "COMPANY_ADMIN"
        ? [
            { key: "all", label: "All" },
            { key: "APPROVED", label: "Approved" },
            { key: "DRAFT", label: "Draft" },
          ]
        : [
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
    <div className="bouquet-documents-container">
      <Header
        breadcrumb={{
          parent: "Bouquet",
          parentPath: "/bouquet",
          current: "Documents",
        }}
        count={`${count} Documents`}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by document name or tag"
        // onAddClick={documentFilter === "MY_DOCUMENTS" ? openAddDocument : undefined}
        onAddClick={openAddDocument}
        addButtonText="Add Document"
        // documentFilterValue={documentFilter}
        // onDocumentFilterChange={(val: DocumentFilter) => setDocumentFilter(val)}
        // categoryButtonText={`Status: ${
        //   status === "all" ? "All" : getDisplayStatus(status)
        // }`}
        // categoryButtonClassName="status-dropdown"
        // categoryButtonTextClassName="status-title"
        // categoryMenu={
        //   documentFilter === "AWAITING"
        //     ? { ...awaitingStatusMenu, selectedKeys: [status] }
        //     : { ...myDocumentsStatusMenu, selectedKeys: [status] }
        // }
      />

      <div
        className={`language-table ${
          documentFilter === "MY_DOCUMENTS" && userRole !== "COMPANY_ADMIN"
            ? "with-pending"
            : "without-pending"
        }`}
      >
        <Table
          data={documentList}
          columns={
            documentFilter === "MY_DOCUMENTS"
              ? myDocumentsColumns
              : awaitingColumns
          }
          actions={(row) => (
            <div className="Boquet-documents-actions">
              <img
                src="/assets/Eye.svg"
                alt="View"
                onClick={() => handleViewDocument(row)}
              />
              <img
                src="/assets/trash.svg"
                alt="Delete"
                onClick={() => {
                   setDocumentToDelete(row);
                    setShowDeleteModal(true);
                }}
              />
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
