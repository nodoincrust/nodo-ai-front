import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Switch, notification, Select } from "antd";
import "./Styles/AddEditDepartment.scss";
import { MESSAGES } from "../../../../utils/Messages";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { addDepartment, updateDepartment } from "../../../../services/departments.services";
import { getEmployeesList } from "../../../../services/employees.services";

interface AddEditDepartmentProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

const AddEditDepartment: React.FC<AddEditDepartmentProps> = ({
    open,
    onClose,
    onSave,
    initialData,
}) => {
    const isEdit = Boolean(initialData?.id);
    const [form] = Form.useForm();
    const modalRef = useRef<HTMLDivElement>(null);

    const [showModal, setShowModal] = useState(open);
    const [animateClose, setAnimateClose] = useState(false);
    const [status, setStatus] = useState<boolean>(initialData?.is_active ?? true);
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        if (!open) {
            setAnimateClose(true);
            setShowModal(false);
            return;
        }

        setShowModal(true);
        setAnimateClose(false);

        form.resetFields();

        if (initialData?.head_user_id && initialData?.head_name) {
            const selectedEmployee = {
                id: initialData.head_user_id,
                name: initialData.head_name,
            };

            // Ensure selected option exists
            setEmployees([selectedEmployee]);

            // Set label + value for Select
            form.setFieldsValue({
                assign_to: {
                    value: selectedEmployee.id,
                    label: selectedEmployee.name,
                },
            });
        }

        form.setFieldsValue({
            department_name: initialData?.name || "",
            department_description: initialData?.description || "",
        });

        setStatus(initialData?.is_active ?? true);
    }, [open, initialData]);

    useEffect(() => {
        if (showModal) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
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

    const fetchEmployees = async (search = "") => {
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
                message: error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    const handleSubmit = async () => {
        let hasError = false;
        const values = await form.validateFields().catch(() => { hasError = true; });
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
                    message: res.message || (
                        isEdit
                            ? MESSAGES.ERRORS.DEPARTMENT_UPDATE_FAILED
                            : MESSAGES.ERRORS.DEPARTMENT_CREATE_FAILED
                    ),
                });
            }
        } catch (error: any) {
            notification.error({
                message: error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
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
            className={`add-edit-department-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
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
                <Form layout="vertical" form={form} autoComplete="off" className="department-form">
                    <Form.Item
                        label={<span>Department Name <span className="star">*</span></span>}
                        name="department_name"
                        rules={[{
                            validator: (_, value) => {
                                if (!value || !value.trim()) return Promise.reject(MESSAGES.ERRORS.DEPARTMENT_NAME_REQUIRED);
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input placeholder="Enter department name" />
                    </Form.Item>

                    <Form.Item
                        label="Department Description"
                        name="department_description"
                    >
                        <Input.TextArea className="textarea" placeholder="Enter description about department" rows={3} autoSize={false} />
                    </Form.Item>
                    <Form.Item label="Assign To" name="assign_to">
                        <Select
                            labelInValue
                            optionLabelProp="label"
                            placeholder="- Search Employees -"
                            suffixIcon={<img src="/assets/search.svg" alt="search" />}
                            placement="bottomLeft"
                            showSearch={{
                                filterOption: false,
                                onSearch: (value) => fetchEmployees(value),
                            }}

                            /* Replaces onDropdownVisibleChange */
                            onOpenChange={(open) => {
                                if (open && employees.length <= 1) {
                                    fetchEmployees("");
                                }
                            }}

                            options={employees.map(emp => ({
                                label: emp.name,
                                value: emp.id,
                            }))}
                            getPopupContainer={(triggerNode) => triggerNode.parentElement!}
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
                                onChange={setStatus}
                                className="status-toggle"
                            />
                        </div>
                    </div>
                </Form>

                {/* FOOTER */}
                <div className="department-footer">
                    <Button type="primary" className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="primary" className="save-btn" onClick={handleSubmit}>
                        {isEdit ? "Update Department" : "Add Department"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditDepartment;