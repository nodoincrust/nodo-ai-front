import { useState, useEffect } from "react";
import DashboardLayout from "../../layoutes/DashBoardLayout/DashboardLayout";
import Header from "../../layoutes/Topbar/topbar";
import DataTable from "../../components/Tables/DataTable";
import StatusToggle from "../../components/common/StatusToggle ";
import IconButton from "../../components/common/IconButton";
import AddCompanyModal from "../../components/Admin/AddCompanyModal";
import EditCompanyModal from "../../components/Admin/EditCompanyModal";
import { useAppNotification } from "../../hooks/useAppNotification";
import "./Dashboard.scss";
import editIcon from "../../assets/images/edit-button.svg";
import deleteIcon from "../../assets/images/delete-button.svg";
import { adminDashboardService } from "../../services/adminDashboard.service";
import { logout } from "../../utils/storage";

export interface Company {
  id: number;
  name: string;
  email: string;
  owner: string;

  status: "Active" | "Inactive";
}
const Dashboard = () => {
  const { notify, contextHolder } = useAppNotification();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] =
    useState<boolean>(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] =
    useState<boolean>(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Cleanup: Close modal when component unmounts (e.g., on logout/navigation)
  useEffect(() => {
    return () => {
      setIsAddCompanyModalOpen(false);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setIsAddCompanyModalOpen(false);

      setTimeout(() => {
        logout();
      }, 100);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Debounced search effect
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (!searchValue.trim()) {
        fetchCompanies(); // reset to all companies
        return;
      }

      const performSearch = async () => {
        try {
          setLoading(true);
          setError("");
          const res = await adminDashboardService.searchCompanies(
            searchValue.trim(),
            1,
            10
          );
          
          // Handle different response structures
          // API might return: [{...}] directly or { data: { data: [...] } }
          let apiData: any[] = [];
          
          if (Array.isArray(res.data)) {
            // Direct array response: [{...}]
            apiData = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            // Nested structure: { data: { data: [...] } }
            apiData = res.data.data;
          } else {
            // Fallback: try to use res.data if it exists
            console.warn("Unexpected response structure:", res.data);
            apiData = [];
          }

          console.log("Search response:", res.data);
          console.log("Extracted data:", apiData);
          console.log("Number of results:", apiData.length);

          const mapped: Company[] = apiData.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.contact_email,
            owner: item.contact_person,
            status: item.is_active ? "Active" : "Inactive",
          }));

          setCompanies(mapped);
        } catch (err: any) {
          console.error("Search failed:", err);
          console.error("Error details:", err.response?.data);
          const errorMessage =
            err.response?.data?.message || "Failed to search companies";
          notify.error("Error", errorMessage);
          setError(errorMessage);
          // On error, show all companies
          fetchCompanies();
        } finally {
          setLoading(false);
        }
      };

      performSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminDashboardService.getCompanies();
      const apiData = response.data.data;

      const mapped: Company[] = apiData.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.contact_email,
        owner: item.contact_person,
        status: item.is_active ? "Active" : "Inactive",
      }));

      setCompanies(mapped);
    } catch (err: any) {
      console.error("Error fetching companies:", err);
      setError(err.response?.data?.message || "Failed to fetch companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setCompanyToEdit(company);
    setIsEditCompanyModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditCompanyModalOpen(false);
    setCompanyToEdit(null);
  };

  const handleUpdateCompany = async (data: {
    name: string;
    email: string;
    owner: string;
    is_active: boolean;
  }) => {
    if (!companyToEdit) return;

    try {
      await adminDashboardService.updateCompanyDetails(companyToEdit.id, {
        name: data.name,
        contact_email: data.email,
        contact_person: data.owner,
      });

      // Update status if changed
      if (data.is_active !== (companyToEdit.status === "Active")) {
        await adminDashboardService.updateCompanyStatus(
          companyToEdit.id,
          data.is_active
        );
      }

      // Show success notification
      notify.success(
        "Company Updated",
        "Company has been updated successfully"
      );

      // Close modal
      setIsEditCompanyModalOpen(false);
      setCompanyToEdit(null);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error("Error updating company:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update company";
      notify.error("Error", errorMessage);
      setError(errorMessage);
    }
  };

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      await adminDashboardService.deleteCompany(companyToDelete.id);

      // Show success notification
      notify.success(
        "Company Deleted",
        `${companyToDelete.name} has been deleted successfully`
      );

      // Close modal
      setShowDeleteModal(false);
      setCompanyToDelete(null);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error("Error deleting company:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete company";
      notify.error("Error", errorMessage);
      setError(errorMessage);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCompanyToDelete(null);
  };

  const handleAddCompany = () => {
    setIsAddCompanyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddCompanyModalOpen(false);
  };

  const handleSaveCompany = async (data: {
    name: string;
    email: string;
    owner: string;
    is_active: boolean;
  }) => {
    try {
      await adminDashboardService.addCompany({
        name: data.name,
        contact_email: data.email,
        contact_person: data.owner,
        is_active: data.is_active,
      });

      // Show success notification
      notify.success(
        "Company Created",
        "Company has been created successfully"
      );

      // Close modal
      setIsAddCompanyModalOpen(false);

      // Refresh companies list
      fetchCompanies();
    } catch (err: any) {
      console.error("Error adding company:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create company";
      notify.error("Error", errorMessage);
      setError(errorMessage);
    }
  };
  const handleStatusChange = async (companyId: number, newStatus: boolean) => {
    try {
      await adminDashboardService.updateCompanyStatus(companyId, newStatus);

      notify.success(
        "Status Updated",
        `Company status has been set to ${newStatus ? "Active" : "Inactive"}`
      );

      fetchCompanies();
    } catch (err: any) {
      console.error("Status update failed", err);
      notify.error("Error", "Failed to update company status");
    }
  };

  return (
    <DashboardLayout>
      {contextHolder}
      <div className="dashboard-page">
        <Header
          title="Dashboard"
          searchPlaceholder="Search"
          searchValue={searchValue}
          onSearchChange={handleSearch}
          secondaryButtonText="Filter"
          secondaryButtonIcon="/assets/filter.svg"
          primaryButtonText="Add Company"
          primaryButtonIcon="/assets/add.svg"
          onPrimaryButtonClick={handleAddCompany}
        />

        <div className="dashboard-table-card">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading companies...</p>
            </div>
          ) : (
            <DataTable<Company>
              data={companies}
              columns={[
                {
                  title: "Sr.No",
                  render: (_, index) => String(index + 1).padStart(2, "0"),
                },
                { title: "Company Name", render: (row) => row.name },
                { title: "Company Email", render: (row) => row.email },
                { title: "Owner", render: (row) => row.owner },
                {
                  title: "Status",
                  render: (row) => (
                    <StatusToggle
                      value={row.status === "Active"}
                      onChange={(val) => handleStatusChange(row.id, val)}
                    />
                  ),
                },
              ]}
              actions={(row) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    icon={<img src={editIcon} alt="Edit" />}
                    onClick={() => handleEdit(row)}
                  />
                  <IconButton
                    icon={<img src={deleteIcon} alt="Delete" />}
                    onClick={() => handleDelete(row)}
                  />
                </div>
              )}
              actionsTitle="Action"
            />
          )}
        </div>

        <AddCompanyModal
          open={isAddCompanyModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCompany}
        />

        <EditCompanyModal
          open={isEditCompanyModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleUpdateCompany}
          company={companyToEdit}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && companyToDelete && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={handleCancelDelete}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: "16px" }}>Delete Company</h3>
              <p style={{ marginBottom: "24px", color: "#667085" }}>
                Are you sure you want to delete{" "}
                <strong>{companyToDelete.name}</strong>? This action cannot be
                undone.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleCancelDelete}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d0d5dd",
                    borderRadius: "6px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#f04438",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
