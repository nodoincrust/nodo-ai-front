import { useState, useEffect } from "react";
import { notification, Tooltip } from "antd";
import "./Styles/Bouquets.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../utils/Messages";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import AddEditBouquet from "./AddEditBouquet";
import {
  deleteBouquet,
  getBouquetsList,
} from "../../../services/bouquets.services";
import ConfirmModal from "../../../CommonComponents/Confirm Modal/ConfirmModal";
import ShareDocuments from "../../Documents/Components/ShareDocuments";

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
  const [bouquetToShare, setBouquetToShare] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
          message: res?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_BOUQUETS,
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

  const handleOpenShare = (bouquet: any) => {
    setBouquetToShare(bouquet);
    setIsShareModalOpen(true);
  };

  const openEditBouquet = (bouquet: any) => {
    setSelectedBouquet(bouquet);
    setIsAddEditOpen(true);
  };

  // Delete
  const handleDeleteBouquet = async () => {
    if (!bouquetToDelete) return;

    getLoaderControl()?.showLoader();
    try {
      const res: any = await deleteBouquet(bouquetToDelete);

      if (res?.statusCode === 200) {
        notification.success({
          message:
            res?.message || MESSAGES.SUCCESS.BOUQUET_DELETED_SUCCESSFULLY,
        });

        if (bouquetList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchBouquets();
        }
      } else {
        notification.error({
          message: res?.message || MESSAGES.ERRORS.BOUQUET_DELETE_FAILED,
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
      setBouquetToDelete(null);
      getLoaderControl()?.hideLoader();
    }
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
              <span className="bouquet-name">{row.name || "—"}</span>
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
            <Tooltip title="View documents">
              <img
                src="/assets/Eye.svg"
                alt="View"
                onClick={() =>
                  navigate(`/bouquet/documents`, {
                    state: { bouquetId: row.id },
                  })
                }
                style={{ cursor: "pointer" }}
              />
            </Tooltip>

            <Tooltip title="Edit bouquet">
              <img
                src="/assets/edit.svg"
                alt="Edit"
                onClick={() => openEditBouquet(row)}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>

            <Tooltip title="Share bouquet">
              <img
                src="/assets/share.svg"
                alt="Share"
                style={{ cursor: "pointer" }}
                onClick={() => handleOpenShare(row)}
              />
            </Tooltip>

            <Tooltip title="Delete bouquet">
              <img
                src="/assets/trash.svg"
                alt="Delete"
                onClick={() => {
                  setBouquetToDelete(row.id);
                  setShowDeleteModal(true);
                }}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
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

      {isAddEditOpen && (
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

      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setBouquetToDelete(null);
        }}
        onConfirm={handleDeleteBouquet}
        title="Delete Bouquet?"
        description={
          "Deleting this bouquet will remove all associated documents.\nThis action cannot be undone."
        }
        confirmText="Delete"
        icon="/assets/trash-hover.svg"
      />

      <ShareDocuments
        open={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setBouquetToShare(null);
        }}
        bouquetId={bouquetToShare?.id}
        documentId={null}
      />
    </div>
  );
}
