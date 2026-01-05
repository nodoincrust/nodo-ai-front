import { useState, useEffect } from "react";
import { notification } from "antd";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../utils/Messages";
import "./Styles/Companies.scss";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNavigate, useLocation } from "react-router-dom";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import { getCompaniesList } from "../../../services/companies.services";
// import AddEditCompany from "./AddEditCompany";

export default function Companies() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();


  const fetchCompanies = async () => {
    getLoaderControl()?.showLoader();
    try {
      const res: any = await getCompaniesList({
        page: currentPage,
        pagelimit: pageSize,
        search,
        status: status === "all" ? undefined : status, // optional status filter
      });

      // The API returns { data: [...], total: number, page, size }
      setCompanyList(res.data || []);
      setCount(res.total || 0);

    } catch (error: any) {
      setCompanyList([]);
      setCount(0);
      notification.error({
        message: error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, debouncedSearch, status]);

  useEffect(() => {
    scrollLayoutToTop();
  }, [currentPage, location.pathname]);

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
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onAddClick={openAddCompany}
        addButtonText="Add Company"
        categoryButtonText="Status: All"
        categoryButtonClassName="status-dropdown"
        categoryButtonTextClassName="status-dropdown-text"
        categoryMenu={{
          items: [
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ],
          onClick: ({ key }) => {
            setStatus(key as "all" | "active" | "inactive"); // TS typecast
            setCurrentPage(1);
          },
        }}
      />

      <Table
        data={companyList}
        columns={[
          {
            title: "Company Name",
            render: (row) => (
              <div className="company-cell">
                <div className="company-initial">
                  {row.name?.slice(0, 2).toUpperCase()}
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
                {Math.max(0, Math.round(row.total_space / (1024 * 1024 * 1024)))} GB
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
            />
          </div>
        )}
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize)}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        emptyText="No companies found"
      />

      {/* {isAddEditOpen && (
        // <AddEditCompany
        //   open={isAddEditOpen}
        //   initialData={selectedCompany}
        //   onClose={() => {
        //     setIsAddEditOpen(false);
        //     setSelectedCompany(null);
        //   }}
        //   onSave={() => {
        //     fetchCompanies();
        //     setIsAddEditOpen(false);
        //     setSelectedCompany(null);
        //   }}
        // />
      )} */}
    </div>
  );
}