import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../utils/Messages";
import "./Styles/Companies.scss";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNavigate, useLocation } from "react-router-dom";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { getAvatarColorIndex, getInitials, scrollLayoutToTop } from "../../../utils/utilFunctions";
import { deleteCompany, getCompaniesList } from "../../../services/companies.services";
import AddEditCompany from "./AddEditCompany";
import ConfirmModal from "../../../CommonComponents/Confirm Modal/ConfirmModal";

export default function Companies() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();


  const fetchCompanies = async () => {
    getLoaderControl()?.showLoader();
    try {
      const payload = {
        page: currentPage,
        pagelimit: pageSize,
        search,
        status: status === "all" ? undefined : status,
      };

      const res: any = await getCompaniesList(payload);

      if (res?.statusCode === 200) {
        setCompanyList(res?.data || []);
        setCount(res?.total || 0);
      } else {
        setCompanyList([]);
        setCount(0);
        notification.error({
          message:
            res?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_COMPANIES,
        });
      }
    } catch (error: any) {
      setCompanyList([]);
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

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, debouncedSearch, status, pageSize]);

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    getLoaderControl()?.showLoader();
    try {
      const res: any = await deleteCompany(companyToDelete);

      if (res?.statusCode === 200) {
        notification.success({
          message:
            res?.message ||
            MESSAGES.SUCCESS.COMPANY_DELETED_SUCCESSFULLY,
        });

        if (companyList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchCompanies();
        }
      } else {
        notification.error({
          message:
            res?.message ||
            MESSAGES.ERRORS.COMPANY_DELETE_FAILED,
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
      setCompanyToDelete(null);
      getLoaderControl()?.hideLoader();
    }
  };

  useEffect(() => {
    scrollLayoutToTop();
  }, [currentPage, pageSize, location.pathname]);

  const openAddCompany = () => {
    setSelectedCompany(null);
    setIsAddEditOpen(true);
  };

  const openEditCompany = (company: any) => {
    setSelectedCompany(company);
    setIsAddEditOpen(true);
  };

  return (
    <div className="companies-container">
      <Header
        title="Companies"
        count={`${count} Companies`}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onAddClick={openAddCompany}
        addButtonText="Add Company"
        searchPlaceholder="Search companies by name or owner email"
        // categoryButtonText={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
        // categoryButtonClassName="status-dropdown"
        // categoryButtonTextClassName="status-dropdown-text"
        // categoryMenu={{
        //   items: [
        //     { key: "all", label: "All" },
        //     { key: "active", label: "Active" },
        //     { key: "inactive", label: "Inactive" },
        //   ],
        //   onClick: ({ key }) => {
        //     setStatus(key as "all" | "active" | "inactive");
        //     setCurrentPage(1);
        //   },
        // }}
        showDropdown={true}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setCurrentPage(1);
        }}
      />

      <Table
        data={companyList}
        columns={[
          {
            title: "Company Name",
            render: (row, index) => (
              <div className="company-cell">
                <div className={`avatar-initial color-${getAvatarColorIndex(row.id || row.name)}`}>
                  {getInitials(row.name)}
                </div>

                <div className="company-info">
                  <span className="company-name">{row.name}</span>
                </div>
              </div>
            ),
          },
          {
            title: "Contact Person",
            render: (row) => (
              <div className="contact-cell">
                <span className="contact-name">{row.contact_person || "—"}</span>
                <span className="contact-email">{row.contact_email || "—"}</span>
              </div>
            ),
          },
          {
            title: "Contact Number",
            render: (row) => (
              <span>
                {row.contact_number ? row.contact_number : "—"}
              </span>
            ),
          },
          {
            title: "Storage",
            render: (row) => (
              <span>
                {row.total_space} GB
              </span>
            ),
          },
          {
            title: "Status",
            render: (row) => (
              <span className={`status-badge ${row.is_active ? "active" : "inactive"}`}>
                <span className="badge-div" />
                <span>
                  {row.is_active ? "Active" : "Inactive"}
                </span>
              </span>
            ),
          },
        ]}
        actions={(row) => (
          <div className="companies-actions">
            <img
              src="/assets/edit.svg"
              alt="Edit"
              onClick={() => openEditCompany(row)}
            />
            <img
              src="/assets/trash.svg"
              alt="Delete"
              onClick={() => {
                setCompanyToDelete(row.id);
                setShowDeleteModal(true);
              }}
            />
          </div>
        )}
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize)}
        totalRecords={count}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        emptyText="No companies found"
      />

      {isAddEditOpen && (
        <AddEditCompany
          open={isAddEditOpen}
          initialData={selectedCompany}
          onClose={() => {
            setIsAddEditOpen(false);
            setSelectedCompany(null);
          }}
          onSave={() => {
            fetchCompanies();
            setIsAddEditOpen(false);
            setSelectedCompany(null);
          }}
        />
      )}

      {/* CONFIRM MODAL FOR DELETE */}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteCompany}
        title="Delete Company?"
        description={
          "Deleting this company will remove all associated departments and reporting links.\nThis action cannot be undone."
        }
        confirmText="Delete"
        icon="/assets/trash-hover.svg"
      />
    </div>
  );
}