// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// // import DashboardLayout from "../../layoutes/DashBoardLayout/DashboardLayout";
// // import Header from "../../layoutes/Topbar/topbar";
// import DataTable from "../../components/Tables/DataTable";
// import IconButton from "../../components/common/IconButton";
// import StatusBadge from "../../components/common/StatusBadge";
// import AddDepartmentModal from "../../components/Admin/AddDepartmentModal";
// import EditDepartmentModal from "../../components/Admin/EditDepartmentModal";
// import { useAppNotification } from "../../hooks/useAppNotification";
// import { companyDashboardService } from "../../services/companyDashborad.service";
// import type { DepartmentApi } from "../../services/companyDashborad.service";
// import "./compDashboard.scss";
// // import editIcon from "../../assets/images/edit-button.svg";
// // import deleteIcon from "../../assets/images/delete-button.svg";

// // Menu types
// type MenuType = "departments" | "users" | "projects" | "tasks";

// // Department interface - mapped from API
// export interface Department {
//   id: number;
//   company_id: number;
//   name: string;
//   reporting_department_id?: number | null;
//   contact_person?: string | null;
//   contact: string;
//   contact_email: string;
//   status: "Active" | "Inactive";
// }

// // User interface
// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   department: string;
//   status: "Active" | "Inactive";
// }

// // Project interface
// export interface Project {
//   id: number;
//   name: string;
//   department: string;
//   startDate: string;
//   endDate: string;
//   status: "Active" | "Inactive";
// }

// // Task interface
// export interface Task {
//   id: number;
//   title: string;
//   assignee: string;
//   project: string;
//   dueDate: string;
//   status: "Active" | "Inactive";
// }

// const CompanyDashboard = () => {
//   const { notify, contextHolder } = useAppNotification();
//   const { menuType } = useParams<{ menuType?: MenuType }>();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [searchValue, setSearchValue] = useState<string>("");
  
//   // Default to departments if no menuType in URL
//   const selectedMenu: MenuType = (menuType as MenuType) || "departments";

//   // Department states
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState<boolean>(false);
//   const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState<boolean>(false);
//   const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
//   const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

//   // Other menu data
//   const [users, setUsers] = useState<User[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [tasks, setTasks] = useState<Task[]>([]);

//   useEffect(() => {
//     // Redirect to default if no menuType
//     if (!menuType) {
//       navigate("/comapnyDashboard/departments", { replace: true });
//       return;
//     }
//     // Fetch data based on selected menu
//     if (selectedMenu === "departments") {
//       fetchDepartments();
//     } else {
//       // TODO: Fetch other menu data
//       fetchOtherData();
//     }
//   }, [selectedMenu, menuType, navigate]);

//   const fetchDepartments = async () => {
//     setLoading(true);
//     try {
//       const response = await companyDashboardService.getDepartments(1, 100);
      
//       // Log the response to debug
//       console.log("Departments API Response:", response);
//       console.log("Response data:", response.data);
      
//       // Handle different response structures
//       let apiData: DepartmentApi[] = [];
      
//       if (response.data?.data && Array.isArray(response.data.data)) {
//         // Standard paginated response: { data: { data: [...], page, size, total } }
//         apiData = response.data.data;
//       } else if (Array.isArray(response.data)) {
//         // Direct array response: [...]
//         apiData = response.data;
//       } else if (response.data?.data && !Array.isArray(response.data.data)) {
//         // Single object wrapped
//         apiData = [response.data.data];
//       } else {
//         console.warn("Unexpected response structure:", response.data);
//         apiData = [];
//       }
      
//       const mapped: Department[] = apiData.map((item: DepartmentApi) => ({
//         id: item.id,
//         company_id: item.company_id,
//         name: item.name,
//         reporting_department_id: item.reporting_department_id,
//         contact_person: item.contact_person,
//         contact: item.contact,
//         contact_email: item.contact_email,
//         status: item.is_active ? "Active" : "Inactive",
//       }));

//       console.log("Mapped departments:", mapped);
//       setDepartments(mapped);
//     } catch (error: any) {
//       console.error("Error fetching departments:", error);
//       console.error("Error response:", error.response);
//       console.error("Error data:", error.response?.data);
      
