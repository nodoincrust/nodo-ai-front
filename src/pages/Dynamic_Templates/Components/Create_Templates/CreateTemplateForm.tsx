import React, { useEffect, useRef, useState } from "react";
import { CreateTemplateFormProps, FieldType, FormField } from "../../../../types/common";
import { uid } from "../../../../utils/utilFunctions";
import EditFieldModal from "./EditFieldModal";

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSaveTemplate }) => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editField, setEditField] = useState<FormField | null>(null);

    const draggedFieldId = useRef<string | null>(null);
    const draggedRowId = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    /* ================= DROP NEW FIELD ================= */
    const onDropNewField = (e: React.DragEvent, targetRowId?: string) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("type") as FieldType;
        const label = e.dataTransfer.getData("label");

        if (!type || !label) return;

        const newField: FormField = {
            id: uid(),
            type,
            label,
            placeholder: `Enter ${label}`,
            required: false,
            options:
                type === "select" || type === "radio" || type === "checkbox"
                    ? ["Option 1"]
                    : undefined,
            rowId: targetRowId || uid(),
            hasUserEdited: false,
        };

        setFields((prev) => [...prev, newField]);
    };

    /* ================= UPDATE / REMOVE FIELD ================= */
    const updateField = (id: string, data: Partial<FormField>) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
    };

    const removeField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        setActiveId(null);
    };

    /* ================= DRAG START - FIELD ================= */
    const onDragStart = (fieldId: string) => {
        draggedFieldId.current = fieldId;
        draggedRowId.current = null;
    };

    /* ================= DRAG START - ROW ================= */
    const onRowDragStart = (e: React.DragEvent, rowId: string) => {
        e.stopPropagation();
        draggedRowId.current = rowId;
        draggedFieldId.current = null;
    };

    /* ================= DROP HANDLER - ROW ================= */
    const onDropRow = (e: React.DragEvent, targetRowId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedRow = draggedRowId.current;

        if (!draggedRow) {
            return;
        }

        if (draggedRow === targetRowId) {
            draggedRowId.current = null;
            return;
        }

        setFields(prev => {
            // Group fields by rowId to maintain row structure
            const rowMap = new Map<string, FormField[]>();
            prev.forEach(field => {
                const rowKey = field.rowId || '';
                if (!rowMap.has(rowKey)) {
                    rowMap.set(rowKey, []);
                }
                rowMap.get(rowKey)!.push(field);
            });

            // Get ordered list of row IDs
            const rowOrder: string[] = [];
            const seen = new Set<string>();
            prev.forEach(field => {
                const rowKey = field.rowId || '';
                if (!seen.has(rowKey)) {
                    rowOrder.push(rowKey);
                    seen.add(rowKey);
                }
            });

            // Find positions
            const draggedIndex = rowOrder.indexOf(draggedRow);
            const targetIndex = rowOrder.indexOf(targetRowId);

            if (draggedIndex === -1 || targetIndex === -1) return prev;

            // Remove dragged row from its position
            const newRowOrder = rowOrder.filter(id => id !== draggedRow);

            // Insert at target position (before the target row)
            newRowOrder.splice(targetIndex > draggedIndex ? targetIndex - 1 : targetIndex, 0, draggedRow);

            // Rebuild fields array in new order
            const newFields: FormField[] = [];
            newRowOrder.forEach(rowId => {
                const rowFields = rowMap.get(rowId) || [];
                newFields.push(...rowFields);
            });

            return newFields;
        });

        draggedRowId.current = null;
    };

    /* ================= DROP HANDLER - FIELD ================= */
    const onDropIntoRow = (e: React.DragEvent, targetRowId: string, targetFieldId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedId = draggedFieldId.current;

        // Ignore if dragging a row
        if (draggedRowId.current) {
            return;
        }

        // Case 1: Dropping a new field from sidebar
        if (!draggedId) {
            const type = e.dataTransfer.getData("type") as FieldType;
            if (type) {
                const rowFields = fields.filter(f => (f.rowId || '') === targetRowId);
                if (rowFields.length >= 4) {
                    // Target row full → create new row
                    onDropNewField(e, uid());
                } else {
                    // Target row has space → add field there
                    onDropNewField(e, targetRowId);
                }
            }
            return;
        }

        // Case 2: Moving existing field
        setFields(prev => {
            const draggedField = prev.find(f => f.id === draggedId);
            if (!draggedField) return prev;

            const sourceRowId = draggedField.rowId || '';
            const targetRowFields = prev.filter(f => (f.rowId || '') === targetRowId);

            // SAME ROW REORDER
            if (sourceRowId === targetRowId) {
                const otherRows = prev.filter(f => (f.rowId || '') !== targetRowId);

                const draggedIndex = targetRowFields.findIndex(f => f.id === draggedId);
                const targetIndex = targetRowFields.findIndex(f => f.id === targetFieldId);

                if (draggedIndex === -1 || targetIndex === -1) return prev;

                const reordered = [...targetRowFields];
                const [moved] = reordered.splice(draggedIndex, 1);
                reordered.splice(targetIndex, 0, moved);

                return [...otherRows, ...reordered];
            }

            // CROSS-ROW MOVEMENT
            // Prevent dropping into a full row (4 fields)
            if (targetRowFields.length >= 4) {
                return prev; // Don't allow drop
            }

            // Target row has space - move field there
            return prev.map(f =>
                f.id === draggedId ? { ...f, rowId: targetRowId } : f
            );
        });

        draggedFieldId.current = null;
    };

    /* ================= DROP INTO EMPTY SPACE ================= */
    const onDropIntoEmptySpace = (e: React.DragEvent) => {
        e.preventDefault();

        // Only handle new fields from sidebar
        if (!draggedFieldId.current && !draggedRowId.current) {
            onDropNewField(e);
        }

        draggedFieldId.current = null;
        draggedRowId.current = null;
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
                rowId: field.rowId,
            })),
        };

        console.log("SAVE TEMPLATE PAYLOAD 👉", payload);
    };

    useEffect(() => {
        (window as any).__saveTemplate = handleSaveTemplate;
    }, [fields]);

    /* ================= RENDER ================= */
    const visibleFields = fields.filter(f => f.label && f.label.trim() !== "");

    // Group by rowId
    const rowMap = new Map<string, FormField[]>();
    visibleFields.forEach((field) => {
        const rowKey = field.rowId || '';
        if (!rowMap.has(rowKey)) {
            rowMap.set(rowKey, []);
        }
        rowMap.get(rowKey)!.push(field);
    });

    const getSpan = (count: number) => {
        if (count === 1) return 12;
        if (count === 2) return 6;
        if (count === 3) return 4;
        if (count === 4) return 3;
        return 12;
    };

    return (
        <>
            <div className="template-form-container" ref={containerRef}>
                <div
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDropIntoEmptySpace}
                >
                    {fields.length === 0 && <p className="drop-placeholder">Drag & Drop fields here</p>}

                    {Array.from(rowMap.entries()).map(([rowId, rowFields]) => {
                        const span = getSpan(rowFields.length);

                        return (
                            <div
                                className="form-row-wrapper"
                                key={rowId}
                            >
                                {/* Row Drag Handle with Drop Zone */}
                                <div
                                    className="row-drag-handle"
                                    draggable
                                    onDragStart={(e) => onRowDragStart(e, rowId)}
                                    onDragOver={(e) => {
                                        // Only accept row drags
                                        if (draggedRowId.current && draggedRowId.current !== rowId) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                    }}
                                    onDrop={(e) => {
                                        // Only handle row drops
                                        if (draggedRowId.current && draggedRowId.current !== rowId) {
                                            onDropRow(e, rowId);
                                        }
                                    }}
                                    onDragEnd={() => {
                                        draggedRowId.current = null;
                                    }}
                                    title="Drag to reorder row"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                </div>

                                <div className="form-row">
                                    {rowFields.map((field) => {
                                        const isActive = field.id === activeId;

                                        return (
                                            <div key={field.id} className={`form-col span-${span}`}>
                                                <div
                                                    draggable
                                                    onDragStart={() => onDragStart(field.id)}
                                                    onDragOver={(e) => {
                                                        // Only accept field drags
                                                        if (!draggedRowId.current) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onDrop={(e) => {
                                                        // Only handle field drops
                                                        if (!draggedRowId.current) {
                                                            onDropIntoRow(e, rowId, field.id);
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveId(field.id);
                                                    }}
                                                    className={`form-field ${isActive ? "active" : ""}`}
                                                >
                                                    {/* ===== HEADER + NORMAL FIELDS ===== */}
                                                    {field.label &&
                                                        field.type !== "horizontal_line" &&
                                                        field.type !== "primary_button" &&
                                                        field.type !== "secondary_button" && (
                                                            <div className="label-with-action">
                                                                <label className={field.type === "header" ? "header-label" : ""}>
                                                                    {field.label}
                                                                    {field.required && field.type !== "header" && (
                                                                        <span className="star"> *</span>
                                                                    )}
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
                                                    {(field.type === "primary_button" ||
                                                        field.type === "secondary_button") && (
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
                                                            case "file":
                                                                return (<input type="file" readOnly placeholder={field.placeholder || `Upload ${field.label}`} disabled />);
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
                                                                    >
                                                                        <div className="custom-select-display">
                                                                            {field.selectedValue || `Select ${field.label}`}
                                                                            <span className="arrow" />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            case "radio":
                                                                return (
                                                                    <div className="radio-group">
                                                                        {field.options?.map((opt, i) => (
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
                                            </div>
                                        );
                                    })}
                                </div>
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