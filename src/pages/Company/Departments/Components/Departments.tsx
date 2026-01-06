import { useState, useEffect } from "react";
import { notification } from "antd";
import Table from "../../../../CommonComponents/Table/Components/Table";
import { MESSAGES } from "../../../../utils/Messages";
import "./Styles/Departments.scss";
import { useDebounce } from "../../../../hooks/useDebounce";
import { useNavigate, useLocation } from "react-router-dom";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { scrollLayoutToTop } from "../../../../utils/utilFunctions";
import { getDepartmentsList, deleteDepartment } from "../../../../services/departments.services";
import Header from "../../../../CommonComponents/Header/Header";
import AddEditDepartment from "./AddEditDepartment"; // make a modal component like AddEditCompany
import ConfirmModal from "../../../../CommonComponents/Confirm Modal/ConfirmModal";

export default function Departments() {
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [departmentList, setDepartmentList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
    const [pageSize, setPageSize] = useState(10);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch departments
    const fetchDepartments = async () => {
        getLoaderControl()?.showLoader();
        try {
            const payload = {
                page: currentPage,
                pagelimit: pageSize,
                search,
                status: status === "all" ? undefined : status,
            };

            const res: any = await getDepartmentsList(payload);

            if (res?.statusCode === 200) {
                setDepartmentList(res?.data || []);
                setCount(res?.total || 0);
            } else {
                setDepartmentList([]);
                setCount(0);
                notification.error({
                    message: res?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_DEPARTMENTS,
                });
            }
        } catch (error: any) {
            setDepartmentList([]);
            setCount(0);
            notification.error({
                message:
                    error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [currentPage, debouncedSearch, status, pageSize]);

    useEffect(() => {
        scrollLayoutToTop();
    }, [currentPage, pageSize, location.pathname]);

    // Open Add Department
    const openAddDepartment = () => {
        setSelectedDepartment(null);
        setIsAddEditOpen(true);
    };

    // Open Edit Department
    const openEditDepartment = (department: any) => {
        setSelectedDepartment(department);
        setIsAddEditOpen(true);
    };

    // Handle Delete Department
    const handleDeleteDepartment = async () => {
        if (!departmentToDelete) return;

        getLoaderControl()?.showLoader();
        try {
            const res: any = await deleteDepartment(departmentToDelete);

            if (res?.statusCode === 200) {
                notification.success({
                    message: res?.message || MESSAGES.SUCCESS.DEPARTMENT_DELETED_SUCCESSFULLY,
                });

                // Adjust page if last item removed
                if (departmentList.length === 1 && currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                } else {
                    fetchDepartments();
                }
            } else {
                notification.error({
                    message: res?.message || MESSAGES.ERRORS.DEPARTMENT_DELETE_FAILED,
                });
            }
        } catch (error: any) {
            notification.error({
                message:
                    error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
            });
        } finally {
            setShowDeleteModal(false);
            setDepartmentToDelete(null);
            getLoaderControl()?.hideLoader();
        }
    };

    return (
        <div className="departments-container">
            <Header
                title="Departments"
                count={`${count} Departments`}
                searchValue={search}
                onSearchChange={(value: any) => {
                    setSearch(value);
                    setCurrentPage(1);
                }}
                onAddClick={openAddDepartment}
                addButtonText="Add Department"
                searchPlaceholder="Search departments by name"
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
                data={departmentList}
                columns={[
                    {
                        title: "Sr. No",
                        render: (_row, index) => {
                            const idx = index ?? 0;
                            const serial = (currentPage - 1) * pageSize + idx + 1;
                            return <span>{serial < 10 ? `0${serial}` : serial}</span>;
                        },
                    },
                    {
                        title: "Department Name",
                        render: (row) => <span>{row.name || "—"}</span>,

                    },
                    {
                        title: "Description",
                        render: (row) => <span>{row.description || "—"}</span>,
                    },
                    {
                        title: "Assigned To",
                        render: (row) => <span>{row.head_name || "—"}</span>,
                    },
                    {
                        title: "Status",
                        render: (row) => (
                            <span className={`status-badge ${row.is_active ? "active" : "inactive"}`}>
                                <span className="badge-div" />
                                {row.is_active ? "Active" : "Inactive"}
                            </span>
                        ),
                    },
                ]}
                actions={(row) => (
                    <div className="departments-actions">
                        <img
                            src="/assets/edit.svg"
                            alt="Edit"
                            onClick={() => openEditDepartment(row)}
                        />
                        <img
                            src="/assets/trash.svg"
                            alt="Delete"
                            onClick={() => {
                                setDepartmentToDelete(row.id);
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
                emptyText="No departments found"
            />

            {/* ADD / EDIT MODAL */}
            {isAddEditOpen && (
                <AddEditDepartment
                    open={isAddEditOpen}
                    initialData={selectedDepartment}
                    onClose={() => {
                        setIsAddEditOpen(false);
                        setSelectedDepartment(null);
                    }}
                    onSave={() => {
                        fetchDepartments();
                        setIsAddEditOpen(false);
                        setSelectedDepartment(null);
                    }}
                />
            )}

            {/* CONFIRM DELETE MODAL */}
            <ConfirmModal
                open={showDeleteModal}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setDepartmentToDelete(null);
                }}
                onConfirm={handleDeleteDepartment}
                title="Delete Department?"
                description={
                    "Deleting this department will remove all associated employees and reporting links.\nThis action cannot be undone."
                }
                confirmText="Delete"
                icon="/assets/trash-hover.svg"
            />
        </div>
    );
}