//       const errorMessage = 
//         error.response?.data?.message || 
//         error.response?.data?.error ||
//         error.message ||
//         "Failed to fetch departments";
//       notify.error("Error", errorMessage);
//       setDepartments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOtherData = async () => {
//     setLoading(true);
//     try {
//       // TODO: Replace with actual API calls for users, projects, tasks
//       setUsers([]);
//       setProjects([]);
//       setTasks([]);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debounced search effect for departments
//   useEffect(() => {
//     if (selectedMenu !== "departments") return;

//     const searchTimer = setTimeout(() => {
//       if (!searchValue.trim()) {
//         fetchDepartments();
//         return;
//       }

//       const performSearch = async () => {
//         try {
//           setLoading(true);
//           const res = await companyDashboardService.searchDepartments(
//             searchValue.trim(),
//             1,
//             100
//           );

//           let apiData: DepartmentApi[] = [];
//           if (Array.isArray(res.data)) {
//             apiData = res.data;
//           } else if (res.data?.data && Array.isArray(res.data.data)) {
//             apiData = res.data.data;
//           } else if (res.data?.data) {
//             apiData = Array.isArray(res.data.data) ? res.data.data : [];
//           }

//           const mapped: Department[] = apiData.map((item: DepartmentApi) => ({
//             id: item.id,
//             company_id: item.company_id,
//             name: item.name,
//             reporting_department_id: item.reporting_department_id,
//             contact_person: item.contact_person,
//             contact: item.contact,
//             contact_email: item.contact_email,
//             status: item.is_active ? "Active" : "Inactive",
//           }));

//           setDepartments(mapped);
//         } catch (err: any) {
//           console.error("Search failed:", err);
//           const errorMessage = err.response?.data?.message || "Failed to search departments";
//           notify.error("Error", errorMessage);
//           fetchDepartments();
//         } finally {
//           setLoading(false);
//         }
//       };

//       performSearch();
//     }, 500);

//     return () => clearTimeout(searchTimer);
//   }, [searchValue, selectedMenu]);

//   const handleSearch = (value: string) => {
//     setSearchValue(value);
//   };

//   const handleAdd = () => {
//     if (selectedMenu === "departments") {
//       setIsAddDepartmentModalOpen(true);
//     } else {
//       notify.info("Info", `Add new ${selectedMenu} functionality`);
//     }
//   };

//   const handleEdit = (item: any) => {
//     if (selectedMenu === "departments") {
//       setDepartmentToEdit(item);
//       setIsEditDepartmentModalOpen(true);
//     } else {
//       notify.info("Info", `Edit ${selectedMenu} functionality`);
//     }
//   };

//   const handleDelete = (item: any) => {
//     if (selectedMenu === "departments") {
//       setDepartmentToDelete(item);
//       setShowDeleteModal(true);
//     } else {
//       if (window.confirm(`Are you sure you want to delete this ${selectedMenu.slice(0, -1)}?`)) {
//         notify.success("Success", `${selectedMenu.slice(0, -1)} deleted successfully`);
//       }
//     }
//   };

//   // Department handlers
//   const handleSaveDepartment = async (data: {
//     name: string;
//     reporting_department_id?: number | null;
//     contact_person?: string | null;
//     contact: string;
//     contact_email: string;
//     is_active: boolean;
//   }) => {
//     try {
//       console.log("Adding department with data:", data);
//       const response = await companyDashboardService.addDepartment({
//         name: data.name,
//         reporting_department_id: data.reporting_department_id,
//         contact_person: data.contact_person,
//         contact: data.contact,
//         contact_email: data.contact_email,
//       });

//       console.log("Add department response:", response);
//       console.log("Response data:", response.data);

//       notify.success("Department Created", "Department has been created successfully");
//       setIsAddDepartmentModalOpen(false);
//       fetchDepartments();
//     } catch (err: any) {
//       console.error("Error adding department:", err);
//       console.error("Error response:", err.response);
//       console.error("Error data:", err.response?.data);
      
//       // Extract detailed error message
//       let errorMessage = "Failed to create department";
      
//       if (err.response?.data?.detail) {
//         // Show the detailed error from backend
//         errorMessage = err.response.data.detail;
        
//         // Check if it's the DEPARTMENT_HEAD enum error
//         if (errorMessage.includes("DEPARTMENT_HEAD")) {
//           errorMessage = "Backend Error: The role 'DEPARTMENT_HEAD' does not exist in the database. Please add it to the UserRole enum in the backend, or modify the backend service to use an existing role.";
//         }
//       } else if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.response?.data?.error) {
//         errorMessage = err.response.data.error;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }
      
