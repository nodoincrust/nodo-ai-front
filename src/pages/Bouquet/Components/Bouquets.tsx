import { useState, useEffect } from "react";
import { notification } from "antd";
import "./Styles/Bouquets.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../utils/Messages";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import AddEditBouquet from "./AddEditBouquet";
import { getBouquetsList } from "../../../services/bouquets.services";

export default function Bouquets() {
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [bouquetList, setBouquetList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
    const [pageSize, setPageSize] = useState(10);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [selectedBouquet, setSelectedBouquet] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bouquetToDelete, setBouquetToDelete] = useState<number | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch bouquets
    const fetchBouquets = async () => {
        getLoaderControl()?.showLoader();
        try {
            const payload = {
                page: currentPage,
                pagelimit: pageSize,
                search,
                status: status === "all" ? undefined : status,
            };

            const res: any = await getBouquetsList(payload);

            if (res?.statusCode === 200) {
                setBouquetList(res?.data || []);
                setCount(res?.pagination?.total || 0);
                setCurrentPage(res?.pagination?.page || 1);
                setPageSize(res?.pagination?.limit || pageSize);
            } else {
                setBouquetList([]);
                setCount(0);
                notification.error({
                    message:
                        res?.message ||
                        MESSAGES.ERRORS.FAILED_TO_FETCH_BOUQUETS,
                });
            }
        } catch (error: any) {
            setBouquetList([]);
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
        fetchBouquets();
    }, [currentPage, debouncedSearch, status, pageSize]);

    useEffect(() => {
        scrollLayoutToTop();
    }, [currentPage, pageSize, location.pathname]);

    // Add / Edit
    const openAddBouquet = () => {
        setSelectedBouquet(null);
        setIsAddEditOpen(true);
    };

    const openEditBouquet = (bouquet: any) => {
        setSelectedBouquet(bouquet);
        setIsAddEditOpen(true);
    };

    return (
        <div className="bouquets-container">
            <Header
                title="Bouquets"
                count={`${count} Bouquets`}
                searchValue={search}
                onSearchChange={(value: any) => {
                    setSearch(value);
                    setCurrentPage(1);
                }}
                onAddClick={openAddBouquet}
                addButtonText="Add Bouquet"
                searchPlaceholder="Search Bouquet by name"
            // showDropdown={true}
            // status={status}
            // onStatusChange={(val) => {
            //     setStatus(val);
            //     setCurrentPage(1);
            // }}
            />

            <Table
                data={bouquetList}
                columns={[
                    {
                        title: "SR.NO",
                        render: (_row: any, index?: number) => (
                            <span>{String((index || 0) + 1).padStart(2, "0")}</span>
                        ),
                    },
                    {
                        title: "Bouquet Name",
                        render: (row: any) => (
                            <span className="bouquet-name">
                                {row.name || "—"}
                            </span>
                        ),
                    },
                    {
                        title: "Description",
                        render: (row: any) => (
                            <span className="bouquet-description">
                                {row.description || "—"}
                            </span>
                        ),
                    },
                ]}
                actions={(row) => (
                    <div className="bouquets-actions">
                        <img
                            src="/assets/Eye.svg"
                            alt="Eye"
                            onClick={() => navigate(`/bouquet/documents`, { state: { bouquetId: row.id } })}
                        />
                        <img
                            src="/assets/edit.svg"
                            alt="Edit"
                            onClick={() => openEditBouquet(row)}
                        />
                        <img
                            src="/assets/trash.svg"
                            alt="Delete"
                            onClick={() => {
                                setBouquetToDelete(row.id);
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
                emptyText="No bouquets found"
            />

            { {isAddEditOpen && (
                <AddEditBouquet
                    open={isAddEditOpen}
                    initialData={selectedBouquet}
                    onClose={() => {
                        setIsAddEditOpen(false);
                        setSelectedBouquet(null);
                    }}
                    onSave={() => {
                        fetchBouquets();
                        setIsAddEditOpen(false);
                        setSelectedBouquet(null);
                    }}
                />
            )}
        </div>
    );
}