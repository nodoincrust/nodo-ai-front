import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, Switch, notification } from "antd";
import "./Styles/AddEditCompany.scss";
import { MESSAGES } from "../../../utils/Messages";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { createCompany, updateCompany } from "../../../services/company.services";

interface AddEditCompanyProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
}

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

    /* ---------------- MODAL OPEN / CLOSE ---------------- */
    useEffect(() => {
        if (open) {
            setShowModal(true);
            setAnimateClose(false);
            form.setFieldsValue({
                company_name: initialData?.name || "",
                contact_name: initialData?.contact_name || "",
                contact_email: initialData?.contact_email || "",
                contact_number: initialData?.contact_number || "",
                storage: initialData?.total_space
                    ? Math.floor(initialData.total_space / (1024 * 1024 * 1024))
                    : "",
            });
            setStatus(initialData?.is_active ?? true);
        } else {
            setAnimateClose(true);
            setTimeout(() => setShowModal(false), 300);
        }
    }, [open, initialData, form]);

    /* ---------------- PREVENT BACKGROUND SCROLL ---------------- */
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
    }, [showModal]);

    /* ---------------- CLICK OUTSIDE ---------------- */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        };

        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showModal]);

    const handleClose = () => {
        setAnimateClose(true);
        setTimeout(() => onClose(), 300);
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async () => {
        let hasError = false;
        const values = await form.validateFields().catch(() => {
            hasError = true;
        });
        if (hasError) return;

        const payload = {
            name: values.company_name.trim(),
            contact_name: values.contact_name.trim(),
            contact_email: values.contact_email.trim(),
            contact_number: values.contact_number,
            total_space: Number(values.storage) * 1024 * 1024 * 1024,
            is_active: status,
        };

        try {
            getLoaderControl()?.showLoader();
            const res = isEdit
                ? await updateCompany(initialData.id, payload)
                : await createCompany(payload);

            if (res.statusCode === 200) {
                notification.success({
                    message: res.message || MESSAGES.SUCCESS.SAVED_SUCCESSFULLY,
                });
                handleClose();
                onSave();
            } else {
                notification.error({ message: res.message });
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
            width={420}
            className={`add-edit-company-modal ${animateClose ? "modal-exit" : "modal-enter"
                }`}
            getContainer={false}
            transitionName=""
        >
            <div className="company-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="company-header">
                    <h2>{isEdit ? "Edit Company" : "Add Company"}</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form layout="vertical" form={form} autoComplete="off">
                    <Form.Item
                        label="Contact Person Number"
                        name="contact_number"
                        rules={[{ required: true, message: "Phone number is required" }]}
                    >
                        <Input placeholder="Enter contact phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Company Name"
                        name="company_name"
                        rules={[{ required: true, message: "Company name is required" }]}
                    >
                        <Input placeholder="Enter company name" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Person Name"
                        name="contact_name"
                        rules={[{ required: true, message: "Contact name is required" }]}
                    >
                        <Input placeholder="Enter contact person’s full name" />
                    </Form.Item>

                    <Form.Item
                        label="Contact Person Email"
                        name="contact_email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Enter valid email" },
                        ]}
                    >
                        <Input placeholder="Enter contact email address" />
                    </Form.Item>

                    <Form.Item
                        label="Storage (in GB)"
                        name="storage"
                        rules={[{ required: true, message: "Storage is required" }]}
                    >
                        <Input placeholder="Enter storage value" />
                    </Form.Item>

                    <div className="status-row">
                        <label>
                            Status <span>Set initial company status</span>
                        </label>
                        <Switch checked={status} onChange={setStatus} />
                    </div>
                </Form>

                {/* FOOTER */}
                <div className="company-footer">
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="primary" onClick={handleSubmit}>
                        {isEdit ? "Update Company" : "Add Company"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditCompany;