//       notify.error("Error", errorMessage);
//     }
//   };

//   const handleUpdateDepartment = async (data: {
//     name: string;
//     reporting_department_id?: number | null;
//     contact_person?: string | null;
//     contact: string;
//     contact_email: string;
//     is_active: boolean;
//   }) => {
//     if (!departmentToEdit) return;

//     try {
//       console.log("Updating department:", departmentToEdit.id, "with data:", data);
      
//       await companyDashboardService.updateDepartmentDetails(departmentToEdit.id, {
//         name: data.name,
//         reporting_department_id: data.reporting_department_id,
//         contact_person: data.contact_person,
//         contact: data.contact,
//         contact_email: data.contact_email,
//       });

//       // Update status if changed
//       if (data.is_active !== (departmentToEdit.status === "Active")) {
//         console.log("Updating status to:", data.is_active);
//         await companyDashboardService.updateDepartmentStatus(
//           departmentToEdit.id,
//           data.is_active
//         );
//       }

//       notify.success("Department Updated", "Department has been updated successfully");
//       setIsEditDepartmentModalOpen(false);
//       setDepartmentToEdit(null);
//       fetchDepartments();
//     } catch (err: any) {
//       console.error("Error updating department:", err);
//       console.error("Error response:", err.response);
//       console.error("Error data:", err.response?.data);
      
//       const errorMessage = 
//         err.response?.data?.message || 
//         err.response?.data?.error ||
//         err.message ||
//         "Failed to update department";
//       notify.error("Error", errorMessage);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     if (!departmentToDelete) return;

//     try {
//       console.log("Deleting department:", departmentToDelete.id);
//       await companyDashboardService.deleteDepartment(departmentToDelete.id);

//       notify.success(
//         "Department Deleted",
//         `${departmentToDelete.name} has been deleted successfully`
//       );

//       setShowDeleteModal(false);
//       setDepartmentToDelete(null);
//       fetchDepartments();
//     } catch (err: any) {
//       console.error("Error deleting department:", err);
//       console.error("Error response:", err.response);
//       console.error("Error data:", err.response?.data);
      
//       const errorMessage = 
//         err.response?.data?.message || 
//         err.response?.data?.error ||
//         err.message ||
//         "Failed to delete department";
//       notify.error("Error", errorMessage);
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setDepartmentToDelete(null);
//   };


//   const getTableData = () => {
//     switch (selectedMenu) {
//       case "departments":
//         return departments;
//       case "users":
//         return users;
//       case "projects":
//         return projects;
//       case "tasks":
//         return tasks;
//       default:
//         return [];
//     }
//   };

//   const getTableColumns = () => {
//     switch (selectedMenu) {
//       case "departments":
//         return [
//           {
//             title: "Sr.No",
//             render: (_: Department, index: number) => String(index + 1).padStart(2, "0"),
//           },
//           { title: "Department Name", render: (row: Department) => row.name },
//           { 
//             title: "Contact Person", 
//             render: (row: Department) => row.contact_person || "-" 
//           },
//           { 
//             title: "Contact", 
//             render: (row: Department) => row.contact || "-" 
//           },
//           { 
//             title: "Contact Email", 
//             render: (row: Department) => row.contact_email || "-" 
//           },
//           {
//             title: "Status",
//             render: (row: Department) => <StatusBadge status={row.status} />,
//           },
//         ];
//       case "users":
//         return [
//           {
//             title: "Sr.No",
//             render: (_: User, index: number) => String(index + 1).padStart(2, "0"),
//           },
//           { title: "Name", render: (row: User) => row.name },
//           { title: "Email", render: (row: User) => row.email },
//           { title: "Role", render: (row: User) => row.role },
//           { title: "Department", render: (row: User) => row.department },
//           {
//             title: "Status",
//             render: (row: User) => <StatusBadge status={row.status} />,
//           },
//         ];
//       case "projects":
//         return [
//           {
//             title: "Sr.No",
//             render: (_: Project, index: number) => String(index + 1).padStart(2, "0"),
//           },
//           { title: "Project Name", render: (row: Project) => row.name },
//           { title: "Department", render: (row: Project) => row.department },
//           { title: "Start Date", render: (row: Project) => row.startDate },
//           { title: "End Date", render: (row: Project) => row.endDate },
//           {
//             title: "Status",
//             render: (row: Project) => <StatusBadge status={row.status} />,
//           },
//         ];
//       case "tasks":
//         return [
//           {
//             title: "Sr.No",
//             render: (_: Task, index: number) => String(index + 1).padStart(2, "0"),
//           },
//           { title: "Task Title", render: (row: Task) => row.title },
//           { title: "Assignee", render: (row: Task) => row.assignee },
//           { title: "Project", render: (row: Task) => row.project },
//           { title: "Due Date", render: (row: Task) => row.dueDate },
//           {
//             title: "Status",
//             render: (row: Task) => <StatusBadge status={row.status} />,
//           },
//         ];
//       default:
//         return [];
//     }
//   };

