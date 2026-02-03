import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notification, Select } from "antd";
import {
    getFilledTemplateSubmission,
    getTemplateById,
    submitTemplateForm,
} from "../../../../services/templates.services";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { FormField } from "../../../../types/common";
import { MESSAGES } from "../../../../utils/Messages";

interface FilledValueMap {
    [fieldId: string]: any;
}

interface ErrorMap {
    [fieldId: string]: string;
}

interface Props {
    viewOnly?: boolean;
}

const SubmitTemplateForm: React.FC<Props> = ({ viewOnly = false }) => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const templateIdFromState = (location.state as any)?.templateId;
    const submittedBy = (location.state as any)?.submittedBy;
    const templateId = templateIdFromState; // fallback to URL param
    const isViewResponseMode = viewOnly && submittedBy;
    const [fields, setFields] = useState<FormField[]>([]);
    const [values, setValues] = useState<FilledValueMap>({});
    const [errors, setErrors] = useState<ErrorMap>({});
    const [openSelect, setOpenSelect] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [templateData, setTemplateData] = useState<any>(null);
    const normalizeArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;

        if (typeof value === "string") {
            return value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
        }

        return [];
    };

    /* ================= FETCH TEMPLATE ================= */
    useEffect(() => {
        if (!id) return;

        const fetchTemplate = async () => {
            try {
                getLoaderControl()?.showLoader();

                const res = await getTemplateById(id);

                if (res?.statusCode === 200 && res?.data) {
                    const templateData = res.data;
                    setTemplateData(templateData);

                    const isFormSubmitted = templateData.isSubmitted || false;
                    setIsSubmitted(isFormSubmitted);

                    const loadedFields: FormField[] = [];
                    const prefilledValues: FilledValueMap = {};

                    templateData.rows?.forEach((row: any) => {
                        const rowId = String(row.rowOrder);

                        row.fields
                            .sort((a: any, b: any) => a.fieldOrder - b.fieldOrder)
                            .forEach((field: any) => {
                                loadedFields.push({ ...field, rowId });

                                if (isFormSubmitted && field.value !== null && field.value !== undefined) {
                                    prefilledValues[field.id] = field.value;
                                }
                            });
                    });

                    setFields(loadedFields);

                    if (isFormSubmitted && Object.keys(prefilledValues).length > 0) {
                        setValues(prefilledValues);
                    }
                }
            } catch (err: any) {
                notification.error({ message: err?.response?.data?.message || MESSAGES.ERRORS.TEMPLATE_FETCH_FAILED });
            } finally {
                getLoaderControl()?.hideLoader();
            }
        };

        fetchTemplate();
    }, [id]);

    /* ================= FETCH FILLED SUBMISSION (VIEW MODE ONLY) ================= */
    /* ================= FETCH FILLED SUBMISSION (VIEW MODE ONLY) ================= */
    useEffect(() => {
        if (!id || !viewOnly) return;

        const submittedByToFetch = (location.state as any)?.submittedBy;
        if (!submittedByToFetch) return;

        const fetchFilledSubmission = async () => {
            try {
                getLoaderControl()?.showLoader();

                const res = await getFilledTemplateSubmission({
                    template_id: Number(id),
                    submitted_by: submittedByToFetch,
                });

                if (res?.statusCode === 200 && res?.data) {
                    const submission = res.data;
                    setTemplateData(submission);
                    setIsSubmitted(true); // readonly

                    const loadedFields: FormField[] = [];
                    const filledValues: FilledValueMap = {};

                    // Map all rows and fields
                    submission.data.forEach((row: any) => {
                        const rowId = String(row.rowOrder);
                        row.fields
                            .sort((a: any, b: any) => a.fieldOrder - b.fieldOrder)
                            .forEach((field: any) => {
                                loadedFields.push({ ...field, rowId });

                                if (field.value !== undefined && field.value !== null) {
                                    filledValues[field.id] = field.value;
                                }
                            });
                    });

                    setFields(loadedFields);
                    setValues(filledValues);
                }
            } catch (err: any) {
                notification.error({
                    message: err?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
                });
            } finally {
                getLoaderControl()?.hideLoader();
            }
        };

        fetchFilledSubmission();
    }, [id, location.state, viewOnly]);

    /* ================= VALIDATION HELPERS ================= */
    const isValidEmail = (email: string) =>
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

    const validateField = (fieldId: string, value: any) => {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) return true;

        let error = "";
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        if (field.required) {
            const isEmpty =
                trimmedValue === undefined ||
                trimmedValue === null ||
                trimmedValue === "" ||
                (Array.isArray(trimmedValue) && trimmedValue.length === 0);
            if (isEmpty) error = field.requiredErrorMessage || `${field.label} is required`;
        }

        if (!error) {
            switch (field.type) {
                case "number":
                    if (trimmedValue && !/^\d+$/.test(trimmedValue))
                        error = MESSAGES.ERRORS.ONLY_NUMBERS_ALLOWED;
                    if (
                        field.label.toLowerCase().includes("mobile") &&
                        trimmedValue &&
                        !/^\d{10}$/.test(trimmedValue)
                    )
                        error = MESSAGES.ERRORS.INVALID_CONTACT_NUMBER;
                    break;
                case "input":
                case "textarea":
                    if ((field as any).onlyChars && trimmedValue && /[^a-zA-Z\s]/.test(trimmedValue))
                        error = MESSAGES.ERRORS.ONLY_CHARS_ALLOWED;
                    if ((field as any).subtype === "email" && trimmedValue && !isValidEmail(trimmedValue))
                        error = MESSAGES.ERRORS.ENTER_VALID_EMAIL;
                    break;
                case "email":
                    if (trimmedValue && !isValidEmail(trimmedValue))
                        error = MESSAGES.ERRORS.ENTER_VALID_EMAIL;
                    break;
                case "file":
                    const allowedTypes = normalizeArray(field.allowedfiletypes);

                    if (trimmedValue instanceof File && allowedTypes.length) {
                        const allowed = allowedTypes.some((ext) =>
                            trimmedValue.name.toLowerCase().endsWith(ext.toLowerCase())
                        );
                        if (!allowed) error = MESSAGES.ERRORS.INVALID_FILE_TYPE_FORMAT;
                    }
                    break;
            }
        }

        setErrors((prev: any) => ({
            ...prev,
            ...(error ? { [fieldId]: error } : { [fieldId]: undefined }),
        }));
        return !error;
    };

    /* ================= HANDLE CHANGE ================= */
    const updateValue = (fieldId: string, value: any) => {
        if (isSubmitted) return;
        setValues((prev) => ({ ...prev, [fieldId]: value }));
        validateField(fieldId, value);
    };

    /* ================= VALIDATE FIELDS & SCROLL ================= */
    const validateFields = (): boolean => {
        let isValid = true;
        let atLeastOneFilled = false;
        let firstErrorFieldId: string | null = null;

        fields.forEach((field) => {
            if (["header", "primary_button", "secondary_button", "horizontal_line"].includes(field.type)) return;

            const value = values[field.id];
            const trimmedValue = typeof value === "string" ? value.trim() : value;
            const isFilled =
                trimmedValue !== undefined &&
                trimmedValue !== null &&
                trimmedValue !== "" &&
                !(Array.isArray(trimmedValue) && trimmedValue.length === 0);

            if (isFilled) atLeastOneFilled = true;

            if (field.required || isFilled) {
                const valid = validateField(field.id, value);
                if (!valid && !firstErrorFieldId) firstErrorFieldId = field.id;
                if (!valid) isValid = false;
            }
        });

        if (!atLeastOneFilled) {
            notification.error({
                message: MESSAGES.ERRORS.PLEASE_FILL_AT_LEAST_ONE_FIELD || "Please fill at least one field",
            });
            return false;
        }

        if (firstErrorFieldId) {
            const element = document.querySelector<HTMLElement>(`[data-field-id="${firstErrorFieldId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.focus({ preventScroll: true });
            }
        }

        return isValid;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (isSubmitted) {
            notification.info({ message: "This form has already been submitted and cannot be modified" });
            return;
        }
        if (!id) {
            notification.error({ message: MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
            return;
        }
        if (!validateFields()) return;

        try {
            getLoaderControl()?.showLoader();

            const formData = new FormData();
            const files: File[] = [];
            const valuesPayload: { fieldId: string; value: any }[] = [];

            fields
                .filter((f) => !["header", "primary_button", "secondary_button", "horizontal_line"].includes(f.type))
                .forEach((field) => {
                    const value = values[field.id];
                    if (field.type === "file" && value instanceof File) {
                        files.push(value);
                        valuesPayload.push({ fieldId: field.id, value: { name: value.name, type: value.type } });
                    } else {
                        valuesPayload.push({ fieldId: field.id, value: value ?? "" });
                    }
                });

            formData.append("payload", JSON.stringify({ templateId: id, values: valuesPayload }));
            files.forEach((file) => formData.append("files", file));

            const res = await submitTemplateForm(formData);

            if (res?.statusCode === 200) {
                notification.success({
                    message: res.message || MESSAGES.SUCCESS.TEMPLATE_SAVED_SUCCESSFULLY || MESSAGES.SUCCESS.FORM_SUBMITTED_SUCCESSFULLY,
                });
                setValues({});
                setErrors({});
                setIsSubmitted(true);
                navigate(-1);
            }
        } catch (err: any) {
            notification.error({
                message: err?.response?.data?.message || err.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
            });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    /* ================= GET FIELD DATA ================= */
    const getFieldData = (fieldId: string) => {
        if (!templateData) return null;

        const rows = templateData.rows || templateData.data; // fallback
        if (!rows) return null;

        for (const row of rows) {
            const field = row.fields.find((f: any) => f.id === fieldId);
            if (field) return field;
        }
        return null;
    };

    /* ================= RENDER ================= */
    const visibleFields = fields.filter((f) => f.label && f.label.trim() !== "");
    const rowMap = new Map<string, FormField[]>();
    visibleFields.forEach((f) => {
        const rowKey = f.rowId || "";
        if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
        rowMap.get(rowKey)!.push(f);
    });

    const rowOrder: string[] = [];
    const seen = new Set<string>();
    visibleFields.forEach((f) => {
        const rowKey = f.rowId || "";
        if (!seen.has(rowKey)) {
            rowOrder.push(rowKey);
            seen.add(rowKey);
        }
    });

    const getSpan = (count: number) =>
        count === 1 ? 12 : count === 2 ? 6 : count === 3 ? 4 : count === 4 ? 3 : 12;

    const removeFile = (fieldId: string) => {
        setValues((prev) => {
            const updated = { ...prev };
            delete updated[fieldId];
            return updated;
        });

        setErrors((prev: any) => ({
            ...prev,
            [fieldId]: undefined,
        }));
    };
    return (
        <div className={`template-form-container submit-mode ${isSubmitted ? "submitted-mode" : ""}`}>
            <div className="drop-zone">
                {/* {fields.length === 0 && <p className="drop-placeholder">Loading form...</p>} */}

                {/* {templateData && isSubmitted && (
                    <div className="submission-status-banner">
                        <div className="status-info">
                            <span className="status-badge submitted">Submitted</span>
                            <span className="template-name">{templateData.templateName}</span>
                            <span className="template-id">Template ID: {templateData.templateId}</span>
                        </div>
                    </div>
                )} */}

                {rowOrder.map((rowId) => {
                    const rowFields = rowMap.get(rowId) || [];
                    const span = getSpan(rowFields.length);

                    return (
                        <div key={rowId} className="form-row-wrapper">
                            <div className="form-row">
                                {rowFields.map((field) => {
                                    const hasError = !!errors[field.id];
                                    const fieldValue = values[field.id];
                                    const isReadOnly = isSubmitted || (viewOnly && submittedBy);
                                    const fieldData = getFieldData(field.id);

                                    return (
                                        <div key={field.id} className={`form-col span-${span}`} data-field-id={field.id}>
                                            <div className={`form-field ${hasError ? "star" : ""} ${isReadOnly ? "readonly" : ""}`}>
                                                {/* LABEL */}
                                                {field.label &&
                                                    !["horizontal_line", "primary_button", "secondary_button"].includes(field.type) && (
                                                        <div className="label-with-action">
                                                            <label className={field.type === "header" ? "header-label" : ""}>
                                                                {field.label}
                                                                {field.required && field.type !== "header" && <span className="star"> *</span>}
                                                                {/* {isReadOnly && <span className="readonly-badge">Submitted</span>} */}
                                                            </label>
                                                        </div>
                                                    )}

                                                {/* HORIZONTAL LINE */}
                                                {field.type === "horizontal_line" && (
                                                    <div className="hr-with-action">
                                                        <hr className="form-hr" />
                                                    </div>
                                                )}

                                                {/* BUTTONS */}
                                                {["primary_button", "secondary_button"].includes(field.type) && (
                                                    <div className="button-field-with-action">
                                                        {field.type === "primary_button" ? (
                                                            <button
                                                                className="primary-button"
                                                                type="button"
                                                                onClick={handleSubmit}
                                                                disabled={isReadOnly}
                                                            // style={isReadOnly ? { display: "none" } : {}}
                                                            >
                                                                {field.label || "Submit"}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="secondary-button"
                                                                type="button"
                                                                // onClick={() => navigate(-1)}
                                                                disabled={isReadOnly}
                                                            >
                                                                {field.label || "Cancel"}
                                                                {/* {isReadOnly ? "Close" : field.label || "Cancel"} */}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* FIELD INPUTS */}
                                                {(() => {
                                                    const isEmail = field.type === "email" || (field.type === "input" && (field as any).subtype === "email");

                                                    switch (field.type) {
                                                        case "input":
                                                        case "email":
                                                            return (
                                                                <input
                                                                    type={isEmail ? "email" : "text"}
                                                                    value={fieldValue || ""}
                                                                    onChange={(e) => updateValue(field.id, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className={hasError ? "error" : ""}
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                />
                                                            );
                                                        case "textarea":
                                                            return (
                                                                <textarea
                                                                    value={fieldValue || ""}
                                                                    onChange={(e) => updateValue(field.id, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className={hasError ? "error" : ""}
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                />
                                                            );
                                                        case "number":
                                                            return (
                                                                <input
                                                                    type="number"
                                                                    value={fieldValue || ""}
                                                                    onChange={(e) => updateValue(field.id, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className={hasError ? "error" : ""}
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                />
                                                            );
                                                        case "date":
                                                            return (
                                                                <input
                                                                    type="date"
                                                                    value={fieldValue || ""}
                                                                    onChange={(e) => updateValue(field.id, e.target.value)}
                                                                    className={hasError ? "error" : ""}
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                />
                                                            );

                                                        case "file": {
                                                            const uploadedFile = fieldValue instanceof File ? fieldValue : null;

                                                            // ================= READONLY / SUBMITTED =================
                                                            if (isReadOnly) {
                                                                if (fieldData?.value) {
                                                                    const fileName = fieldData.value.split("/").pop() || fieldData.value;
                                                                    const fileUrl = fieldData.fileUrl
                                                                        ? `${import.meta.env.VITE_Document_Viewer_url}${fieldData.fileUrl}`
                                                                        : fieldData.value;

                                                                    return (
                                                                        <div className="file-preview-wrapper">
                                                                            <div className="file-preview-container">
                                                                                <div className="file-info">
                                                                                    <div className="file-name-wrapper">
                                                                                        <span className="file-name">{fileName}</span>
                                                                                    </div>

                                                                                    <a
                                                                                        href={fileUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="file-preview-link"
                                                                                        title={fileName}
                                                                                    >
                                                                                        <div className="eye-icon-container">
                                                                                            <img src="/assets/Eye.svg" alt="View" />
                                                                                        </div>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div className="file-preview-wrapper">
                                                                        <div className="file-preview-container">
                                                                            <span className="no-file-text">No file uploaded</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // ================= EDITABLE MODE =================
                                                            if (uploadedFile) {
                                                                const previewUrl = URL.createObjectURL(uploadedFile);

                                                                return (
                                                                    <div className="file-preview-wrapper">
                                                                        <div className="file-preview-container">
                                                                            <div className="file-info">
                                                                                <div className="file-name-wrapper">
                                                                                    <span className="file-name">{uploadedFile.name}</span>
                                                                                </div>

                                                                                {/* Eye */}
                                                                                <a
                                                                                    href={previewUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="file-preview-link"
                                                                                >
                                                                                    <div className="eye-icon-container">
                                                                                        <img src="/assets/Eye.svg" alt="View" />
                                                                                    </div>
                                                                                </a>

                                                                                {/* Delete */}
                                                                                <div
                                                                                    className="delete-icon-container"
                                                                                    onClick={() => removeFile(field.id)}
                                                                                >
                                                                                    <img src="/assets/trash.svg" alt="Delete" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            // ================= NO FILE SELECTED =================
                                                            return (
                                                                <input
                                                                    type="file"
                                                                    accept={normalizeArray(field.allowedfiletypes).join(",")}
                                                                    onChange={(e) => updateValue(field.id, e.target.files?.[0])}
                                                                    className={hasError ? "error" : ""}
                                                                />
                                                            );
                                                        }

                                                        case "select":
                                                            return (
                                                                <div
                                                                    className={`custom-select-wrapper ${hasError ? "error" : ""} ${openSelect === field.id ? "open" : ""
                                                                        }`}
                                                                >
                                                                    <Select
                                                                        value={fieldValue || undefined}
                                                                        placeholder="Select an option"
                                                                        style={{ width: "100%" }}
                                                                        className="custom-select"
                                                                        showArrow={false}
                                                                        disabled={isReadOnly}
                                                                        options={normalizeArray(field.options).map((opt) => ({ label: opt, value: opt }))}
                                                                        onDropdownVisibleChange={(open) => {
                                                                            if (!isReadOnly) setOpenSelect(open ? field.id : null);
                                                                        }}
                                                                        onChange={(value) => {
                                                                            if (!isReadOnly) {
                                                                                updateValue(field.id, value);
                                                                                setOpenSelect(null);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span className="custom-arrow" />
                                                                </div>
                                                            );

                                                        case "radio":
                                                            return (
                                                                <div className="radio-group">
                                                                    {normalizeArray(field.options).map((opt) => (
                                                                        <label key={opt} className="radio-wrapper">
                                                                            <input
                                                                                type="radio"
                                                                                name={field.id}
                                                                                value={opt}
                                                                                checked={fieldValue === opt}
                                                                                onChange={() => updateValue(field.id, opt)}
                                                                                className="custom-radio"
                                                                                disabled={isReadOnly}
                                                                            />
                                                                            <span>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );
                                                        case "checkbox":
                                                            return (
                                                                <div className="checkbox-group">
                                                                    {normalizeArray(field.options).map((opt) => (
                                                                        <label key={opt} className="checkbox-wrapper">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="custom-checkbox"
                                                                                checked={Array.isArray(fieldValue) && fieldValue.includes(opt)}
                                                                                onChange={() => {
                                                                                    if (!isReadOnly) {
                                                                                        const prev = Array.isArray(fieldValue) ? fieldValue : [];
                                                                                        updateValue(
                                                                                            field.id,
                                                                                            prev.includes(opt)
                                                                                                ? prev.filter((o: string) => o !== opt)
                                                                                                : [...prev, opt]
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                disabled={isReadOnly}
                                                                            />
                                                                            <span>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );

                                                        case "switch":
                                                            return (
                                                                <label className="switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={fieldValue || false}
                                                                        onChange={(e) => updateValue(field.id, e.target.checked)}
                                                                        disabled={isReadOnly}
                                                                    />
                                                                    <span className="slider round"></span>
                                                                </label>
                                                            );
                                                        default:
                                                            return null;
                                                    }
                                                })()}

                                                {hasError && <span className="error-message">{errors[field.id]}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubmitTemplateForm;