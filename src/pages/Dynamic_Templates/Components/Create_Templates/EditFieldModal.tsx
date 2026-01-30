import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import { FormField } from "../../../../types/common";
import "../Styles/EditFieldModal.scss";
import { MESSAGES } from "../../../../utils/Messages";
import { FILE_TYPE_REGEX } from "../../../../utils/utilFunctions";

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
    const [initialValues, setInitialValues] = useState<{
        label: string;
        placeholder?: string;
        required?: boolean;
        requiredErrorMessage?: string;
        options: string[];
    } | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Options state
    const [options, setOptions] = useState<string[]>([]);
    const [newOptionText, setNewOptionText] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [optionError, setOptionError] = useState("");
    const [isFirstOpen, setIsFirstOpen] = useState(true);
    const [lastRequiredErrorMessage, setLastRequiredErrorMessage] = useState("");
    const hideRequiredCheckbox = ["header", "horizontal_line", "primary_button", "secondary_button"];

    // Refs for editable options to autofocus
    const editableRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Initialize modal values when opened
    useEffect(() => {
        if (!open) {
            setAnimateClose(true);
            setTimeout(() => setShowModal(false), 300);
            return;
        }

        setShowModal(true);
        setAnimateClose(false);

        // If field has never been edited by user, start with empty/default values
        const isFirstEdit = !field.hasUserEdited;

        const initLabel = isFirstEdit ? "" : (field.label || "");
        const initPlaceholder = isFirstEdit ? "" : (field.placeholder || "");
        const initRequired = isFirstEdit ? false : (field.required || false);
        const initRequiredErrorMessage = isFirstEdit ? "" : (field.requiredErrorMessage || "");

        // For options: if first edit, start with empty array, otherwise use existing
        let initOptions: string[] = [];
        if (!isFirstEdit) {
            if (field.type === "file") {
                initOptions = field.allowedFileTypes || [];
            } else if (["select", "radio", "checkbox"].includes(field.type)) {
                initOptions = field.options || [];
            }
        }

        form.setFieldsValue({
            label: initLabel,
            placeholder: initPlaceholder,
            required: initRequired,
            requiredErrorMessage: initRequired ? initRequiredErrorMessage : "",
        });

        setOptions(initOptions);
        setNewOptionText("");
        setIsLabelRequired(initRequired);
        setOptionError("");
        setLastRequiredErrorMessage(initRequiredErrorMessage);

        setInitialValues({
            label: initLabel,
            placeholder: initPlaceholder,
            required: initRequired,
            requiredErrorMessage: initRequired ? initRequiredErrorMessage : "",
            options: initOptions,
        });

        setHasChanges(false);
        setIsFirstOpen(true);
    }, [open, field, form]);

    // Autofocus editable option
    useEffect(() => {
        if (editingIndex !== null) {
            const el = editableRefs.current[editingIndex];
            if (el) {
                el.focus();
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }
    }, [editingIndex]);

    // Check for changes whenever options or form values change
    const checkForChanges = (formValues?: any) => {
        if (!initialValues) return;

        const currentFormValues = formValues || form.getFieldsValue();

        const labelChanged = currentFormValues.label?.trim() !== initialValues.label;
        const placeholderChanged = (currentFormValues.placeholder?.trim() || "") !== (initialValues.placeholder || "");
        const requiredChanged = currentFormValues.required !== initialValues.required;
        const errorMessageChanged = (currentFormValues.requiredErrorMessage?.trim() || "") !== (initialValues.requiredErrorMessage || "");
        const optionsChanged = JSON.stringify(options) !== JSON.stringify(initialValues.options);

        const hasAnyChanges = labelChanged || placeholderChanged || requiredChanged || errorMessageChanged || optionsChanged;

        if (isFirstOpen) {
            setHasChanges(true);
        } else {
            setHasChanges(hasAnyChanges);
        }
    };

    // Check for changes when options change
    useEffect(() => {
        if (initialValues) {
            checkForChanges();
        }
    }, [options]);

    const startEditOption = (index: number) => {
        setEditingIndex(index);
    };

    const saveEditedOption = (index: number, value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        // If field is file type, validate format
        if (field.type === "file" && !FILE_TYPE_REGEX.test(trimmed)) {
            setOptionError(MESSAGES.ERRORS.INVALID_FILE_TYPE_FORMAT);
            return;
        }

        const updated = [...options];
        updated[index] = trimmed;

        setOptions(updated);
        setEditingIndex(null);
        setOptionError("");
    };

    const handleClose = () => {
        setAnimateClose(true);
        onClose();
    };

    const addOption = () => {
        const trimmed = newOptionText.trim();
        if (!trimmed) return;

        // If field is file type, validate format
        if (field.type === "file" && !FILE_TYPE_REGEX.test(trimmed)) {
            setOptionError(MESSAGES.ERRORS.INVALID_FILE_TYPE_FORMAT);
            return;
        }

        const updated = [...options, trimmed];
        setOptions(updated);
        setNewOptionText("");
        setOptionError("");
    };

    const removeOption = (index: number) => {
        const updated = options.filter((_, i) => i !== index);
        setOptions(updated);
        if (updated.length === 0) setOptionError(MESSAGES.ERRORS.AT_LEAST_ONE_OPTION_REQUIRED);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Validate options for select / checkbox / radio / file
            if (
                ["select", "radio", "checkbox", "file"].includes(field.type) &&
                options.length === 0
            ) {
                setOptionError(MESSAGES.ERRORS.AT_LEAST_ONE_OPTION_REQUIRED);
                return;
            }

            setOptionError("");

            // Always include requiredErrorMessage if required is true
            const payload: Partial<FormField> = {
                label: values.label.trim(),
                placeholder: values.placeholder?.trim(),
                required: values.required || false,
                requiredErrorMessage: values.required
                    ? values.requiredErrorMessage?.trim() || lastRequiredErrorMessage || ""
                    : undefined,
                hasUserEdited: true,
            };

            // Include options / allowedFileTypes
            if (["select", "radio", "checkbox"].includes(field.type)) {
                payload.options = options;
            }
            if (field.type === "file") {
                payload.allowedFileTypes = options;
            }

            // Save last required error message
            if (values.required) {
                setLastRequiredErrorMessage(values.requiredErrorMessage?.trim() || "");
            }

            onSave(payload);
        } catch (error) {
            // Validation failed - don't close modal
            console.error("Form validation failed:", error);
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
            className={`edit-field-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
            getContainer={false}
            transitionName=""
            zIndex={3000}
            maskClosable={true}
            onCancel={handleClose}
        >
            <div className="edit-field-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="edit-field-header">
                    <h2>Edit Field</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* FORM */}
                <Form
                    layout="vertical"
                    form={form}
                    className="edit-field-form"
                    autoComplete="off"
                    validateTrigger="onChange"
                    onValuesChange={(_, allValues) => {
                        setIsLabelRequired(!!allValues.required);

                        if (!initialValues) return;

                        if (isFirstOpen) {
                            setHasChanges(true);
                            setIsFirstOpen(false);
                        } else {
                            checkForChanges(allValues);
                        }
                    }}
                >
                    {/* LABEL */}
                    <Form.Item
                        label={
                            <span>
                                Label Name
                                <span className="star">{isLabelRequired ? "*" : ""}</span>
                            </span>
                        }
                        name="label"
                        rules={[
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

                    {/* PLACEHOLDER */}
                    {(field.type === "input" || field.type === "textarea" || field.type === "number") && (
                        <Form.Item
                            label="Placeholder Name"
                            name="placeholder"
                            rules={[
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

                    {/* OPTIONS */}
                    {(field.type === "select" || field.type === "radio" || field.type === "checkbox" || field.type === "file") && (
                        <div className="dynamic-options-wrapper">
                            <label>
                                {field.type === "file" ? "Allowed File Types" : "Enter Options"}
                            </label>

                            {/* Add option input */}
                            <div className="add-option-row">
                                <Input
                                    placeholder={field.type === "file" ? "e.g. .jpg, .png" : "Enter option"}
                                    value={newOptionText}
                                    onChange={(e) => setNewOptionText(e.target.value)}
                                    onPressEnter={addOption}
                                />
                                <Button type="primary" onClick={addOption}>
                                    Add
                                </Button>
                            </div>

                            {/* Options list */}
                            {options.length > 0 && (
                                <div className="options-list">
                                    {options.map((opt, i) => (
                                        <div key={i} className="option-item">
                                            <div className="option-text-container">
                                                <span
                                                    ref={(el) => (editableRefs.current[i] = el)}
                                                    contentEditable={editingIndex === i}
                                                    suppressContentEditableWarning
                                                    className={editingIndex === i ? "editable-option" : ""}
                                                    onClick={() => startEditOption(i)}
                                                    onBlur={(e) => saveEditedOption(i, e.currentTarget.innerText)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            saveEditedOption(i, e.currentTarget.innerText);
                                                        }
                                                    }}
                                                >
                                                    {opt}
                                                </span>
                                            </div>

                                            <div className="option-actions">
                                                {editingIndex === i ? (
                                                    <button
                                                        type="button"
                                                        className="edit-option-btn save-btn"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            const el = editableRefs.current[i];
                                                            if (el) saveEditedOption(i, el.textContent || "");
                                                        }}
                                                    >
                                                        <img src="/assets/save.svg" alt="save" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="edit-option-btn edit-btn"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            startEditOption(i);
                                                        }}
                                                    >
                                                        <img src="/assets/edit.svg" alt="edit" />
                                                    </button>
                                                )}

                                                <button type="button" className="remove-option-btn" onClick={() => removeOption(i)}>
                                                    <img src="/assets/trash.svg" alt="delete" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Inline error message for options */}
                            {optionError && <div className="star">{optionError}</div>}
                        </div>
                    )}

                    {/* REQUIRED */}
                    {!hideRequiredCheckbox.includes(field.type) && (
                        <>
                            <Form.Item name="required" valuePropName="checked">
                                <Checkbox>Required</Checkbox>
                            </Form.Item>

                            {/* Only show error message input if required is checked */}
                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.required !== currentValues.required}
                            >
                                {({ getFieldValue }) => {
                                    const requiredChecked = getFieldValue("required");

                                    return requiredChecked ? (
                                        <Form.Item
                                            label="Required Error Message"
                                            name="requiredErrorMessage"
                                            rules={[
                                                {
                                                    validator: (_, value) => {
                                                        if (!value || !value.trim()) {
                                                            return Promise.reject(MESSAGES.ERRORS.PLEASE_ENTER_ERROR_MESSAGE);
                                                        }
                                                        return Promise.resolve();
                                                    },
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter error message to show if field is left empty" />
                                        </Form.Item>
                                    ) : null;
                                }}
                            </Form.Item>
                        </>
                    )}
                </Form>

                {/* FOOTER */}
                <div className="edit-field-footer">
                    <Button className="cancel-btn" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button className="save-btn" onClick={handleSubmit} disabled={!hasChanges}>
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditFieldModal;