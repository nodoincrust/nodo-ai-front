import React, { useEffect, useRef, useState } from "react";
import { CreateTemplateFormProps, FieldType, FormField } from "../../../../types/common";
import { uid } from "../../../../utils/utilFunctions";
import EditFieldModal from "./EditFieldModal";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { MESSAGES } from "../../../../utils/Messages";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { saveTemplate } from "../../../../services/templates.services";

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({ onSaveTemplate }) => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editField, setEditField] = useState<FormField | null>(null);
    const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const draggedFieldId = useRef<string | null>(null);
    const draggedRowId = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
        setIsDragging(true);
    };

    /* ================= DRAG START - ROW ================= */
    const onRowDragStart = (e: React.DragEvent, rowId: string) => {
        e.stopPropagation();
        draggedRowId.current = rowId;
        draggedFieldId.current = null;
        setIsDragging(true);
    };

    /* ================= ROW REORDERING LOGIC ================= */
    const reorderRows = (draggedRow: string, targetRowId: string, position: 'before' | 'after') => {
        setFields(prev => {
            // Group fields by rowId
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

            const draggedIndex = rowOrder.indexOf(draggedRow);
            const targetIndex = rowOrder.indexOf(targetRowId);

            if (draggedIndex === -1 || targetIndex === -1) return prev;

            // Create new order array
            const newRowOrder = [...rowOrder];

            // Remove dragged row from current position
            newRowOrder.splice(draggedIndex, 1);

            // Calculate new insertion index
            let insertIndex: number;

            if (position === 'before') {
                // Insert before target
                if (draggedIndex < targetIndex) {
                    // Moving down: target shifts left after removal, so insert at targetIndex - 1
                    insertIndex = targetIndex - 1;
                } else {
                    // Moving up: target position unchanged after removal
                    insertIndex = targetIndex;
                }
            } else {
                // Insert after target
                if (draggedIndex < targetIndex) {
                    // Moving down: insert at targetIndex (which is now targetIndex - 1 after removal)
                    insertIndex = targetIndex;
                } else {
                    // Moving up: insert after target
                    insertIndex = targetIndex + 1;
                }
            }

            // Insert dragged row at calculated position
            newRowOrder.splice(insertIndex, 0, draggedRow);

            // Rebuild fields array
            const newFields: FormField[] = [];
            newRowOrder.forEach(rowId => {
                const rowFields = rowMap.get(rowId) || [];
                newFields.push(...rowFields);
            });

            return newFields;
        });
    };

    /* ================= DROP HANDLER - ROW ================= */
    const onDropRow = (e: React.DragEvent, targetRowId: string, position: 'before' | 'after') => {
        e.preventDefault();
        e.stopPropagation();

        const draggedRow = draggedRowId.current;

        if (!draggedRow || draggedRow === targetRowId) {
            draggedRowId.current = null;
            setDragOverRowId(null);
            setDragOverPosition(null);
            setIsDragging(false);
            return;
        }

        reorderRows(draggedRow, targetRowId, position);

        draggedRowId.current = null;
        setDragOverRowId(null);
        setDragOverPosition(null);
        setIsDragging(false);
    };

    /* ================= DROP HANDLER - FIELD ================= */
    const onDropIntoRow = (e: React.DragEvent, targetRowId: string, targetFieldId?: string) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedId = draggedFieldId.current;

        // Handle row drops on the entire row
        if (draggedRowId.current) {
            // Determine position based on mouse Y position
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const position = e.clientY < midpoint ? 'before' : 'after';
            onDropRow(e, targetRowId, position);
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
            draggedFieldId.current = null;
            return;
        }

        // Case 2: Moving existing field
        setFields(prev => {
            const draggedField = prev.find(f => f.id === draggedId);
            if (!draggedField) return prev;

            const sourceRowId = draggedField.rowId || '';
            const targetRowFields = prev.filter(f => (f.rowId || '') === targetRowId);

            // SAME ROW REORDER
            if (sourceRowId === targetRowId && targetFieldId) {
                const otherRows = prev.filter(f => (f.rowId || '') !== targetRowId);

                const draggedIndex = targetRowFields.findIndex(f => f.id === draggedId);
                const targetIndex = targetRowFields.findIndex(f => f.id === targetFieldId);

                if (draggedIndex === -1 || targetIndex === -1) return prev;

                const reordered = [...targetRowFields];
                const [moved] = reordered.splice(draggedIndex, 1);

                // Insert at target position (works for both left-to-right and right-to-left)
                const finalTargetIndex = draggedIndex < targetIndex ? targetIndex : targetIndex;
                reordered.splice(finalTargetIndex, 0, moved);

                return [...otherRows, ...reordered];
            }

            // CROSS-ROW MOVEMENT
            // Prevent dropping into a full row (4 fields)
            if (targetRowFields.length >= 4) {
                return prev; // Don't allow drop
            }

            // Target row has space - move field there
            const updatedFields = prev.map(f =>
                f.id === draggedId ? { ...f, rowId: targetRowId } : f
            );

            // If targetFieldId is provided, reorder within the target row
            if (targetFieldId) {
                const otherRows = updatedFields.filter(f => (f.rowId || '') !== targetRowId);
                const newTargetRowFields = updatedFields.filter(f => (f.rowId || '') === targetRowId);

                const draggedIndex = newTargetRowFields.findIndex(f => f.id === draggedId);
                const targetIndex = newTargetRowFields.findIndex(f => f.id === targetFieldId);

                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const [moved] = newTargetRowFields.splice(draggedIndex, 1);
                    newTargetRowFields.splice(targetIndex, 0, moved);
                    return [...otherRows, ...newTargetRowFields];
                }
            }

            return updatedFields;
        });

        draggedFieldId.current = null;
        setIsDragging(false);
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
        setDragOverRowId(null);
        setDragOverPosition(null);
        setIsDragging(false);
    };

    /* ================= DROP BETWEEN ROWS ================= */
    const onDropBetweenRows = (e: React.DragEvent, afterRowId: string | null) => {
        e.preventDefault();
        e.stopPropagation();

        // Handle row reordering
        if (draggedRowId.current) {
            if (afterRowId === null) {
                // Drop at the very top
                const draggedRow = draggedRowId.current;
                setFields(prev => {
                    const rowMap = new Map<string, FormField[]>();
                    prev.forEach(field => {
                        const rowKey = field.rowId || '';
                        if (!rowMap.has(rowKey)) {
                            rowMap.set(rowKey, []);
                        }
                        rowMap.get(rowKey)!.push(field);
                    });

                    const rowOrder: string[] = [];
                    const seen = new Set<string>();
                    prev.forEach(field => {
                        const rowKey = field.rowId || '';
                        if (!seen.has(rowKey)) {
                            rowOrder.push(rowKey);
                            seen.add(rowKey);
                        }
                    });

                    const newRowOrder = rowOrder.filter(id => id !== draggedRow);
                    newRowOrder.unshift(draggedRow);

                    const newFields: FormField[] = [];
                    newRowOrder.forEach(rowId => {
                        const rowFields = rowMap.get(rowId) || [];
                        newFields.push(...rowFields);
                    });

                    return newFields;
                });
            } else {
                onDropRow(e, afterRowId, 'after');
            }
            draggedRowId.current = null;
            setDragOverRowId(null);
            setDragOverPosition(null);
            setIsDragging(false);
            return;
        }

        // Handle new field from sidebar
        if (!draggedFieldId.current) {
            onDropNewField(e);
        }

        draggedFieldId.current = null;
        setDragOverRowId(null);
        setDragOverPosition(null);
        setIsDragging(false);
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
    const handleSaveTemplate = async () => {
        try {
            getLoaderControl()?.showLoader();

            const headerField = fields.find(f => f.type === "header");

            const payload = {
                templateName: headerField?.label || "Untitled Template",
                fields: fields.map((field, index) => ({
                    id: field.id,
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    required: field.required,
                    requiredErrorMessage: field.required
                        ? field.requiredErrorMessage || ""
                        : "",
                    options: field.options,
                    allowedFileTypes: field.allowedFileTypes,
                    order: index + 1,
                    rowId: field.rowId,
                    className:
                        field.type === "primary_button"
                            ? "primary-button"
                            : field.type === "secondary_button"
                                ? "secondary-button"
                                : field.type === "header"
                                    ? "header-label"
                                    : "form-field",
                })),
            };

            const res = await saveTemplate(payload);

            if (res?.statusCode === 200) {
                notification.success({
                    message: res.message || MESSAGES.SUCCESS.TEMPLATE_SAVED_SUCCESSFULLY,
                });
                setTimeout(() => {
                    navigate(-1);
                }, 3000);
            } else {
                notification.error({
                    message: res.message || MESSAGES.ERRORS.FAILED_TO_SAVE_TEMPLATE,
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

    // Preserve row order
    const rowOrder: string[] = [];
    const seen = new Set<string>();
    visibleFields.forEach((field) => {
        const rowKey = field.rowId || '';
        if (!seen.has(rowKey)) {
            rowOrder.push(rowKey);
            seen.add(rowKey);
        }
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
            <div className={`template-form-container ${isDragging ? 'dragging-active' : ''}`} ref={containerRef}>
                <div
                    className="drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDropIntoEmptySpace}
                >
                    {fields.length === 0 && <p className="drop-placeholder">Drag & Drop fields here</p>}

                    {/* Drop zone at the very top */}
                    {rowOrder.length > 0 && (
                        <div
                            className={`row-drop-zone ${dragOverRowId === 'top' ? 'drag-over' : ''}`}
                            onDragOver={(e) => {
                                if (draggedRowId.current || draggedFieldId.current || e.dataTransfer.types.includes('type')) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverRowId('top');
                                }
                            }}
                            onDragLeave={(e) => {
                                const relatedTarget = e.relatedTarget as HTMLElement;
                                const currentTarget = e.currentTarget as HTMLElement;

                                // Only clear if we're actually leaving the drop zone
                                // Don't clear if moving to drag handle or form row
                                if (!currentTarget.contains(relatedTarget)) {
                                    // Check if we're moving to another valid drop area
                                    if (relatedTarget && (
                                        relatedTarget.classList?.contains('row-drag-handle') ||
                                        relatedTarget.classList?.contains('form-row') ||
                                        relatedTarget.closest('.row-drag-handle') ||
                                        relatedTarget.closest('.form-row')
                                    )) {
                                        return;
                                    }
                                    setDragOverRowId(null);
                                }
                            }}
                            onDrop={(e) => onDropBetweenRows(e, null)}
                        >
                            <div className="drop-indicator">Drop here to insert at top</div>
                        </div>
                    )}

                    {rowOrder.map((rowId, rowIndex) => {
                        const rowFields = rowMap.get(rowId) || [];
                        const span = getSpan(rowFields.length);
                        const isRowDragOver = dragOverRowId === rowId;

                        return (
                            <React.Fragment key={rowId}>
                                <div
                                    className={`form-row-wrapper ${isRowDragOver && dragOverPosition === 'before' ? 'drag-over-before' : ''} ${isRowDragOver && dragOverPosition === 'after' ? 'drag-over-after' : ''}`}
                                >
                                    {/* Row Drag Handle */}
                                    <div
                                        className="row-drag-handle"
                                        draggable
                                        onDragStart={(e) => onRowDragStart(e, rowId)}
                                        onDragOver={(e) => {
                                            // Accept row drags from other rows
                                            if (draggedRowId.current && draggedRowId.current !== rowId) {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                // Determine position based on mouse Y position relative to drag handle
                                                const target = e.currentTarget as HTMLElement;
                                                const rect = target.getBoundingClientRect();
                                                const midpoint = rect.top + rect.height / 2;
                                                const position = e.clientY < midpoint ? 'before' : 'after';

                                                setDragOverRowId(rowId);
                                                setDragOverPosition(position);
                                            }
                                        }}
                                        onDragLeave={(e) => {
                                            // Only clear if we're leaving to somewhere other than a drop zone
                                            const relatedTarget = e.relatedTarget as HTMLElement;
                                            const target = e.currentTarget as HTMLElement;

                                            // Don't clear if moving to a drop zone
                                            if (relatedTarget && relatedTarget.classList?.contains('row-drop-zone')) {
                                                return;
                                            }

                                            if (!target.contains(relatedTarget as Node)) {
                                                if (draggedRowId.current && !dragOverRowId?.startsWith('after-') && dragOverRowId !== 'top') {
                                                    setDragOverRowId(null);
                                                    setDragOverPosition(null);
                                                }
                                            }
                                        }}
                                        onDrop={(e) => {
                                            if (draggedRowId.current && draggedRowId.current !== rowId) {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                // Determine final position based on mouse Y
                                                const target = e.currentTarget as HTMLElement;
                                                const rect = target.getBoundingClientRect();
                                                const midpoint = rect.top + rect.height / 2;
                                                const position = e.clientY < midpoint ? 'before' : 'after';

                                                onDropRow(e, rowId, position);
                                            }
                                        }}
                                        onDragEnd={() => {
                                            draggedRowId.current = null;
                                            setDragOverRowId(null);
                                            setDragOverPosition(null);
                                            setIsDragging(false);
                                        }}
                                        title="Drag to reorder row"
                                    >
                                        <img src="/assets/drag-drop.svg" alt="drag-handle" />
                                    </div>

                                    <div
                                        className="form-row"
                                        onDragOver={(e) => {
                                            if (draggedRowId.current && draggedRowId.current !== rowId) {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                // Determine if we're in the top or bottom half
                                                const target = e.currentTarget as HTMLElement;
                                                const rect = target.getBoundingClientRect();
                                                const midpoint = rect.top + rect.height / 2;
                                                const position = e.clientY < midpoint ? 'before' : 'after';

                                                setDragOverRowId(rowId);
                                                setDragOverPosition(position);
                                            } else if (!draggedRowId.current) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onDragLeave={(e) => {
                                            const relatedTarget = e.relatedTarget as HTMLElement;
                                            const target = e.currentTarget as HTMLElement;

                                            // Don't clear if moving to a drop zone
                                            if (relatedTarget && (
                                                relatedTarget.classList?.contains('row-drop-zone') ||
                                                relatedTarget.classList?.contains('drop-indicator') ||
                                                relatedTarget.closest('.row-drop-zone')
                                            )) {
                                                return;
                                            }

                                            // Only clear if we're leaving the row entirely
                                            if (!target.contains(relatedTarget)) {
                                                // Only clear if this was our active row
                                                if (dragOverRowId === rowId) {
                                                    setDragOverRowId(null);
                                                    setDragOverPosition(null);
                                                }
                                            }
                                        }}
                                        onDrop={(e) => {
                                            if (draggedRowId.current) {
                                                const target = e.currentTarget as HTMLElement;
                                                const rect = target.getBoundingClientRect();
                                                const midpoint = rect.top + rect.height / 2;
                                                const position = e.clientY < midpoint ? 'before' : 'after';
                                                onDropRow(e, rowId, position);
                                            } else {
                                                onDropIntoRow(e, rowId);
                                            }
                                        }}
                                    >
                                        {rowFields.map((field) => {
                                            const isActive = field.id === activeId;

                                            return (
                                                <div key={field.id} className={`form-col span-${span}`}>
                                                    <div
                                                        draggable
                                                        onDragStart={() => onDragStart(field.id)}
                                                        onDragOver={(e) => {
                                                            // Accept field drags (not row drags)
                                                            if (!draggedRowId.current) {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }
                                                        }}
                                                        onDrop={(e) => {
                                                            // Only handle field drops
                                                            if (!draggedRowId.current) {
                                                                onDropIntoRow(e, rowId, field.id);
                                                            }
                                                        }}
                                                        onDragEnd={() => {
                                                            draggedFieldId.current = null;
                                                            setIsDragging(false);
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

                                {/* Drop zone between rows */}
                                {/* <div
                                    className={`row-drop-zone ${dragOverRowId === `after-${rowId}` ? 'drag-over' : ''}`}
                                    onDragOver={(e) => {
                                        if (draggedRowId.current || draggedFieldId.current || e.dataTransfer.types.includes('type')) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDragOverRowId(`after-${rowId}`);
                                        }
                                    }}
                                    onDragLeave={(e) => {
                                        const relatedTarget = e.relatedTarget as HTMLElement;
                                        const currentTarget = e.currentTarget as HTMLElement;

                                        // Only clear if we're actually leaving the drop zone completely
                                        if (!currentTarget.contains(relatedTarget)) {
                                            // Don't clear if moving to a valid drop area
                                            if (relatedTarget && (
                                                relatedTarget.classList?.contains('row-drag-handle') ||
                                                relatedTarget.classList?.contains('form-row') ||
                                                relatedTarget.closest('.row-drag-handle') ||
                                                relatedTarget.closest('.form-row')
                                            )) {
                                                return;
                                            }

                                            // Only clear if this is our active drop zone
                                            if (dragOverRowId === `after-${rowId}`) {
                                                setDragOverRowId(null);
                                            }
                                        }
                                    }}
                                    onDrop={(e) => onDropBetweenRows(e, rowId)}
                                >
                                    <div className="drop-indicator">Drop here to insert new row</div>
                                </div> */}
                            </React.Fragment>
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