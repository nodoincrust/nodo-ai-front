import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import { FormField } from "../../../../types/common";
import "../Styles/EditFieldModal.scss";
import { MESSAGES } from "../../../../utils/Messages";

interface Props {
    open: boolean;
    field: FormField;
    onClose: () => void;
    onSave: (data: Partial<FormField>) => void;
}

const EditFieldModal: React.FC<Props> = ({ open, field, onClose, onSave }) => {
    const [form] = Form.useForm();
    const modalRef = useRef<HTMLDivElement>(null);
    const [showModal, setShowModal] = useState(open);
    const [animateClose, setAnimateClose] = useState(false);
    const [isLabelRequired, setIsLabelRequired] = useState(field.required || false);
    // Fields that should NOT show the "Required" checkbox
    const hideRequiredCheckbox = ["header", "horizontal_line", "primary_button", "secondary_button"];
    /* ================= OPEN / CLOSE ================= */
    useEffect(() => {
        if (!open) {
            setAnimateClose(true);
            setTimeout(() => setShowModal(false), 300);
            return;
        }

        setShowModal(true);
        setAnimateClose(false);

        form.setFieldsValue({
            ...field,
            options: field.options?.join(", "),
            required: field.required || false,
        });

        setIsLabelRequired(field.required || false);
    }, [open, field, form]);

    /* ================= CLOSE ================= */
    const handleClose = () => {
        setAnimateClose(true);
        onClose();
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        const values = await form.validateFields();

        let sanitizedOptions: string[] | undefined;

        if (values.options && typeof values.options === "string") {
            sanitizedOptions = values.options
                .replace(/,+/g, ",")
                .split(",")
                .map((opt: string) => opt.trim())
                .filter(Boolean);
        }

        onSave({
            label: values.label.trim(),
            placeholder: values.placeholder?.trim(),
            required: values.required,
            options: sanitizedOptions,
        });
    };

    if (!showModal) return null;

    return (
        <Modal
            open={showModal}
            footer={null}
            closable={false}
            centered
            width={412}
            className={`edit-field-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
            getContainer={false}
            transitionName=""
            zIndex={3000}
        >
            <div className="edit-field-wrapper" ref={modalRef}>
                {/* ================= HEADER ================= */}
                <div className="edit-field-header">
                    <h2>Edit Field</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* ================= FORM ================= */}
                <Form
                    layout="vertical"
                    form={form}
                    className="edit-field-form"
                    autoComplete="off"
                    validateTrigger="onChange"
                    onValuesChange={(_, allValues) =>
                        setIsLabelRequired(!!allValues.required)
                    }
                >
                    {/* ===== LABEL ===== */}
                    <Form.Item
                        label={
                            <span>
                                Label Name
                                <span className="star">{isLabelRequired ? "*" : ""}</span>
                            </span>
                        }
                        name="label"
                        rules={[
                            { required: false },
                            {
                                validator: (_, value) =>
                                    value && value.trim()
                                        ? Promise.resolve()
                                        : Promise.reject(MESSAGES.ERRORS.LABEL_NAME_REQUIRED),
                            },
                        ]}
                    >
                        <Input placeholder="Enter label name" />
                    </Form.Item>

                    {/* ===== PLACEHOLDER ===== */}
                    {(field.type === "input" ||
                        field.type === "textarea" ||
                        field.type === "number") && (
                            <Form.Item
                                label="Placeholder Name"
                                name="placeholder"
                                rules={[
                                    { required: false },
                                    {
                                        validator: (_, value) =>
                                            value && value.trim()
                                                ? Promise.resolve()
                                                : Promise.reject(MESSAGES.ERRORS.PLACEHOLDER_NAME_REQUIRED),
                                    },
                                ]}
                            >
                                <Input placeholder="Enter placeholder name" />
                            </Form.Item>
                        )}

                    {/* ===== OPTIONS ===== */}
                    {(field.type === "select" ||
                        field.type === "radio" ||
                        field.type === "checkbox") && (
                            <Form.Item
                                label="Enter options separated by commas"
                                name="options"
                                rules={[
                                    { required: false },
                                    {
                                        validator: (_, value) => {
                                            if (!value || !value.trim()) {
                                                return Promise.reject(MESSAGES.ERRORS.OPTIONS_REQUIRED);
                                            }

                                            const validOptions = value
                                                .split(",")
                                                .map((v: string) => v.trim())
                                                .filter(Boolean);

                                            return validOptions.length
                                                ? Promise.resolve()
                                                : Promise.reject(
                                                    "Enter at least one valid option"
                                                );
                                        },
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    placeholder="e.g. Option1, Option2"
                                    className="textarea"
                                />
                            </Form.Item>
                        )}

                    {/* ===== REQUIRED ===== */}
                    {!hideRequiredCheckbox.includes(field.type) && (
                        <Form.Item name="required" valuePropName="checked">
                            <Checkbox>Required</Checkbox>
                        </Form.Item>
                    )}
                </Form>

                {/* ================= FOOTER ================= */}
                <div className="edit-field-footer">
                    <Button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button className="save-btn" onClick={handleSubmit}>
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditFieldModal;