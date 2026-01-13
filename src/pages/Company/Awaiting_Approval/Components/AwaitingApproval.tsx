import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../../../CommonComponents/Header/Header";
import Table from "../../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../../utils/Messages";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../../../utils/utilFunctions";
import { Document } from "../../../../types/common";
import "./Styles/AwaitingApprovalDetails.scss";
import { getApprovalList } from "../../../../services/awaitingApproval.services";
import './Styles/AwaitingApproval.scss'
export default function AwaitingApproval() {
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [documentList, setDocumentList] = useState<Document[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [status, setStatus] = useState<
        "ALL" | "APPROVED" | "DRAFT" | "REJECTED" | "SUBMITTED" | "IN_REVIEW"
    >("ALL");
    const [documentFilter, setDocumentFilter] = useState<"MY_DOCUMENTS" | "AWAITING">("MY_DOCUMENTS");

    const location = useLocation();
    const navigate = useNavigate();

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + "B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
        return (bytes / (1024 * 1024)).toFixed(1) + "MB";
    };

    const getFileTypeIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (!ext) return "/assets/doc_icon.svg";
        if (["pdf"].includes(ext)) return "/assets/pdf_icon.svg";
        if (["doc", "docx"].includes(ext)) return "/assets/doc_icon.svg";
        if (["xls", "xlsx", "xlsm", "xlc"].includes(ext)) return "/assets/xlc_icon.svg";
        if (["ppt", "pptx"].includes(ext)) return "/assets/ppt_icon.svg";
        if (["png", "jpg", "jpeg", "gif"].includes(ext)) return "/assets/imag.svg";
        return "/assets/doc_icon.svg";
    };

    const fetchDocuments = async () => {
        getLoaderControl()?.showLoader();

        try {
            // Build payload dynamically
            const payload = {
                page: currentPage,
                pagelimit: pageSize,
                search: debouncedSearch || undefined,
                status: status === "ALL" ? undefined : status,
            };

            const res = await getApprovalList(payload);

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

    useEffect(() => {
        fetchDocuments();
    }, [currentPage, debouncedSearch, pageSize, status]);

    useEffect(() => {
        scrollLayoutToTop();
    }, [currentPage, location.pathname]);

    const handleViewDocument = (document: Document) => {
        navigate(`/awaitingApproval/${document.document_id}`);
    };

    return (
        <div className="documents-container">
            <Header
                title="Awaiting Approval"
                count={`${count} Documents`}
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setCurrentPage(1);
                }}
                searchPlaceholder="Search by document name or tag"

                categoryButtonText={`Status: ${status === "ALL"
                        ? "All"
                        : status.replace("_", " ")
                    }`}

                categoryButtonClassName="status-dropdown"
                categoryButtonTextClassName="status-title"

                categoryMenu={{
                    items: [
                        { key: "All", label: "All" },
                        { key: "Approved", label: "Approved" },
                        { key: "Draft", label: "Draft" },
                        { key: "Rejected", label: "Rejected" },
                        { key: "Submitted", label: "Submitted" },
                        { key: "In_Review", label: "In Review" },
                         { key: "PENDING", label: "Pending" },
                    ],
                    selectable: true,
                    selectedKeys: [status],
                    onClick: ({ key }) => {
                        setStatus(key as any);
                        setCurrentPage(1);
                    },
                }}

                documentFilterValue={documentFilter}
                onDocumentFilterChange={(val: any) => setDocumentFilter(val)}
            />

            <Table
                data={documentList}
                columns={[
                    {
                        title: "SR.NO",
                        render: (_row, index = 0) =>
                            String((currentPage - 1) * pageSize + index + 1).padStart(2, "0"),
                    },
                    {
                        title: "DOCUMENT NAME",
                        render: (row) => (
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
                    {
                        title: "UPLOADED BY",
                        render: (row) => <span>{row.submitted_by}</span>,
                    },
                    {
                        title: "SUBMITTED AT",
                        render: (row) => <span>{new Date(row.submitted_at).toLocaleString()}</span>,
                    },
                   {
                        title: "STATUS",
                        render: (row: any) => {
                            const statusText = row.status;
                            const statusClass = statusText.toLowerCase().replace(/\s/g, "-");

                            return (
                                <span className={`status-badge ${statusClass}`}>
                                    <span className="badge-dot" />
                                    <span>{statusText}</span>
                                </span>
                            );
                        },
                    }
                ]}
                actions={(row) => (
                    <div className="documents-actions" onClick={() => handleViewDocument(row)}>
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
                emptyText="No documents awaiting approval"
            />
        </div>
    );
}