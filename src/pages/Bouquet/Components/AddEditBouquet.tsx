import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Form, notification } from "antd";
import "./Styles/AddEditBouquet.scss";
import { MESSAGES } from "../../../utils/Messages";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { addBouquet, updateBouquet } from "../../../services/bouquets.services";
import { AddEditBouquetProps } from "../../../types/common";

const AddEditBouquet: React.FC<AddEditBouquetProps> = ({
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

    const initialRef = useRef<any>(null);
    const [isChanged, setIsChanged] = useState(false);

    // RESET / INIT ON OPEN
    useEffect(() => {
        if (!open) {
            setAnimateClose(true);

            setTimeout(() => {
                setShowModal(false);
            }, 300);

            return;
        }

        setShowModal(true);
        setAnimateClose(false);
        form.resetFields();

        const initialValues = {
            name: initialData?.name || "",
            description: initialData?.description || "",
        };

        form.setFieldsValue(initialValues);
        initialRef.current = initialValues;
        setIsChanged(false);
    }, [open, initialData]);

    // FORM CHANGE TRACKING
    const handleFormChange = (_: any, allValues: any) => {
        if (!isEdit) {
            setIsChanged(true);
            return;
        }

        const initial = initialRef.current;
        const changed =
            allValues.name?.trim() !== initial.name ||
            (allValues.description?.trim() || "") !== (initial.description || "");

        setIsChanged(changed);
    };

    // SCROLL LOCK
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

    // CLICK OUTSIDE
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
            modalRef.current &&
            !modalRef.current.contains(target)
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

    // SUBMIT
    const handleSubmit = async () => {
        let hasError = false;
        const values = await form.validateFields().catch(() => {
            hasError = true;
        });
        if (hasError) return;

        const payload = {
            name: values.name.trim(),
            description: values.description?.trim(),
        };

        try {
            getLoaderControl()?.showLoader();

            const res = isEdit ? await updateBouquet(initialData.id, payload) : await addBouquet(payload);

            if (res?.statusCode === 200) {
                onClose();
                onSave();
                notification.success({
                    message: res.message || (isEdit ? MESSAGES.SUCCESS.BOUQUET_UPDATED_SUCCESSFULLY : MESSAGES.SUCCESS.BOUQUET_ADDED_SUCCESSFULLY),
                });
            } else {
                notification.error({
                    message:
                        res.message || (isEdit ? MESSAGES.ERRORS.BOUQUET_UPDATE_FAILED : MESSAGES.ERRORS.BOUQUET_ADD_FAILED),
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
            className={`add-edit-bouquet-modal ${animateClose ? "modal-exit" : "modal-enter"
                }`}
            getContainer={false}
            transitionName=""
            zIndex={2000}
        >
            <div className="bouquet-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="bouquet-header">
                    <h2>{isEdit ? "Edit Bouquet" : "Add Bouquet"}</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form
                    layout="vertical"
                    form={form}
                    className="bouquet-form"
                    autoComplete="off"
                    onValuesChange={handleFormChange}
                >
                    <Form.Item
                        label={<span>Bouquet Name<span className="star">*</span></span>}
                        name="name"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(MESSAGES.ERRORS.BOUQUET_NAME_REQUIRED);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input placeholder="Enter bouquet name" />
                    </Form.Item>

                    <Form.Item
                        label={<span>Bouquet Description<span className="star">*</span></span>}
                        name="description"
                        rules={[
                            {
                                validator: (_: any, value: any) => {
                                    if (!value || !value.trim()) {
                                        return Promise.reject(MESSAGES.ERRORS.BOUQUET_DESCRIPTION_REQUIRED);
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input.TextArea
                            className="textarea"
                            placeholder="Enter description about bouquet"
                        />
                    </Form.Item>
                    {/* <label className="documents-title">Select Documents</label>
                    <div className="documents-list">
                        {documents.map((doc, index) => (
                            <label key={doc.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={doc.checked}
                                    onChange={() => {
                                        const updated = [...documents];
                                        updated[index].checked = !updated[index].checked;
                                        setDocuments(updated);
                                    }}
                                />
                                <span>{doc.name}</span>
                            </label>
                        ))}
                    </div> */}
                </Form>

                {/* FOOTER */}
                <div className="bouquet-footer">
                    <Button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        className="save-btn"
                        onClick={handleSubmit}
                        disabled={isEdit && !isChanged}
                    >
                        {isEdit ? "Update Bouquet" : "Add Bouquet"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditBouquet;