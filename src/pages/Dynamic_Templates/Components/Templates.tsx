import { useState, useEffect } from "react";
import { notification, Tooltip } from "antd";

import "./Styles/Templates.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../utils/Messages";
import {
  getAvatarColorIndex,
  getInitials,
  scrollLayoutToTop,
} from "../../../utils/utilFunctions";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import ConfirmModal from "../../../CommonComponents/Confirm Modal/ConfirmModal";
import CreateTemplate from "./Create_Templates/TemplateLayout";
import ShareDocuments from "../../Documents/Components/ShareDocuments";
import {
  deleteTemplate,
  getTemplatesList,
} from "../../../services/templates.services";

export default function Templates() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [pageSize, setPageSize] = useState(10);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* ---------- Fetch Templates ---------- */
  const fetchTemplates = async () => {
    getLoaderControl()?.showLoader();
    try {
      const payload = {
        page: currentPage,
        pagelimit: pageSize,
        search,
        status: status === "all" ? undefined : status,
      };

      const res: any = await getTemplatesList(payload);

      if (res?.statusCode === 200) {
        const formattedData = (res.data || []).map((item: any) => ({
          id: item.id,
          name: item.templateName,
          type: "Template",
          category: "—",
          is_active: true,
          thumbnail: null,
          createdAt: item.createdAt,
        }));

        setTemplateList(formattedData);
        setCount(res?.data?.length || 0);
      } else {
        setTemplateList([]);
        setCount(0);
        notification.error({
          message: res?.message || MESSAGES.ERRORS.TEMPLATE_FETCH_FAILED,
        });
      }
    } catch (error: any) {
      setTemplateList([]);
      setCount(0);
      notification.error({
        message:
          error?.response?.data?.message ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };


  // const fetchTemplates = async () => {
  //     getLoaderControl()?.showLoader();

  //     try {
  //         await new Promise((res) => setTimeout(res, 400)); // simulate API delay

  //         let filteredData = [...DUMMY_TEMPLATES];

  //         // Search filter
  //         if (search) {
  //             filteredData = filteredData.filter((item) =>
  //                 item.name.toLowerCase().includes(search.toLowerCase())
  //             );
  //         }

  //         // Status filter
  //         if (status !== "all") {
  //             filteredData = filteredData.filter(
  //                 (item) => item.is_active === (status === "active")
  //             );
  //         }

  //         const total = filteredData.length;

  //         // Pagination
  //         const startIndex = (currentPage - 1) * pageSize;
  //         const paginatedData = filteredData.slice(
  //             startIndex,
  //             startIndex + pageSize
  //         );

  //         setTemplateList(paginatedData);
  //         setCount(total);
  //     } catch (error) {
  //         setTemplateList([]);
  //         setCount(0);
  //         notification.error({
  //             message: MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
  //         });
  //     } finally {
  //         getLoaderControl()?.hideLoader();
  //     }
  // };

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, debouncedSearch, status, pageSize]);

  useEffect(() => {
    scrollLayoutToTop();
  }, [currentPage, pageSize, location.pathname]);

  /* ---------- Add / Edit / View ---------- */
  const openAddTemplate = () => {
    navigate("/templates/createTemplates");
  };

  const openEditTemplate = (template: any) => {
    navigate(`/templates/edit/${template.id}`);
  };

  const openViewTemplate = (template: any) => {
    navigate(`/templates/view/${template.id}`);
  };

  const handleShareTemplate = (row: any) => {
    setTemplateToShare(row.id);
    setIsShareOpen(true);
  };

  /* ---------- Delete ---------- */
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    getLoaderControl()?.showLoader();
    try {
      const res: any = await deleteTemplate(templateToDelete);

      if (res?.statusCode === 200) {
        notification.success({
          message:
            res?.message || MESSAGES.SUCCESS.TEMPLATE_DELETED_SUCCESSFULLY,
        });

        // Handle pagination edge case
        if (templateList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchTemplates();
        }
      } else {
        notification.error({
          message: res?.message || MESSAGES.ERRORS.TEMPLATE_DELETE_FAILED,
        });
      }
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      getLoaderControl()?.hideLoader();
    }
  };

  return (
    <div className="templates-container">
      <Header
        title="Templates"
        count={`${count} Templates`}
        searchValue={search}
        onSearchChange={(value: any) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onAddClick={openAddTemplate}
        addButtonText="Add Template"
        searchPlaceholder="Search template by name or type"
        // showDropdown
        // status={status}
        // onStatusChange={(val: any) => {
        //     setStatus(val);
        //     setCurrentPage(1);
        // }}
      />

      <Table
        data={templateList}
        columns={[
          {
            title: "Template Name",
            render: (row: any) => (
              <div className="template-cell">
                {row.thumbnail ? (
                  <img src={row.thumbnail} className="template-avatar" />
                ) : (
                  <div
                    className={`avatar-initial color-${getAvatarColorIndex(
                      row.id || row.name,
                    )}`}
                  >
                    {getInitials(row.name || "")}
                  </div>
                )}
                <span>{row.name || "—"}</span>
              </div>
            ),
          },
          {
            title: "Type",
            render: (row: any) => <span>{row.type || "—"}</span>,
          },
      
          {
            title: "Submitted By",
            render: (row: any) => (
              <div className="submitted-by-cell">
                <span className="submitted-name">
                  {/* {row.submitted_by || "—"} */}
                </span>
                <Tooltip title="View Submitted Response">
                <img
                   src="/assets/Eye.svg"
                  alt="View users"
                  title="View Submitted Users"
                  onClick={() =>
                    navigate(`/templates/submitted-users/${row.id}`)
                  }
                />
                </Tooltip>
              </div>
            ),
          },

          // {
          //     title: "Category",
          //     render: (row: any) => (
          //         <div className="category-badge">
          //             <span className="category-pill">
          //                 {row.category || "—"}
          //             </span>
          //         </div>
          //     ),
          // },
          // {
          //     title: "Status",
          //     render: (row: any) => (
          //         <span
          //             className={`status-badge ${row.is_active ? "active" : "inactive"
          //                 }`}
          //         >
          //             <span className="badge-div" />
          //             {row.is_active ? "Active" : "Inactive"}
          //         </span>
          //     ),
          // },
        ]}
        actions={(row: any) => (
          <div className="templates-actions">
            {/* View Template */}
            <Tooltip title="View Template">
              <img
                src="/assets/Eye.svg"
                alt="View"
                onClick={() => openViewTemplate(row)}
                title="View Template"
              />
            </Tooltip>
            {/* Edit Template */}
            <Tooltip title="Edit Template">
            <img
              src="/assets/edit.svg"
              alt="Edit"
              onClick={() => openEditTemplate(row)}
              title="Edit Template"
            />
            </Tooltip>

            {/* Delete Template */}
            <Tooltip title="Delete Template">
            <img
              src="/assets/trash.svg"
              alt="Delete"
              onClick={() => {
                setTemplateToDelete(row.id);
                setShowDeleteModal(true);
              }}
              title="Delete Template"
            />
            </Tooltip>
            {/* Share Template */}

            <Tooltip title="Share Template">
            <img
              src="/assets/share.svg"
              alt="Share"
              onClick={() => handleShareTemplate(row)}
              title="Share Template"
            />
            </Tooltip>
          </div>
            
        )}
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize)}
        totalRecords={count}
        onPageChange={(page: any) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(newSize: any) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        emptyText="No templates found"
      />
      <ShareDocuments
        open={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setTemplateToShare(null);
        }}
        templateId={templateToShare}
      />
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteTemplate}
        title="Delete Template?"
        description={
          "Deleting this template will permanently remove it.\nThis action cannot be undone."
        }
        confirmText="Delete"
        icon="/assets/trash-hover.svg"
      />
    </div>
  );
}
