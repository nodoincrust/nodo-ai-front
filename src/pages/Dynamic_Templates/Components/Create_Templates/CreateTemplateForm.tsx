import React, { useEffect, useRef, useState } from "react";
import { CreateTemplateFormProps, FieldType, FormField } from "../../../../types/common";
import { uid } from "../../../../utils/utilFunctions";
import EditFieldModal from "./EditFieldModal";

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSaveTemplate }) => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editField, setEditField] = useState<FormField | null>(null);

    const dragIndex = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /* ================= DROP NEW FIELD ================= */
    const onDropNewField = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("type") as FieldType;
        const label = e.dataTransfer.getData("label");

        setFields((prev) => [
            ...prev,
            {
                id: uid(),
                type,
                label,
                placeholder: `Enter ${label}`,
                required: false,
                options:
                    type === "select" || type === "radio" || type === "checkbox"
                        ? ["Option 1"]
                        : undefined,
            },
        ]);
    };

    /* ================= UPDATE / REMOVE FIELD ================= */
    const updateField = (id: string, data: Partial<FormField>) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    };

    const removeField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        setActiveId(null);
    };

    /* ================= REORDER ================= */
    const onDragStart = (index: number) => {
        dragIndex.current = index;
    };

    const onDropReorder = (draggedIndex: number, targetIndex: number, insertAfter: boolean = false) => {
        setFields((prev) => {
            const updated = [...prev];
            const [moved] = updated.splice(draggedIndex, 1);

            let newIndex = targetIndex;
            if (insertAfter) newIndex = targetIndex + 1;

            updated.splice(newIndex, 0, moved);
            return updated;
        });
        dragIndex.current = null;
    };

    /* ================= CLICK OUTSIDE ================= */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!containerRef.current?.contains(target)) {
                setActiveId(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ================= SAVE TEMPLATE ================= */
    const handleSaveTemplate = () => {
        const headerField = fields.find((field) => field.type === "header");

        const payload = {
            templateName: headerField?.label || "Untitled Template",
            fields: fields.map((field, index) => ({
                id: field.id,
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required,
                options: field.options,
                order: index + 1,
            })),
        };

        console.log("SAVE TEMPLATE PAYLOAD 👉", payload);
    };

    useEffect(() => {
        (window as any).__saveTemplate = handleSaveTemplate;
    }, [fields]);

    return (
        <>
            <div className="template-form-container" ref={containerRef}>
                <div
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (dragIndex.current !== null) {
                            // Drop dragged field in empty space → bottom
                            onDropReorder(dragIndex.current, fields.length - 1, true);
                        } else {
                            // Drop new field
                            onDropNewField(e);
                        }
                    }}
                >
                    {fields.length === 0 && <p className="drop-placeholder">Drag & Drop fields here</p>}

                    {fields
                        .filter(f => f.label && f.label.trim() !== "")
                        .map((field, index) => {
                            const isActive = field.id === activeId;

                            return (
                                <div
                                    key={field.id}
                                    draggable
                                    onDragStart={() => onDragStart(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                        if (dragIndex.current === null) return;
                                        onDropReorder(dragIndex.current, index);
                                        dragIndex.current = null;
                                    }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        setActiveId(field.id);
                                    }}
                                    className={`form-field ${isActive ? "active" : ""}`}
                                >
                                    {/* ===== HEADER + NORMAL FIELDS ===== */}
                                    {field.label && field.type !== "horizontal_line" &&
                                        field.type !== "primary_button" &&
                                        field.type !== "secondary_button" && (
                                            <div className="label-with-action">
                                                <label className={field.type === "header" ? "header-label" : ""}>
                                                    {field.label}
                                                    {field.required && field.type !== "header" && <span className="star"> *</span>}
                                                </label>

                                                <div className="field-actions">
                                                    <img
                                                        src="/assets/edit.svg"
                                                        alt="edit"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveId(field.id);
                                                            setEditField(field);
                                                        }}
                                                    />
                                                    <img
                                                        src="/assets/trash.svg"
                                                        alt="delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeField(field.id);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}


                                    {/* ===== HORIZONTAL LINE ===== */}
                                    {field.type === "horizontal_line" && (
                                        <div className="hr-with-action">
                                            <hr className="form-hr" />
                                            <img
                                                src="/assets/trash.svg"
                                                alt="delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeField(field.id);
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* ===== BUTTONS INLINE ===== */}
                                    {(field.type === "primary_button" || field.type === "secondary_button") && (
                                        <div className="button-field-with-action">
                                            {field.type === "primary_button" ? (
                                                <button className="primary-button" type="button" disabled>
                                                    {field.label || "Primary Button"}
                                                </button>
                                            ) : (
                                                <button className="secondary-button" type="button" disabled>
                                                    {field.label || "Secondary Button"}
                                                </button>
                                            )}

                                            <div className="field-actions">
                                                <img
                                                    src="/assets/edit.svg"
                                                    alt="edit"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveId(field.id);
                                                        setEditField(field);
                                                    }}
                                                />
                                                <img
                                                    src="/assets/trash.svg"
                                                    alt="delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeField(field.id);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* ===== FIELD PREVIEW ===== */}
                                    {(() => {
                                        switch (field.type) {
                                            case "input":
                                                return <input readOnly placeholder={field.placeholder} />;
                                            case "textarea":
                                                return <textarea readOnly placeholder={field.placeholder} />;
                                            case "number":
                                                return <input readOnly type="number" placeholder={field.placeholder} />;
                                            case "date":
                                                return <input type="date" placeholder={field.placeholder} />;
                                            case "checkbox":
                                                return (
                                                    <div className="checkbox-group">
                                                        {field.options?.map((opt, i) => (
                                                            <label key={i} className="checkbox-wrapper">
                                                                <input type="checkbox" className="custom-checkbox" disabled />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                );
                                            case "switch":
                                                return (
                                                    <label className="switch">
                                                        <input type="checkbox" disabled />
                                                        <span className="slider" />
                                                    </label>
                                                );
                                            case "select":
                                                const isDisabled = true;
                                                return (
                                                    <div
                                                        className={`custom-select-wrapper ${isDisabled ? "disabled" : ""}`}
                                                        onClick={(e) => {
                                                            if (isDisabled) return;
                                                            e.stopPropagation();
                                                            updateField(field.id, { isOpen: !field.isOpen });
                                                        }}
                                                    >
                                                        <div className={`custom-select-display ${field.isOpen ? "open" : ""}`}>
                                                            {field.selectedValue || `Select ${field.label}`}
                                                            <span className="arrow" />
                                                        </div>

                                                        {!isDisabled && field.isOpen && (
                                                            <div className="custom-select-options">
                                                                {field.options?.map((opt: string, i: number) => (
                                                                    <div
                                                                        key={i}
                                                                        className="custom-select-option"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateField(field.id, { selectedValue: opt, isOpen: false });
                                                                        }}
                                                                    >
                                                                        {opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            case "radio":
                                                return (
                                                    <div className="radio-group">
                                                        {field.options?.map((opt: string, i: number) => (
                                                            <label key={i} className="radio-wrapper">
                                                                <input type="radio" name={field.id} />
                                                                <span>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })()}
                                </div>
                            );
                        })}
                </div>
            </div>

            {editField && (
                <EditFieldModal
                    open={!!editField}
                    field={editField}
                    onClose={() => {
                        setEditField(null);
                        setActiveId(null);
                    }}
                    onSave={(data) => {
                        updateField(editField.id, data);
                        setEditField(null);
                        setActiveId(null);
                    }}
                />
            )}
        </>
    );
};

export default CreateTemplateForm;
