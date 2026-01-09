import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Switch, notification, Select } from "antd";
const { Option } = Select;
import "./Styles/AddEditEmployee.scss";
import { MESSAGES } from "../../../../utils/Messages";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import {
    addEmployee,
    updateEmployee,
} from "../../../../services/employees.services";
import { getDepartmentsListWithoutPagination } from "../../../../services/departments.services";
import { useDebounce } from "../../../../hooks/useDebounce";
import { AddEditEmployeeProps } from "../../../../types/common";

const AddEditEmployee: React.FC<AddEditEmployeeProps> = ({
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
    const [departments, setDepartments] = useState<any[]>([]);
    const [roles, setRoles] = useState<string[]>([
        "Admin",
        "Super Admin",
        "Manager",
        "Assistant Manager",
        "Team Lead",
        "Senior Executive",
        "Executive",
        "Staff",
        "HR",
        "HR Manager",
        "Recruiter",
        "Finance Manager",
        "Accountant",
        "Operations Manager",
        "Operations Executive",
        "Project Manager",
        "Product Manager",
        "Business Analyst",
        "Developer",
        "Senior Developer",
        "QA Engineer",
        "UI/UX Designer",
        "Support Engineer",
        "Customer Support",
        "Intern",
    ]);
    const [deptOpen, setDeptOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const initialRef = useRef<any>(null);
    const [isChanged, setIsChanged] = useState(false);

    // Reset form on open
    useEffect(() => {
        if (!open) {
            setAnimateClose(true);
            setShowModal(false);
            return;
        }

        setShowModal(true);
        setAnimateClose(false);
        form.resetFields();

        const departmentValue = initialData?.department_id && initialData?.department_name
            ? { value: initialData.department_id, label: initialData.department_name }
            : undefined;

        const roleValue = initialData?.role
            ? { value: initialData.role, label: initialData.role }
            : undefined;

        const initialValues = {
            employee_name: initialData?.name || "",
            employee_email: initialData?.email || "",
            department: departmentValue,
            role: roleValue,
            is_active: initialData?.is_active ?? true,
        };

        form.setFieldsValue(initialValues);

        setStatus(initialValues.is_active);
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
            allValues.employee_name?.trim() !== initial.employee_name ||
            allValues.employee_email?.trim() !== initial.employee_email ||
            (allValues.department?.value || null) !== (initial.department?.value || null) ||
            (allValues.role?.value || null) !== (initial.role?.value || null) ||
            status !== initial.is_active;
        setIsChanged(changed);
    };

    // Lock scroll when modal open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
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
        if (showModal)
            document.addEventListener("mousedown", handleClickOutside);
        else document.removeEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showModal]);

    const handleClose = () => {
        setAnimateClose(true);
        onClose();
    };

    const fetchDepartments = async (search: string) => {
        getLoaderControl()?.showLoader();
        try {
            const res = await getDepartmentsListWithoutPagination({ payload: { search: search } });
            if (res.statusCode === 200) {
                setDepartments(res.data || []);
            } else {
                setDepartments([]);
                notification.error({
                    message: res.message || MESSAGES.ERRORS.FAILED_TO_FETCH_DEPARTMENTS,
                });
            }
        } catch (error: any) {
            setDepartments([]);
            notification.error({
                message: error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    useEffect(() => {
        fetchDepartments(debouncedSearch);
    }, [debouncedSearch]);

    const handleSubmit = async () => {
        let hasError = false;
        const values = await form.validateFields().catch(() => {
            hasError = true;
        });
        if (hasError) return;

        const payload = {
            name: values.employee_name.trim(),
            email: values.employee_email.trim(),
            department_id: values.department?.value,
            designation: values.role?.value,
            is_active: status,
        };

        try {
            getLoaderControl()?.showLoader();

            const res = isEdit
                ? await updateEmployee(initialData.id, payload)
                : await addEmployee(payload);

            if (res.statusCode === 200) {
                onClose();
                onSave();
                notification.success({
                    message:
                        res.message ||
                        (isEdit
                            ? MESSAGES.SUCCESS.EMPLOYEE_UPDATED_SUCCESSFULLY
                            : MESSAGES.SUCCESS.EMPLOYEE_CREATED_SUCCESSFULLY),
                });
            } else {
                notification.error({
                    message:
                        res.message ||
                        (isEdit
                            ? MESSAGES.ERRORS.EMPLOYEE_UPDATE_FAILED
                            : MESSAGES.ERRORS.EMPLOYEE_CREATE_FAILED),
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
            className={`add-edit-employee-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
            getContainer={false}
            transitionName=""
            zIndex={2000}
        >
            <div className="employee-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="employee-header">
                    <h2>{isEdit ? "Edit Employee" : "Add Employee"}</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form layout="vertical" form={form} className="employee-form" autoComplete="off" onValuesChange={handleFormChange}>
                    <Form.Item
                        label={<span>Employee Name <span className="star">*</span></span>}
                        name="employee_name"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(MESSAGES.ERRORS.EMPLOYEE_NAME_REQUIRED);
                                    }
                                    const nameRegex = /^[A-Za-z\s]+$/;
                                    if (!nameRegex.test(value.trim())) {
                                        return Promise.reject(MESSAGES.ERRORS.ONLY_CHARS_ALLOWED);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter employee name" />
                    </Form.Item>

                    <Form.Item
                        label={<span>Employee Email Address <span className="star">*</span></span>}
                        name="employee_email"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.trim())
                                        return Promise.reject(MESSAGES.ERRORS.EMPLOYEE_EMAIL_REQUIRED);
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(value.trim()))
                                        return Promise.reject(MESSAGES.ERRORS.INVALID_EMAIL);
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter employee email address" />
                    </Form.Item>

                    <Form.Item
                        label={<span>Department <span className="star">*</span></span>}
                        name="department"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.value) {
                                        return Promise.reject(MESSAGES.ERRORS.EMPLOYEE_DEPARTMENT_REQUIRED);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Select
                            virtual={false}
                            labelInValue
                            placeholder="- Search Department -"
                            showSearch
                            filterOption={false}
                            onSearch={(value: any) => setSearch(value)}
                            onOpenChange={(open) => {
                                setDeptOpen(open);
                                if (open && departments.length === 0) fetchDepartments("");
                            }}
                            suffixIcon={
                                <img
                                    src={deptOpen ? "/assets/search.svg" : "/assets/chevron-down.svg"}
                                    alt="icon"
                                    style={{
                                        width: deptOpen ? 18 : 24,
                                        height: deptOpen ? 18 : 24,
                                        marginRight: deptOpen ? 4 : 0,
                                    }}
                                />
                            }
                            getPopupContainer={() => document.body}
                        >
                            {departments.map((d) => (
                                <Select.Option key={d.id} value={d.id}>
                                    {d.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={<span>Employee Role <span className="star">*</span></span>}
                        name="role"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.value) {
                                        return Promise.reject(MESSAGES.ERRORS.EMPLOYEE_ROLE_REQUIRED);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Select
                            virtual={false}
                            labelInValue
                            placeholder="- Select Employee Role -"
                            onOpenChange={setRoleOpen}
                            suffixIcon={
                                <img
                                    src="/assets/chevron-down.svg"
                                    alt="arrow"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        transition: "transform 0.2s ease",
                                        transform: roleOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                />
                            }
                            getPopupContainer={() => document.body}
                        >
                            {roles.map((role) => (
                                <Option key={role} value={role}>
                                    {role}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>


                    <div className="status-row">
                        <label>
                            Status
                            <span className="sub-label">Set initial employee status</span>
                        </label>
                        <div className="d-center">
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
                                        allValues.employee_name?.trim() !== initial.employee_name ||
                                        allValues.employee_email?.trim() !== initial.employee_email ||
                                        (allValues.department?.value || null) !== (initial.department?.value || null) ||
                                        (allValues.role?.value || null) !== (initial.role?.value || null) ||
                                        checked !== initial.is_active;
                                    setIsChanged(changed);
                                }}
                            />
                        </div>
                    </div>
                </Form>

                {/* FOOTER */}
                <div className="employee-footer">
                    <Button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button className="save-btn" onClick={handleSubmit} disabled={isEdit && !isChanged}>
                        {isEdit ? "Update Employee" : "Add Employee"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditEmployee;