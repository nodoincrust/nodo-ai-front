import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { getTemplateById, submitTemplateForm } from "../../../../services/templates.services";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { FormField } from "../../../../types/common";
import { MESSAGES } from "../../../../utils/Messages";

interface FilledValueMap {
    [fieldId: string]: any;
}

interface ErrorMap {
    [fieldId: string]: string;
}

const FillTemplateForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [fields, setFields] = useState<FormField[]>([]);
    const [values, setValues] = useState<FilledValueMap>({});
    const [errors, setErrors] = useState<ErrorMap>({});

    /* ================= FETCH TEMPLATE ================= */
    useEffect(() => {
        if (!id) return;

        const fetchTemplate = async () => {
            try {
                getLoaderControl()?.showLoader();
                const res = await getTemplateById(id);

                if (res?.statusCode === 200) {
                    const loadedFields: FormField[] = [];
                    res.data.rows.forEach((row: any) => {
                        const rowId = row.rowOrder.toString();
                        row.fields
                            .sort((a: any, b: any) => a.fieldOrder - b.fieldOrder)
                            .forEach((f: any) => loadedFields.push({ ...f, rowId }));
                    });
                    setFields(loadedFields);
                }
            } catch (err: any) {
                notification.error({ message: err?.response?.data?.message || MESSAGES.ERRORS.TEMPLATE_FETCH_FAILED });
            } finally {
                getLoaderControl()?.hideLoader();
            }
        };

        fetchTemplate();
    }, [id]);

    /* ================= HANDLE CHANGE ================= */
    const updateValue = (fieldId: string, value: any) => {
        setValues(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    /* ================= VALIDATE SINGLE FIELD ================= */
    const validateField = (fieldId: string, value: any) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return true;

        let error = "";

        if (field.required) {
            const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
            if (isEmpty) error = field.requiredErrorMessage || `${field.label} is required`;
        }

        if (!error) {
            switch (field.type) {
                case "number":
                    if (value && !/^\d+$/.test(value)) error = MESSAGES.ERRORS.ONLY_NUMBERS_ALLOWED;
                    if (field.label.toLowerCase().includes("mobile") && value && !/^\d{10}$/.test(value))
                        error = MESSAGES.ERRORS.INVALID_CONTACT_NUMBER;
                    break;

                case "input":
                case "textarea":
                    if ((field as any).onlyChars && value && /[^a-zA-Z\s]/.test(value))
                        error = MESSAGES.ERRORS.ONLY_CHARS_ALLOWED;
                    break;

                case "email":
                    if (value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
                        error = MESSAGES.ERRORS.ENTER_VALID_EMAIL;
                    break;

                case "file":
                    if (value instanceof File && field.allowedFileTypes?.length) {
                        const allowed = field.allowedFileTypes.some(ext => value.name.toLowerCase().endsWith(ext.toLowerCase()));
                        if (!allowed) error = MESSAGES.ERRORS.INVALID_FILE_TYPE_FORMAT;
                    }
                    break;
            }
        }

        setErrors(prev => ({ ...prev, ...(error ? { [fieldId]: error } : {}) }));
        return !error;
    };

    /* ================= VALIDATE ALL FIELDS ================= */
    const validateFields = (): boolean => {
        let isValid = true;
        fields.forEach(field => {
            if (!["header", "primary_button", "secondary_button", "horizontal_line"].includes(field.type)) {
                const valid = validateField(field.id, values[field.id]);
                if (!valid) isValid = false;
            }
        });
        return isValid;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        if (!id) {
            notification.error({ message: MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
            return;
        }

        if (!validateFields()) {
            notification.error({ message: MESSAGES.ERRORS.FILL_ALL_REQUIRED_FIELDS });
            return;
        }

        try {
            getLoaderControl()?.showLoader();

            const formData = new FormData();
            const files: File[] = [];
            const valuesPayload: { fieldId: string; value: any }[] = [];

            fields
                .filter(f => !["header", "primary_button", "secondary_button", "horizontal_line"].includes(f.type))
                .forEach(field => {
                    const value = values[field.id];
                    if (field.type === "file" && value instanceof File) {
                        files.push(value);
                        valuesPayload.push({ fieldId: field.id, value: { name: value.name, type: value.type } });
                    } else {
                        valuesPayload.push({ fieldId: field.id, value: value ?? "" });
                    }
                });

            formData.append("payload", JSON.stringify({ templateId: id, values: valuesPayload }));
            files.forEach(file => formData.append("files", file));

            const res = await submitTemplateForm(formData);

            if (res?.statusCode === 200) {
                notification.success({ message: MESSAGES.SUCCESS.TEMPLATE_SAVED_SUCCESSFULLY });
                setValues({});
                setErrors({});
                navigate(-1);
            }
        } catch (err: any) {
            notification.error({ message: err?.response?.data?.message || err.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    /* ================= RENDER ================= */
    const visibleFields = fields.filter(f => f.label && f.label.trim() !== "");
    const rowMap = new Map<string, FormField[]>();
    visibleFields.forEach(f => {
        const rowKey = f.rowId || "";
        if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
        rowMap.get(rowKey)!.push(f);
    });

    const rowOrder: string[] = [];
    const seen = new Set<string>();
    visibleFields.forEach(f => {
        const rowKey = f.rowId || "";
        if (!seen.has(rowKey)) {
            rowOrder.push(rowKey);
            seen.add(rowKey);
        }
    });

    const getSpan = (count: number) => (count === 1 ? 12 : count === 2 ? 6 : count === 3 ? 4 : count === 4 ? 3 : 12);

    return (
        <div className="template-form-container submit-mode">
            <div className="drop-zone">
                {fields.length === 0 && <p className="drop-placeholder">Loading form...</p>}

                {rowOrder.map(rowId => {
                    const rowFields = rowMap.get(rowId) || [];
                    const span = getSpan(rowFields.length);

                    return (
                        <div key={rowId} className="form-row-wrapper">
                            <div className="form-row">
                                {rowFields.map(field => {
                                    const hasError = !!errors[field.id];

                                    return (
                                        <div key={field.id} className={`form-col span-${span}`}>
                                            <div className={`form-field ${hasError ? "has-error" : ""}`}>
                                                {/* LABEL */}
                                                {field.label && !["horizontal_line", "primary_button", "secondary_button"].includes(field.type) && (
                                                    <div className="label-with-action">
                                                        <label className={field.type === "header" ? "header-label" : ""}>
                                                            {field.label}
                                                            {field.required && field.type !== "header" && <span className="star"> *</span>}
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
                                                            <button className="primary-button" type="button" onClick={handleSubmit}>
                                                                {field.label || "Submit"}
                                                            </button>
                                                        ) : (
                                                            <button className="secondary-button" type="button" onClick={() => navigate("/templates")}>
                                                                {field.label || "Cancel"}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* FIELD INPUTS */}
                                                {(() => {
                                                    switch (field.type) {
                                                        case "input":
                                                            return <input value={values[field.id] || ""} onChange={e => updateValue(field.id, e.target.value)} placeholder={field.placeholder} className={hasError ? "error" : ""} />;
                                                        case "textarea":
                                                            return <textarea value={values[field.id] || ""} onChange={e => updateValue(field.id, e.target.value)} placeholder={field.placeholder} className={hasError ? "error" : ""} />;
                                                        case "number":
                                                            return <input type="number" value={values[field.id] || ""} onChange={e => updateValue(field.id, e.target.value)} placeholder={field.placeholder} className={hasError ? "error" : ""} />;
                                                        case "date":
                                                            return <input type="date" value={values[field.id] || ""} onChange={e => updateValue(field.id, e.target.value)} className={hasError ? "error" : ""} />;
                                                        case "file":
                                                            return <input type="file" accept={field.allowedFileTypes?.join(",")} onChange={e => updateValue(field.id, e.target.files?.[0])} className={hasError ? "error" : ""} />;
                                                        case "select":
                                                            return (
                                                                <select value={values[field.id] || ""} onChange={e => updateValue(field.id, e.target.value)} className={hasError ? "error" : ""}>
                                                                    <option value="">Select an option</option>
                                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                </select>
                                                            );
                                                        case "radio":
                                                            return (
                                                                <div className="radio-group">
                                                                    {field.options?.map(opt => (
                                                                        <label key={opt} className="radio-wrapper">
                                                                            <input type="radio" name={field.id} value={opt} checked={values[field.id] === opt} onChange={() => updateValue(field.id, opt)} className="custom-radio" />
                                                                            <span>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );
                                                        case "checkbox":
                                                            return (
                                                                <div className="checkbox-group">
                                                                    {field.options?.map(opt => (
                                                                        <label key={opt} className="checkbox-wrapper">
                                                                            <input type="checkbox" className="custom-checkbox" checked={values[field.id]?.includes(opt) || false} onChange={() => {
                                                                                const prev = values[field.id] || [];
                                                                                updateValue(field.id, prev.includes(opt) ? prev.filter((o: string) => o !== opt) : [...prev, opt]);
                                                                            }} />
                                                                            <span>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            );
                                                        case "switch":
                                                            return (
                                                                <label className="switch">
                                                                    <input type="checkbox" checked={values[field.id] || false} onChange={e => updateValue(field.id, e.target.checked)} />
                                                                    <span className="slider"></span>
                                                                </label>
                                                            );
                                                        default:
                                                            return null;
                                                    }
                                                })()}

                                                {hasError && <span className="star">{errors[field.id]}</span>}
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

export default FillTemplateForm;