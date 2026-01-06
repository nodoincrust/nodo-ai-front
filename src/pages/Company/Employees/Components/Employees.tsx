import { useState, useEffect } from "react";
import { notification } from "antd";
import Table from "../../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../../utils/Messages";
import "./Styles/Employees.scss";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useNavigate, useLocation } from "react-router-dom";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { getInitials, scrollLayoutToTop } from "../../../../utils/utilFunctions";
import Header from "../../../../CommonComponents/Header/Header";
import AddEditEmployee from "./AddEditEmployee";
import ConfirmModal from "../../../../CommonComponents/Confirm Modal/ConfirmModal";
import { deleteEmployee, getEmployeesList } from "../../../../services/employees.services";
import { Employee } from "../../../../types/common";

export default function Employees() {
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [employeeList, setEmployeeList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
    const [pageSize, setPageSize] = useState(10);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    // ===============================
    // Fetch employees
    // ===============================
    const fetchEmployees = async () => {
        getLoaderControl()?.showLoader();
        try {
            const payload = {
                page: currentPage,
                pagelimit: pageSize,
                search,
                status: status === "all" ? undefined : status,
            };

            const res: any = await getEmployeesList(payload);

            if (res?.statusCode === 200) {
                setEmployeeList(res?.data || []);
                setCount(res?.total || 0);
            } else {
                setEmployeeList([]);
                setCount(0);
                notification.error({
                    message:
                        res?.message ||
                        MESSAGES.ERRORS.FAILED_TO_FETCH_EMPLOYEES,
                });
            }
        } catch (error: any) {
            setEmployeeList([]);
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
        fetchEmployees();
    }, [currentPage, debouncedSearch, status, pageSize]);

    useEffect(() => {
        scrollLayoutToTop();
    }, [currentPage, pageSize, location.pathname]);

    // ===============================
    // Add / Edit
    // ===============================
    const openAddEmployee = () => {
        setSelectedEmployee(null);
        setIsAddEditOpen(true);
    };

    const openEditEmployee = (employee: any) => {
        setSelectedEmployee(employee);
        setIsAddEditOpen(true);
    };

    // ===============================
    // Delete
    // ===============================
    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;

        getLoaderControl()?.showLoader();
        try {
            const res: any = await deleteEmployee(employeeToDelete);

            if (res?.statusCode === 200) {
                notification.success({
                    message:
                        res?.message ||
                        MESSAGES.SUCCESS.EMPLOYEE_DELETED_SUCCESSFULLY,
                });

                if (employeeList.length === 1 && currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                } else {
                    fetchEmployees();
                }
            } else {
                notification.error({
                    message:
                        res?.message ||
                        MESSAGES.ERRORS.EMPLOYEE_DELETE_FAILED,
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
            setEmployeeToDelete(null);
            getLoaderControl()?.hideLoader();
        }
    };

    return (
        <div className="employees-container">
            <Header
                title="Employees"
                count={`${count} Employees`}
                searchValue={search}
                onSearchChange={(value: any) => {
                    setSearch(value);
                    setCurrentPage(1);
                }}
                onAddClick={openAddEmployee}
                addButtonText="Add Employee"
                searchPlaceholder="Search employee by name or email"
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
                        setStatus(key as "all" | "active" | "inactive");
                        setCurrentPage(1);
                    },
                }}
            />

            <Table
                data={employeeList}
                columns={[
                    {
                        title: "Employee Name",
                        render: (row: Employee, index?: number) => (
                            <div className="employee-cell">
                                {row.profile_image ? (
                                    <img src={row.profile_image} className="employee-avatar" />
                                ) : (
                                    <div className={`avatar-initial color-${((index ?? 0) % 4) + 1}`}>
                                        {getInitials(row.name || "")}
                                    </div>
                                )}
                                <span>{row.name || "—"}</span>
                            </div>
                        ),
                    },
                    {
                        title: "Email",
                        render: (row) => <span>{row.email || "—"}</span>,
                    },
                    {
                        title: "Department",
                        render: (row: any) => (
                            <div className="department-badge">
                                <span className="department-pill">
                                    {row.department_name || "—"}
                                </span>
                            </div>

                        ),
                    },
                    {
                        title: "Role",
                        render: (row) => <span>{row.role || "—"}</span>,
                    },
                    {
                        title: "Status",
                        render: (row) => (
                            <span
                                className={`status-badge ${row.is_active ? "active" : "inactive"
                                    }`}
                            >
                                <span className="badge-div" />
                                {row.is_active ? "Active" : "Inactive"}
                            </span>
                        ),
                    },
                ]}
                actions={(row) => (
                    <div className="employees-actions">
                        <img
                            src="/assets/edit.svg"
                            alt="Edit"
                            onClick={() => openEditEmployee(row)}
                        />
                        <img
                            src="/assets/trash.svg"
                            alt="Delete"
                            onClick={() => {
                                setEmployeeToDelete(row.id);
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
                emptyText="No employees found"
            />

            {isAddEditOpen && (
                <AddEditEmployee
                    open={isAddEditOpen}
                    initialData={selectedEmployee}
                    onClose={() => {
                        setIsAddEditOpen(false);
                        setSelectedEmployee(null);
                    }}
                    onSave={() => {
                        fetchEmployees();
                        setIsAddEditOpen(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}

            <ConfirmModal
                open={showDeleteModal}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setEmployeeToDelete(null);
                }}
                onConfirm={handleDeleteEmployee}
                title="Delete Employee?"
                description="Deleting this employee will permanently remove their access and data. This action cannot be undone."
                confirmText="Delete"
                icon="/assets/trash-hover.svg"
            />
        </div>
    );
}