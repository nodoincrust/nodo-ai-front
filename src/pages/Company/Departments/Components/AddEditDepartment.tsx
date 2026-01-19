import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Switch, notification, Select } from "antd";
import "./Styles/AddEditDepartment.scss";
import { MESSAGES } from "../../../../utils/Messages";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import {
  addDepartment,
  updateDepartment,
} from "../../../../services/departments.services";
import { getEmployeesList } from "../../../../services/employees.services";
import { useDebounce } from "../../../../hooks/useDebounce";
import { AddEditDepartmentProps } from "../../../../types/common";
import type { FormInstance } from "antd/es/form";

const AddEditDepartment: React.FC<AddEditDepartmentProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const isEdit = Boolean(initialData?.id);
  const [form] = Form.useForm();
  const modalRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [showModal, setShowModal] = useState(open);
  const [animateClose, setAnimateClose] = useState(false);
  const [status, setStatus] = useState<boolean>(initialData?.is_active ?? true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [deptOpen, setDeptOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const initialRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setAnimateClose(true);
      setShowModal(false);
      return;
    }

    setShowModal(true);
    setAnimateClose(false);

    form.resetFields();

    let assignToValue = null;

    if (initialData?.head_user_id && initialData?.head_name) {
      const selectedEmployee = {
        id: initialData.head_user_id,
        name: initialData.head_name,
      };

      // Ensure selected option exists
      setEmployees([selectedEmployee]);

      assignToValue = {
        value: selectedEmployee.id,
        label: selectedEmployee.name,
      };

      form.setFieldsValue({
        assign_to: assignToValue,
      });
    }

    const initialValues = {
      department_name: initialData?.name || "",
      department_description: initialData?.description || "",
      assign_to: assignToValue,
      is_active: initialData?.is_active ?? true,
    };

    form.setFieldsValue({
      department_name: initialData?.name || "",
      department_description: initialData?.description || "",
    });

    setStatus(initialData?.is_active ?? true);
    initialRef.current = initialValues;
    setIsChanged(false);
  }, [open, initialData]);

  const handleFormChange = (_: any, allValues: any) => {
    if (!isEdit) {
      setIsChanged(true);
      return;
    }

    const initial = initialRef.current;

    const changed =
      allValues.department_name?.trim() !== initial.department_name ||
      allValues.department_description?.trim() !==
        initial.department_description ||
      (allValues.assign_to?.value || null) !==
        (initial.assign_to?.value || null) ||
      status !== initial.is_active;

    setIsChanged(changed);
  };

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
      !(target as HTMLElement).closest(".ant-select-dropdown") &&
      !(target as HTMLElement).closest(".ant-picker-dropdown")
    ) {
      handleClose();
    }
  };

  useEffect(() => {
    if (showModal) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const handleClose = () => {
    setAnimateClose(true);
    onClose();
  };

  const fetchEmployees = async (search: string) => {
    try {
      getLoaderControl()?.showLoader();

      const res = await getEmployeesList({ search });

      if (res.statusCode === 200) {
        setEmployees(res.data || []);
      } else {
        notification.error({
          message: res.message || MESSAGES.ERRORS.FAILED_TO_FETCH_EMPLOYEES,
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

  useEffect(() => {
    fetchEmployees(debouncedSearch);
  }, [debouncedSearch]);

  const handleSubmit = async () => {
    let hasError = false;
    const values = await form.validateFields().catch(() => {
      hasError = true;
    });
    if (hasError) return;

    const payload = {
      name: values.department_name.trim(),
      description: values.department_description.trim(),
      head_user_id: values.assign_to?.value || null,
      is_active: status,
    };

    try {
      getLoaderControl()?.showLoader();
      const res = isEdit
        ? await updateDepartment(initialData.id, payload)
        : await addDepartment(payload);

      if (res.statusCode === 200) {
        setAnimateClose(true);
        onClose();
        onSave();
        notification.success({
          message:
            res.message ||
            (isEdit
              ? MESSAGES.SUCCESS.DEPARTMENT_UPDATED_SUCCESSFULLY
              : MESSAGES.SUCCESS.DEPARTMENT_CREATED_SUCCESSFULLY),
        });
      } else {
        notification.error({
          message:
            res.message ||
            (isEdit
              ? MESSAGES.ERRORS.DEPARTMENT_UPDATE_FAILED
              : MESSAGES.ERRORS.DEPARTMENT_CREATE_FAILED),
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
      width={412}
      className={`add-edit-department-modal ${
        animateClose ? "modal-exit" : "modal-enter"
      }`}
      getContainer={false}
      transitionName=""
      zIndex={2000}
    >
      <div className="department-wrapper" ref={modalRef}>
        {/* HEADER */}
        <div className="department-header">
          <div className="left">
            <h2>{isEdit ? "Edit Department" : "Add Department"}</h2>
          </div>
          <div className="close-icon" onClick={handleClose}>
            <img src="/assets/x-02.svg" alt="close" />
          </div>
        </div>

        {/* FORM */}
        <Form
          layout="vertical"
          form={form}
          autoComplete="off"
          className="department-form"
          onValuesChange={handleFormChange}
        >
          <Form.Item
            label={
              <span>
                Department Name <span className="star">*</span>
              </span>
            }
            name="department_name"
            rules={[
              {
                validator: (_: any, value: any) => {
                  if (!value || !value.trim())
                    return Promise.reject(
                      MESSAGES.ERRORS.DEPARTMENT_NAME_REQUIRED
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>

          <Form.Item
            label="Department Description"
            name="department_description"
          >
            <Input.TextArea
              className="textarea"
              placeholder="Enter description about department"
              rows={3}
              autoSize={false}
            />
          </Form.Item>
          <Form.Item label="Assign To" name="assign_to">
            <Select
              virtual={false}
              labelInValue
              optionLabelProp="label"
              placeholder="- Search Employees -"
              suffixIcon={
                <img
                  src={
                    deptOpen ? "/assets/search.svg" : "/assets/chevron-down.svg"
                  }
                  alt="icon"
                  style={{
                    width: deptOpen ? 18 : 24,
                    height: deptOpen ? 18 : 24,
                    marginRight: deptOpen ? 4 : 0,
                  }}
                />
              }
              placement="bottomLeft"
              showSearch
              filterOption={false}
              onSearch={(value: any) => setSearch(value)}
              onOpenChange={(open) => {
                setDeptOpen(open);
                if (open && employees.length === 0) fetchEmployees("");
              }}
              options={[
                {
                  label: "N/A",
                  value: "",
                },
                ...employees.map((emp) => ({
                  label: `${emp.name} (${emp.department_name})`,
                  value: emp.id,
                })),
              ]}
              getPopupContainer={() => document.body}
              onChange={(value, option) => {
                // Remove cursor after selecting option
                const input = document.querySelector<HTMLInputElement>(
                  ".add-edit-department-modal .ant-select-selector input"
                );
                if (input) {
                  input.blur(); // removes cursor
                }
              }}
              onFocus={(e) => {
                // Move cursor to end when user clicks
                const input = e.target as HTMLInputElement;
                const length = input.value.length;
                input.setSelectionRange(length, length);
              }}
            />
          </Form.Item>

          {/* STATUS */}
          <div className="status-row">
            <label>
              Status
              <span className="sub-label">Set initial department status</span>
            </label>
            <div className="d-center gap-6">
              <span className={`status-text ${status ? "active" : "inactive"}`}>
                {status ? "Active" : "Inactive"}
              </span>

              <Switch
                checked={status}
                className="status-toggle"
                onChange={(checked) => {
                  setStatus(checked);
                  const initial = initialRef.current;
                  const allValues = form.getFieldsValue(true);
                  const changed =
                    allValues.department_name?.trim() !==
                      initial.department_name ||
                    allValues.department_description?.trim() !==
                      initial.department_description ||
                    (allValues.assign_to?.value || null) !==
                      (initial.assign_to?.value || null) ||
                    checked !== initial.is_active;
                  setIsChanged(changed);
                }}
              />
            </div>
          </div>
        </Form>

        {/* FOOTER */}
        <div className="department-footer">
          <Button type="primary" className="cancel-btn" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            className="save-btn"
            onClick={handleSubmit}
            disabled={isEdit && !isChanged}
          >
            {isEdit ? "Update Department" : "Add Department"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEditDepartment;
