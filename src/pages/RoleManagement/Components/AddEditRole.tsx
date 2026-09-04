import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Select, Checkbox, notification } from "antd";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../utils/Messages";
import {
  addRole,
  getRoleById,
  getRoleModules,
  getRoleReportingOptions,
  updateRole,
  type RoleListItem,
  type RoleModuleOption,
  type RolePermissionPayload,
  type RoleReportingOption,
} from "../../../services/roleManagement.services";
import "./Styles/AddEditRole.scss";

type PermissionState = {
  module_key: string;
  label: string;
  selected: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  actions: string[];
};

interface AddEditRoleProps {
  open: boolean;
  roleId: number | null;
  existingRoles: RoleListItem[];
  onClose: () => void;
  onSave: () => void;
}

const emptyPermission = (module: RoleModuleOption): PermissionState => ({
  module_key: module.module_key,
  label: module.label,
  selected: false,
  add: false,
  edit: false,
  delete: false,
  actions: module.actions || ["add", "edit", "delete"],
});

const AddEditRole: React.FC<AddEditRoleProps> = ({
  open,
  roleId,
  existingRoles,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(roleId);
  const [form] = Form.useForm();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(open);
  const [animateClose, setAnimateClose] = useState(false);
  const [permissions, setPermissions] = useState<PermissionState[]>([]);
  const [reportingOptions, setReportingOptions] = useState<RoleReportingOption[]>(
    [],
  );
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    if (!open) {
      setAnimateClose(true);
      setShowModal(false);
      return;
    }

    setShowModal(true);
    setAnimateClose(false);
    setPermissionError("");
    form.resetFields();
    void loadFormData();
  }, [open, roleId]);

  useEffect(() => {
    if (showModal) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showModal]);

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      modalRef.current &&
      !modalRef.current.contains(target) &&
      !(target as HTMLElement).closest(".ant-select-dropdown")
    ) {
      handleClose();
    }
  };

  useEffect(() => {
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const loadFormData = async () => {
    getLoaderControl()?.showLoader();
    try {
      const [modulesRes, reportingRes, roleRes] = await Promise.all([
        getRoleModules(),
        getRoleReportingOptions(),
        roleId ? getRoleById(roleId) : Promise.resolve(null),
      ]);

      if (modulesRes?.statusCode !== 200) {
        notification.error({
          message:
            modulesRes?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_ROLE_MODULES,
        });
        return;
      }

      if (reportingRes?.statusCode !== 200) {
        notification.error({
          message:
            reportingRes?.message ||
            MESSAGES.ERRORS.FAILED_TO_FETCH_REPORTING_ROLES,
        });
        return;
      }

      const modules: RoleModuleOption[] = modulesRes.data || [];
      const reporting: RoleReportingOption[] = (reportingRes.data || []).filter(
        (option: RoleReportingOption) => option.id !== roleId,
      );
      setReportingOptions(reporting);

      const detail = roleRes?.statusCode === 200 ? roleRes.data : null;

      if (roleId && roleRes && roleRes.statusCode !== 200) {
        notification.error({
          message: roleRes?.message || MESSAGES.ERRORS.FAILED_TO_FETCH_ROLE,
        });
        return;
      }

      const nextPermissions = modules.map((module) => {
        const fromDetail = detail?.permissions?.find(
          (item: any) => item.module_key === module.module_key,
        );

        if (!fromDetail) return emptyPermission(module);

        return {
          module_key: module.module_key,
          label: fromDetail.label || module.label,
          selected: Boolean(fromDetail.selected ?? fromDetail.view),
          add: Boolean(fromDetail.add),
          edit: Boolean(fromDetail.edit),
          delete: Boolean(fromDetail.delete),
          actions: module.actions || ["add", "edit", "delete"],
        };
      });

      setPermissions(nextPermissions);
      form.setFieldsValue({
        role_name: detail?.name || "",
        reporting_role_id: detail?.reporting_role_id ?? undefined,
      });
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  const handleClose = () => {
    setAnimateClose(true);
    setTimeout(() => onClose(), 300);
  };

  const handleParentChange = (moduleKey: string, checked: boolean) => {
    setPermissionError("");
    setPermissions((prev) =>
      prev.map((item) =>
        item.module_key === moduleKey
          ? {
              ...item,
              selected: checked,
              add: checked ? item.add : false,
              edit: checked ? item.edit : false,
              delete: checked ? item.delete : false,
            }
          : item,
      ),
    );
  };

  const handleActionChange = (
    moduleKey: string,
    action: "add" | "edit" | "delete",
    checked: boolean,
  ) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.module_key === moduleKey && item.selected
          ? { ...item, [action]: checked }
          : item,
      ),
    );
  };

  const validateRoleName = (_: any, value: string) => {
    const trimmed = value?.trim() || "";
    if (!trimmed) {
      return Promise.reject(new Error(MESSAGES.ERRORS.ROLE_NAME_REQUIRED));
    }
    if (trimmed.length < 4) {
      return Promise.reject(new Error(MESSAGES.ERRORS.ROLE_NAME_MIN_LENGTH));
    }
    if (trimmed.length > 50) {
      return Promise.reject(new Error(MESSAGES.ERRORS.ROLE_NAME_MAX_LENGTH));
    }

    const duplicate = existingRoles.some(
      (role) =>
        role.name.trim().toLowerCase() === trimmed.toLowerCase() &&
        role.id !== roleId,
    );

    if (duplicate) {
      return Promise.reject(new Error(MESSAGES.ERRORS.ROLE_NAME_EXISTS));
    }

    return Promise.resolve();
  };

  const handleSubmit = async () => {
    let hasError = false;
    const values = await form.validateFields().catch(() => {
      hasError = true;
    });
    if (hasError) return;

    const selectedPermissions = permissions.filter((item) => item.selected);
    if (selectedPermissions.length === 0) {
      setPermissionError(MESSAGES.ERRORS.ROLE_PERMISSION_REQUIRED);
      return;
    }

    const payloadPermissions: RolePermissionPayload[] = selectedPermissions.map(
      (item) => ({
        module_key: item.module_key,
        selected: true,
        add: item.add,
        edit: item.edit,
        delete: item.delete,
      }),
    );

    const payload = {
      name: values.role_name.trim(),
      reporting_role_id: values.reporting_role_id ?? null,
      permissions: payloadPermissions,
    };

    try {
      getLoaderControl()?.showLoader();
      const res = isEdit
        ? await updateRole(roleId as number, payload)
        : await addRole(payload);

      if (res?.statusCode === 200) {
        setAnimateClose(true);
        setTimeout(() => {
          onClose();
          onSave();
          notification.success({
            message:
              res.message ||
              (isEdit
                ? MESSAGES.SUCCESS.ROLE_UPDATED_SUCCESSFULLY
                : MESSAGES.SUCCESS.ROLE_CREATED_SUCCESSFULLY),
          });
        }, 300);
      } else {
        notification.error({
          message:
            res?.message ||
            (isEdit
              ? MESSAGES.ERRORS.ROLE_UPDATE_FAILED
              : MESSAGES.ERRORS.ROLE_CREATE_FAILED),
        });
      }
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
      });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  if (!showModal) return null;

  return (
    <Modal
      open={showModal}
      footer={null}
      closable={false}
      centered
      width={560}
      destroyOnClose
      className={`add-edit-role-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
      getContainer={false}
      maskClosable={false}
    >
      <div className="role-wrapper" ref={modalRef}>
        <div className="role-header">
          <div className="left">
            <h2>{isEdit ? "Update Role" : "Add Role"}</h2>
          </div>
          <div className="close-icon" onClick={handleClose}>
            <img src="/assets/x-02.svg" alt="Close" />
          </div>
        </div>

        <Form form={form} layout="vertical" className="role-form">
          <Form.Item
            label="Role Name"
            name="role_name"
            required
            rules={[{ validator: validateRoleName }]}
          >
            <Input placeholder="Enter Role name" maxLength={50} />
          </Form.Item>

          <div className="permission-field">
            <label className="permission-label">
              Menu Permission <span className="required">*</span>
            </label>

            <div className="permission-box">
              {permissions.map((item) => (
                <div key={item.module_key} className="permission-row">
                  <Checkbox
                    checked={item.selected}
                    onChange={(e) =>
                      handleParentChange(item.module_key, e.target.checked)
                    }
                  >
                    {item.label}
                  </Checkbox>

                  <div className="permission-actions">
                    {item.actions.includes("add") && (
                      <Checkbox
                        checked={item.add}
                        disabled={!item.selected}
                        onChange={(e) =>
                          handleActionChange(
                            item.module_key,
                            "add",
                            e.target.checked,
                          )
                        }
                      >
                        Add
                      </Checkbox>
                    )}
                    {item.actions.includes("edit") && (
                      <Checkbox
                        checked={item.edit}
                        disabled={!item.selected}
                        onChange={(e) =>
                          handleActionChange(
                            item.module_key,
                            "edit",
                            e.target.checked,
                          )
                        }
                      >
                        Edit
                      </Checkbox>
                    )}
                    {item.actions.includes("delete") && (
                      <Checkbox
                        checked={item.delete}
                        disabled={!item.selected}
                        onChange={(e) =>
                          handleActionChange(
                            item.module_key,
                            "delete",
                            e.target.checked,
                          )
                        }
                      >
                        Delete
                      </Checkbox>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {permissionError && (
              <div className="permission-error">{permissionError}</div>
            )}
          </div>

          <Form.Item label="Reporting Role" name="reporting_role_id">
            <Select
              allowClear
              placeholder="-select reporting role-"
              options={reportingOptions.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
          </Form.Item>
        </Form>

        <div className="role-footer">
          <Button className="cancel-btn" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="primary" className="save-btn" onClick={handleSubmit}>
            {isEdit ? "Update Role" : "Add Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEditRole;
