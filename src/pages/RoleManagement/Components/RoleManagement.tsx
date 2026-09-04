import { useEffect, useState } from "react";
import { notification, Tag } from "antd";
import Header from "../../../CommonComponents/Header/Header";
import Table from "../../../CommonComponents/Table/Components/Table";
import ConfirmModal from "../../../CommonComponents/Confirm Modal/ConfirmModal";
import { useDebounce } from "../../../hooks/useDebounce";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../utils/Messages";
import { scrollLayoutToTop } from "../../../utils/utilFunctions";
import {
  deleteRole,
  getRolesList,
  type RoleListItem,
} from "../../../services/roleManagement.services";
import AddEditRole from "./AddEditRole";
import "./Styles/RoleManagement.scss";

export default function RoleManagement() {
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [roleList, setRoleList] = useState<RoleListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  const fetchRoles = async () => {
    getLoaderControl()?.showLoader();
    try {
      const payload = {
        page: currentPage,
        pagelimit: pageSize,
        search: debouncedSearch,
      };

      const res: any = await getRolesList(payload);

      if (res?.statusCode === 200) {
        setRoleList(res?.data || []);
        setCount(res?.total || 0);
      } else {
        setRoleList([]);
        setCount(0);
        notification.error({
          message: res?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_ROLES,
        });
      }
    } catch (error: any) {
      setRoleList([]);
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
    fetchRoles();
  }, [currentPage, debouncedSearch, pageSize]);

  useEffect(() => {
    scrollLayoutToTop();
  }, [currentPage, pageSize]);

  const openAddRole = () => {
    setSelectedRoleId(null);
    setIsAddEditOpen(true);
  };

  const openEditRole = (role: RoleListItem) => {
    if (!role.is_editable) return;
    setSelectedRoleId(role.id);
    setIsAddEditOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    getLoaderControl()?.showLoader();
    try {
      const res: any = await deleteRole(roleToDelete);

      if (res?.statusCode === 200) {
        notification.success({
          message:
            res?.message || MESSAGES.SUCCESS.ROLE_DELETED_SUCCESSFULLY,
        });

        if (roleList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchRoles();
        }
      } else {
        notification.error({
          message: res?.message || MESSAGES.ERRORS.ROLE_DELETE_FAILED,
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
      setRoleToDelete(null);
      getLoaderControl()?.hideLoader();
    }
  };

  return (
    <div className="role-management-container">
      <Header
        title="Role Management"
        count={`${count} Roles`}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onAddClick={openAddRole}
        addButtonText="Add Role"
        searchPlaceholder="Search by Role name..."
      />

      <Table
        data={roleList}
        columns={[
          {
            title: "Role Name",
            render: (row) => <span className="role-name">{row.name}</span>,
          },
          {
            title: "Role Permissions",
            render: (row) => (
              <div className="permission-chips">
                {(row.permissions || []).length === 0 ? (
                  <span>—</span>
                ) : (
                  (row.permissions || []).map((permission) => (
                    <Tag key={permission.module_key} className="permission-chip">
                      {permission.label}
                    </Tag>
                  ))
                )}
              </div>
            ),
          },
          {
            title: "Reporting Role",
            render: (row) => (
              <span>{row.reporting_role?.name || "—"}</span>
            ),
          },
        ]}
        actions={(row) =>
          row.is_editable ? (
            <div className="role-actions">
              <img
                src="/assets/edit.svg"
                alt="Edit"
                onClick={() => openEditRole(row)}
              />
              <img
                src="/assets/trash.svg"
                alt="Delete"
                onClick={() => {
                  setRoleToDelete(row.id);
                  setShowDeleteModal(true);
                }}
              />
            </div>
          ) : (
            <span className="role-actions-empty">—</span>
          )
        }
        actionsTitle="Action"
        currentPage={currentPage}
        totalPages={Math.ceil(count / pageSize) || 1}
        totalRecords={count}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        emptyText="No roles found"
      />

      {isAddEditOpen && (
        <AddEditRole
          open={isAddEditOpen}
          roleId={selectedRoleId}
          existingRoles={roleList}
          onClose={() => {
            setIsAddEditOpen(false);
            setSelectedRoleId(null);
          }}
          onSave={() => {
            fetchRoles();
            setIsAddEditOpen(false);
            setSelectedRoleId(null);
          }}
        />
      )}

      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role?"
        description="Deleting this role cannot be undone."
        confirmText="Delete"
        icon="/assets/trash-hover.svg"
      />
    </div>
  );
}