//   const getHeaderTitle = () => {
//     switch (selectedMenu) {
//       case "departments":
//         return "Departments";
//       case "users":
//         return "Users";
//       case "projects":
//         return "Projects";
//       case "tasks":
//         return "Tasks";
//       default:
//         return "Company Dashboard";
//     }
//   };

//   return (
//     <DashboardLayout>
//       {contextHolder}
//       <div className="company-dashboard-page">
//         <Header
//           title={getHeaderTitle()}
//           searchPlaceholder="Search"
//           searchValue={searchValue}
//           onSearchChange={handleSearch}
//           primaryButtonText={`Add ${selectedMenu.slice(0, -1).charAt(0).toUpperCase() + selectedMenu.slice(0, -1).slice(1)}`}
//           primaryButtonIcon="/assets/add.svg"
//           onPrimaryButtonClick={handleAdd}
//         />

//         <div className="dashboard-table-card">
//           {loading ? (
//             <div style={{ textAlign: "center", padding: "40px" }}>
//               <p>Loading...</p>
//             </div>
//           ) : (
//             <DataTable
//               data={getTableData() as any}
//               columns={getTableColumns() as any}
//               actions={(row) => (
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "12px",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <IconButton
//                     icon={<img src={editIcon} alt="Edit" />}
//                     onClick={() => handleEdit(row)}
//                   />
//                   <IconButton
//                     icon={<img src={deleteIcon} alt="Delete" />}
//                     onClick={() => handleDelete(row)}
//                   />
//                 </div>
//               )}
//               actionsTitle="Action"
//             />
//           )}
//         </div>

//         {/* Department Modals */}
//         {selectedMenu === "departments" && (
//           <>
//             <AddDepartmentModal
//               open={isAddDepartmentModalOpen}
//               onClose={() => setIsAddDepartmentModalOpen(false)}
//               onSave={handleSaveDepartment}
//             />

//             <EditDepartmentModal
//               open={isEditDepartmentModalOpen}
//               onClose={() => {
//                 setIsEditDepartmentModalOpen(false);
//                 setDepartmentToEdit(null);
//               }}
//               onSave={handleUpdateDepartment}
//               department={departmentToEdit}
//             />

//             {/* Delete Confirmation Modal */}
//             {showDeleteModal && departmentToDelete && (
//               <div
//                 style={{
//                   position: "fixed",
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: 0,
//                   backgroundColor: "rgba(0, 0, 0, 0.5)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   zIndex: 1000,
//                 }}
//                 onClick={handleCancelDelete}
//               >
//                 <div
//                   style={{
//                     backgroundColor: "white",
//                     padding: "24px",
//                     borderRadius: "8px",
//                     maxWidth: "400px",
//                     width: "90%",
//                   }}
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <h3 style={{ marginBottom: "16px" }}>Delete Department</h3>
//                   <p style={{ marginBottom: "24px", color: "#667085" }}>
//                     Are you sure you want to delete{" "}
//                     <strong>{departmentToDelete.name}</strong>? This action cannot be
//                     undone.
//                   </p>
//                   <div
//                     style={{
//                       display: "flex",
//                       gap: "12px",
//                       justifyContent: "flex-end",
//                     }}
//                   >
//                     <button
//                       onClick={handleCancelDelete}
//                       style={{
//                         padding: "8px 16px",
//                         border: "1px solid #d0d5dd",
//                         borderRadius: "6px",
//                         background: "white",
//                         cursor: "pointer",
//                       }}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleConfirmDelete}
//                       style={{
//                         padding: "8px 16px",
//                         border: "none",
//                         borderRadius: "6px",
//                         background: "#f04438",
//                         color: "white",
//                         cursor: "pointer",
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default CompanyDashboard;

