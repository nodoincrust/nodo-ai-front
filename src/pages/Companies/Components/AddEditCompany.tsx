import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Switch, notification } from "antd";
import "./Styles/AddEditCompany.scss";
import { MESSAGES } from "../../../utils/Messages";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { addCompany, updateCompany } from "../../../services/companies.services";
import { allowOnlyNumbersInput } from "../../../utils/utilFunctions";
import { AddEditCompanyProps } from "../../../types/common";
const AddEditCompany: React.FC<AddEditCompanyProps> = ({
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

    useEffect(() => {
        if (open) {
            setShowModal(true);
            setAnimateClose(false);
            form.setFieldsValue({
                company_name: initialData?.name || "",
                contact_name: initialData?.contact_person || "",
                contact_email: initialData?.contact_email || "",
                contact_number: initialData?.contact_number || "",
                storage: initialData?.total_space ?? "",
            });
            setStatus(initialData?.is_active ?? true);
        } else {
            setAnimateClose(true);
            setShowModal(false);
        }
    }, [open, initialData, form]);

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
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = async () => {
        let hasError = false;
        const values = await form.validateFields().catch(() => { hasError = true; });
        if (hasError) return;

        const payload = {
            name: values.company_name.trim(),
            contact_person: values.contact_name.trim(),
            contact_email: values.contact_email.trim(),
            contact_number: values.contact_number,
            total_space: Number(values.storage),
            is_active: status,
        };

        try {
            getLoaderControl()?.showLoader();
            const res = isEdit
                ? await updateCompany(initialData.id, payload)
                : await addCompany(payload);

            if (res.statusCode === 200) {
                setAnimateClose(true);
                setTimeout(() => {
                    onClose();
                    onSave();
                    notification.success({
                        message: res.message || MESSAGES.SUCCESS.COMPANY_SAVED_SUCCESSFULLY,
                    });
                }, 300);
            } else {
                notification.error({ message: res.message || MESSAGES.ERRORS.COMPANY_SAVED_FAILED });
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
            className={`add-edit-company-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
            getContainer={false}
            transitionName=""
            zIndex={2000}
        >
            <div className="company-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="company-header">
                    <div className="left">
                        <h2>{isEdit ? "Edit Company" : "Add Company"}</h2>
                    </div>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form layout="vertical" form={form} autoComplete="off" className="company-form">
                    {/* Company Name */}
                    <Form.Item
                        label={<span>Company Name <span className="star">*</span></span>}
                        name="company_name"
                        rules={[{
                            validator: (_: any, value: any) => {
                                if (!value || !value.trim()) return Promise.reject(MESSAGES.ERRORS.COMPANY_NAME_REQUIRED);
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input placeholder="Enter company name" />
                    </Form.Item>

                    {/* Contact Name */}
                    <Form.Item
                        label={<span>Contact Person Name <span className="star">*</span></span>}
                        name="contact_name"
                        rules={[{
                            validator: (_: any, value: any) => {
                                if (!value || !value.trim()) return Promise.reject(MESSAGES.ERRORS.CONTACT_NAME_REQUIRED);
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input placeholder="Enter contact person’s full name" />
                    </Form.Item>

                    {/* Contact Email */}
                    <Form.Item
                        label={<span>Contact Person Email Address <span className="star">*</span></span>}
                        name="contact_email"
                        rules={[{
                            validator: (_: any, value: any) => {
                                if (!value || !value.trim()) return Promise.reject(MESSAGES.ERRORS.EMAIL_REQUIRED);
                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (!emailRegex.test(value)) return Promise.reject(MESSAGES.ERRORS.ENTER_VALID_EMAIL);
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input placeholder="Enter contact email address" />
                    </Form.Item>

                    {/* Contact Number */}
                    <Form.Item
                        label={
                            <span>
                                Contact Person Number <span className="star">*</span>
                            </span>
                        }
                        name="contact_number"
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(
                                            MESSAGES.ERRORS.CONTACT_NUMBER_REQUIRED
                                        );
                                    }

                                    if (value.length !== 10) {
                                        return Promise.reject(
                                            MESSAGES.ERRORS.INVALID_CONTACT_NUMBER
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            placeholder="Enter contact person number"
                            maxLength={10}
                            inputMode="numeric"
                            onKeyDown={(e) => {
                                const allowedKeys = [
                                    "Backspace",
                                    "Delete",
                                    "Tab",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Home",
                                    "End",
                                ];

                                if (allowedKeys.includes(e.key)) return;

                                // Non-numeric key pressed
                                if (!/^\d$/.test(e.key)) {
                                    e.preventDefault();

                                    // FORCE show error
                                    form.setFields([
                                        {
                                            name: "contact_number",
                                            errors: [MESSAGES.ERRORS.ONLY_NUMBERS_ALLOWED],
                                        },
                                    ]);
                                }
                            }}
                            // onPaste={(e) => {
                            //     const pasteData = e.clipboardData.getData("text");

                            //     if (!/^\d+$/.test(pasteData)) {
                            //         e.preventDefault();

                            //         form.setFields([
                            //             {
                            //                 name: "contact_number",
                            //                 errors: ["Only numbers allowed"],
                            //             },
                            //         ]);
                            //     }
                            // }}
                            onChange={(e) => {
                                const numericValue = allowOnlyNumbersInput(e.target.value);

                                form.setFieldsValue({
                                    contact_number: numericValue,
                                });

                                // clear manual error + revalidate
                                form.validateFields(["contact_number"]).catch(() => { });
                            }}
                        />
                    </Form.Item>

                    {/* Storage */}
                    <Form.Item
                        label={
                            <span>
                                Storage <span className="sub-label">(in GB)</span>{" "}
                                <span className="star">*</span>
                            </span>
                        }
                        name="storage"
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.toString().trim()) {
                                        return Promise.reject(
                                            MESSAGES.ERRORS.STORAGE_REQUIRED
                                        );
                                    }

                                    if (Number(value) <= 0) {
                                        return Promise.reject(
                                            MESSAGES.ERRORS.INVALID_STORAGE
                                        );
                                    }

                                    if (Number(value) > 1024) {
                                        return Promise.reject("Storage cannot exceed 1024 GB");
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            placeholder="Enter storage value"
                            maxLength={10}
                            inputMode="numeric"
                            onKeyDown={(e) => {
                                const allowedKeys = [
                                    "Backspace",
                                    "Delete",
                                    "Tab",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Home",
                                    "End",
                                ];

                                if (allowedKeys.includes(e.key)) return;

                                // Non-numeric key pressed
                                if (!/^\d$/.test(e.key)) {
                                    e.preventDefault();

                                    // FORCE show "Only numbers allowed"
                                    form.setFields([
                                        {
                                            name: "storage",
                                            errors: [MESSAGES.ERRORS.ONLY_NUMBERS_ALLOWED],
                                        },
                                    ]);
                                }
                            }}
                            // onPaste={(e) => {
                            //     const pasteData = e.clipboardData.getData("text");

                            //     if (!/^\d+$/.test(pasteData)) {
                            //         e.preventDefault();

                            //         form.setFields([
                            //             {
                            //                 name: "storage",
                            //                 errors: [MESSAGES.ERRORS.ONLY_NUMBERS_ALLOWED],
                            //             },
                            //         ]);
                            //     }
                            // }}
                            onChange={(e) => {
                                const numericValue = allowOnlyNumbersInput(e.target.value);

                                form.setFieldsValue({
                                    storage: numericValue,
                                });

                                // clear manual error + revalidate
                                form.validateFields(["storage"]).catch(() => { });
                            }}
                        />
                    </Form.Item>

                    {/* STATUS */}
                    <div className="status-row">
                        <label>
                            Status
                            <span className="sub-label">Set initial company status</span>
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
                <div className="company-footer">
                    <Button type="primary" className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="primary" className="save-btn" onClick={handleSubmit}>
                        {isEdit ? "Update Company" : "Add Company"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditCompany;
