import { useState, useEffect } from "react";
import { notification, Tooltip } from "antd";
import Header from "../../CommonComponents/Header/Header";
import Table from "../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../utils/Messages";
import { useDebounce } from "../../hooks/useDebounce";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoaderControl } from "../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../utils/utilFunctions";
import { getSharedData } from "../../services/sharedWorkspace.services";
import SharedTemplates, { type SharedTemplate } from "./SharedTemplates";
import "./Styles/SharedWorkspace.scss";

type SharedFilter = "DOCUMENTS" | "BOUQUETS" | "TEMPLATES";

interface SharedDocument {
  document_id: number;
  name: string;
  status: string;
  size: number;
  tags: string[];
  file_type: string;
  shared_by?: string;
  shared_at?: string;
}

interface SharedBouquet {
  id: number;
  name: string;
  description: string;
  shared_by?: string;
  shared_at?: string;
}

export default function SharedWorkspace() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [documentList, setDocumentList] = useState<SharedDocument[]>([]);
  const [bouquetList, setBouquetList] = useState<SharedBouquet[]>([]);
  const [templateList, setTemplateList] = useState<SharedTemplate[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  // Lazy initialize from location.state, then sessionStorage, then default
  const state = location.state as any;
  const [sharedFilter, setSharedFilter] = useState<SharedFilter>(
    () =>
      state?.sharedFilter ||
      (sessionStorage.getItem("sharedFilter") as SharedFilter) ||
      "DOCUMENTS",
  );

  const [currentPageState, setCurrentPageState] = useState<number>(
    () =>
      state?.page ||
      (sessionStorage.getItem("sharedWorkspacePage")
        ? Number(sessionStorage.getItem("sharedWorkspacePage"))
        : 1),
  );

  useEffect(() => {
    sessionStorage.setItem("sharedFilter", sharedFilter);
    sessionStorage.setItem("sharedWorkspacePage", currentPageState.toString());
  }, [sharedFilter, currentPageState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("sharedFilter");
      sessionStorage.removeItem("sharedWorkspacePage");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Format file size
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

  // Fetch shared documents
  const fetchSharedDocuments = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res: any = await getSharedData({
        key: "doc",
        page: currentPageState,
        pagelimit: pageSize,
        query: debouncedSearch || "",
        sort: "",
        order: "asc",
      });

      if (res?.documents) {
        const normalizedDocuments: SharedDocument[] = (res.documents || []).map(
          (doc: any) => ({
            document_id: doc.id,
            name: doc.file_name || "Unknown Document",
            status: doc.version?.toString() || "1",
            size: 0,
            tags: Array.isArray(doc.tags) ? doc.tags : [],
            file_type:
              (doc.file_name || "").split(".").pop()?.toLowerCase() || "doc",
            shared_by: doc.shared_by,
            shared_at: doc.shared_at,
          }),
        );
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

  // Fetch shared bouquets
  const fetchSharedBouquets = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res: any = await getSharedData({
        key: "boq",
        page: currentPageState,
        pagelimit: pageSize,
        query: debouncedSearch || "",
        sort: "",
        order: "asc",
      });

      if (res?.bouquets) {
        const normalizedBouquets: SharedBouquet[] = (res.bouquets || []).map(
          (bouquet: any) => ({
            id: bouquet.id,
            name: bouquet.name || "—",
            description: bouquet.description || "—",
            shared_by: bouquet.shared_by,
            shared_at: bouquet.shared_at,
          }),
        );
        setBouquetList(normalizedBouquets);
        setCount(res.total || 0);
      } else {
        setBouquetList([]);
        setCount(0);
      }
    } catch (error: any) {
      setBouquetList([]);
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

  // Fetch shared templates
  const fetchSharedTemplates = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res: any = await getSharedData({
        key: "template",
        page: currentPageState,
        pagelimit: pageSize,
        query: debouncedSearch || "",
        sort: "",
        order: "asc",
      });

      if (res?.templates) {
        const normalizedTemplates: SharedTemplate[] = (res.templates || []).map(
          (t: any) => ({
            id: t.id,
            templateName: t.templateName ?? "—",
            shared_by: t.shared_by,
            shared_at: t.shared_at,
          }),
        );
        setTemplateList(normalizedTemplates);
        setCount(res.total || 0);
      } else {
        setTemplateList([]);
        setCount(0);
      }
    } catch (error: any) {
      setTemplateList([]);
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

  // Effects
  useEffect(() => {
    scrollLayoutToTop();
    if (sharedFilter === "DOCUMENTS") {
      fetchSharedDocuments();
    } else if (sharedFilter === "BOUQUETS") {
      fetchSharedBouquets();
    } else {
      fetchSharedTemplates();
    }
  }, [currentPageState, debouncedSearch, pageSize, sharedFilter]);

  const handleViewDocument = (document: SharedDocument) => {
    navigate(`/sharedworkspace/documents/${document.document_id}`, {
      state: {
        sharedFilter,
        page: currentPageState,
      },
    });
  };

  const handleViewBouquet = (bouquet: SharedBouquet) => {
    navigate(`/sharedworkspace/bouquets/documents`, {
      state: {
        bouquetId: bouquet.id,
        sharedFilter,
        page: currentPageState,
      },
    });
  };

  const handleViewTemplate = (template: SharedTemplate) => {
    navigate(`/sharedworkspace/submit/${template.id}`, {
      state: {
        sharedFilter,
        page: currentPageState,
      },
    });
  };

  // Document columns
  const documentColumns = [
    {
      title: "SR.NO",
      render: (_row: any, index = 0) =>
        String((currentPageState - 1) * pageSize + index + 1).padStart(2, "0"),
    },
    {
      title: "DOCUMENT NAME",
      render: (row: SharedDocument) => (
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
    // {
    //   title: "VERSION",
    //   render: (row: SharedDocument) => (
    //     <span className="document-version">v{row.status}</span>
    //   ),
    // },
    {
      title: "TAGS",
      render: (row: SharedDocument) => (
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
      title: "SHARED BY",
      render: (row: SharedDocument) => (
        <span>{row.shared_by || "—"}</span>
      ),
    },
    {
      title: "SHARED AT",
      render: (row: SharedDocument) => (
        <span>
          {row.shared_at ? new Date(row.shared_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  // Bouquet columns
  const bouquetColumns = [
    {
      title: "SR.NO",
      render: (_row: any, index = 0) =>
        String((currentPageState - 1) * pageSize + index + 1).padStart(2, "0"),
    },
    {
      title: "BOUQUET NAME",
      render: (row: SharedBouquet) => (
        <span className="bouquet-name">{row.name || "—"}</span>
      ),
    },
    {
      title: "DESCRIPTION",
      render: (row: SharedBouquet) => (
        <span className="bouquet-description">{row.description || "—"}</span>
      ),
    },
    {
      title: "SHARED BY",
      render: (row: SharedBouquet) => <span>{row.shared_by || "—"}</span>,
    },
    {
      title: "SHARED AT",
      render: (row: SharedBouquet) => (
        <span>
          {row.shared_at ? new Date(row.shared_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const sharedFilterMenu = {
    selectable: true,
    selectedKeys: [sharedFilter],
    items: [
      { key: "DOCUMENTS", label: "Documents" },
      { key: "BOUQUETS", label: "Bouquets" },
      { key: "TEMPLATES", label: "Templates" },
    ],
    onClick: ({ key }: { key: string }) => {
      setSharedFilter(key as SharedFilter);
      setCurrentPageState(1);
    },
  };

  return (
    <div className="shared-workspace-container">
      <Header
        title="Shared Workspace"
        count={
          sharedFilter === "DOCUMENTS"
            ? `${count} Documents`
            : sharedFilter === "BOUQUETS"
              ? `${count} Bouquets`
              : `${count} Templates`
        }
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPageState(1);
        }}
        searchPlaceholder={
          sharedFilter === "DOCUMENTS"
            ? "Search by document name or tag"
            : sharedFilter === "BOUQUETS"
              ? "Search bouquet by name"
              : "Search template by name"
        }
        categoryButtonText={
          sharedFilter === "DOCUMENTS"
            ? "Documents"
            : sharedFilter === "BOUQUETS"
              ? "Bouquets"
              : "Templates"
        }
        categoryButtonClassName="status-dropdown"
        categoryButtonTextClassName="status-title"
        categoryMenu={sharedFilterMenu}
      />

      <div className="shared-workspace-table">
        {sharedFilter === "TEMPLATES" ? (
          <SharedTemplates
            data={templateList}
            count={count}
            currentPage={currentPageState}
            pageSize={pageSize}
            onPageChange={setCurrentPageState}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPageState(1);
            }}
            onViewTemplate={handleViewTemplate}
          />
        ) : sharedFilter === "DOCUMENTS" ? (
          <Table<SharedDocument>
            data={documentList}
            columns={documentColumns}
            actions={(row) => (
              <div className="shared-workspace-actions">
                <Tooltip title="View Document" placement="top">
                  <img
                    src="/assets/Eye.svg"
                    alt="View"
                    onClick={() => handleViewDocument(row)}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              </div>
            )}
            actionsTitle="ACTION"
            currentPage={currentPageState}
            totalPages={Math.ceil(count / pageSize)}
            onPageChange={setCurrentPageState}
            pageSize={pageSize}
            totalRecords={count}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPageState(1);
            }}
            emptyText="No shared documents found"
          />
        ) : (
          <Table<SharedBouquet>
            data={bouquetList}
            columns={bouquetColumns}
            actions={(row) => (
              <div className="shared-workspace-actions">
                <Tooltip title="View Bouquet" placement="top">
                  <img
                    src="/assets/Eye.svg"
                    alt="View"
                    onClick={() => handleViewBouquet(row)}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              </div>
            )}
            actionsTitle="ACTION"
            currentPage={currentPageState}
            totalPages={Math.ceil(count / pageSize)}
            onPageChange={setCurrentPageState}
            pageSize={pageSize}
            totalRecords={count}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPageState(1);
            }}
            emptyText="No shared bouquets found"
          />
        )}
      </div>
    </div>
  );
}
