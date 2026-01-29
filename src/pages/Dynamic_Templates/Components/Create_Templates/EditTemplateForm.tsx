import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormField, FieldType } from "../../../../types/common";
import { uid } from "../../../../utils/utilFunctions";
import EditFieldModal from "./EditFieldModal";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { notification } from "antd";
import { MESSAGES } from "../../../../utils/Messages";
import { getTemplateById, saveTemplate } from "../../../../services/templates.services";

const EditTemplateForm: React.FC = () => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editField, setEditField] = useState<FormField | null>(null);
    const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const draggedFieldId = useRef<string | null>(null);
    const draggedRowId = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { id: templateId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    /* ================= FETCH TEMPLATE ================= */
    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return;
            try {
                getLoaderControl()?.showLoader();
                const res = await getTemplateById(templateId);
                if (res?.statusCode === 200 && res.data?.fields) {
                    const loadedFields = res.data.fields.map((f: any) => ({
                        id: f.id.toString(),
                        type: f.type as FieldType,
                        label: f.label,
                        placeholder: f.placeholder || "",
                        required: f.required,
                        requiredErrorMessage: f.requiredErrorMessage || "",
                        options: f.options || [],
                        rowId: f.rowId || uid(),
                        hasUserEdited: false,
                    }));
                    setFields(loadedFields);
                } else {
                    notification.error({ message: res.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
                }
            } catch (err: any) {
                notification.error({ message: err?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
            } finally {
                getLoaderControl()?.hideLoader();
            }
        };
        fetchTemplate();
    }, [templateId]);

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

    /* ================= DRAG HANDLERS ================= */
    const onDragStart = (fieldId: string) => {
        draggedFieldId.current = fieldId;
        draggedRowId.current = null;
        setIsDragging(true);
    };

    const onRowDragStart = (e: React.DragEvent, rowId: string) => {
        e.stopPropagation();
        draggedRowId.current = rowId;
        draggedFieldId.current = null;
        setIsDragging(true);
    };

    /* ================= ROW REORDERING ================= */
    const reorderRows = (draggedRow: string, targetRowId: string, position: 'before' | 'after') => {
        setFields(prev => {
            const rowMap = new Map<string, FormField[]>();
            prev.forEach(f => {
                const rowKey = f.rowId || '';
                if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
                rowMap.get(rowKey)!.push(f);
            });

            const rowOrder: string[] = [];
            const seen = new Set<string>();
            prev.forEach(f => {
                const rowKey = f.rowId || '';
                if (!seen.has(rowKey)) {
                    rowOrder.push(rowKey);
                    seen.add(rowKey);
                }
            });

            const draggedIndex = rowOrder.indexOf(draggedRow);
            const targetIndex = rowOrder.indexOf(targetRowId);
            if (draggedIndex === -1 || targetIndex === -1) return prev;

            const newRowOrder = [...rowOrder];
            newRowOrder.splice(draggedIndex, 1);

            const insertIndex =
                position === 'before'
                    ? (draggedIndex < targetIndex ? targetIndex - 1 : targetIndex)
                    : (draggedIndex < targetIndex ? targetIndex : targetIndex + 1);

            newRowOrder.splice(insertIndex, 0, draggedRow);

            const newFields: FormField[] = [];
            newRowOrder.forEach(rowId => {
                const rowFields = rowMap.get(rowId) || [];
                newFields.push(...rowFields);
            });
            return newFields;
        });
    };

    /* ================= DROP HANDLERS ================= */
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

    const onDropIntoRow = (e: React.DragEvent, targetRowId: string, targetFieldId?: string) => {
        e.preventDefault();
        e.stopPropagation();

        // Drop row over row
        if (draggedRowId.current) {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
            onDropRow(e, targetRowId, position);
            return;
        }

        // New field from sidebar
        if (!draggedFieldId.current) {
            const type = e.dataTransfer.getData("type") as FieldType;
            if (type) {
                const rowFields = fields.filter(f => (f.rowId || '') === targetRowId);
                if (rowFields.length >= 4) onDropNewField(e, uid());
                else onDropNewField(e, targetRowId);
            }
            draggedFieldId.current = null;
            return;
        }

        // Moving existing field
        setFields(prev => {
            const draggedField = prev.find(f => f.id === draggedFieldId.current);
            if (!draggedField) return prev;

            const sourceRowId = draggedField.rowId || '';
            const targetRowFields = prev.filter(f => (f.rowId || '') === targetRowId);

            // SAME ROW
            if (sourceRowId === targetRowId && targetFieldId) {
                const otherRows = prev.filter(f => (f.rowId || '') !== targetRowId);
                const draggedIndex = targetRowFields.findIndex(f => f.id === draggedFieldId.current);
                const targetIndex = targetRowFields.findIndex(f => f.id === targetFieldId);
                if (draggedIndex === -1 || targetIndex === -1) return prev;

                const reordered = [...targetRowFields];
                const [moved] = reordered.splice(draggedIndex, 1);
                reordered.splice(targetIndex, 0, moved);
                return [...otherRows, ...reordered];
            }

            // CROSS ROW
            if (targetRowFields.length >= 4) return prev;
            return prev.map(f =>
                f.id === draggedFieldId.current ? { ...f, rowId: targetRowId } : f
            );
        });

        draggedFieldId.current = null;
        setIsDragging(false);
    };

    const onDropIntoEmptySpace = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedFieldId.current && !draggedRowId.current) onDropNewField(e);
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
            if (!containerRef.current?.contains(target)) setActiveId(null);
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
                    requiredErrorMessage: field.required ? field.requiredErrorMessage || "" : "",
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
                notification.success({ message: res.message || MESSAGES.SUCCESS.TEMPLATE_SAVED_SUCCESSFULLY });
                setTimeout(() => navigate(-1), 3000);
            } else {
                notification.error({ message: res.message || MESSAGES.ERRORS.FAILED_TO_SAVE_TEMPLATE });
            }
        } catch (err: any) {
            notification.error({ message: err?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG });
        } finally {
            getLoaderControl()?.hideLoader();
        }
    };

    useEffect(() => {
        (window as any).__saveTemplate = handleSaveTemplate;
    }, [fields]);

    /* ================= RENDER ================= */
    const visibleFields = fields.filter(f => f.label && f.label.trim() !== "");
    const rowMap = new Map<string, FormField[]>();
    visibleFields.forEach(f => {
        const rowKey = f.rowId || uid();
        if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
        rowMap.get(rowKey)!.push(f);
    });

    const rowOrder: string[] = [];
    const seen = new Set<string>();
    visibleFields.forEach(f => {
        const rowKey = f.rowId || '';
        if (!seen.has(rowKey)) {
            rowOrder.push(rowKey);
            seen.add(rowKey);
        }
    });

    const getSpan = (count: number) => (count === 1 ? 12 : count === 2 ? 6 : count === 3 ? 4 : 3);

    return (
        <>
            <div className={`template-form-container ${isDragging ? 'dragging-active' : ''}`} ref={containerRef}>
                <div className="drop-zone" onDragOver={(e) => e.preventDefault()} onDrop={onDropIntoEmptySpace}>
                    {fields.length === 0 && <p className="drop-placeholder">Drag & Drop fields here</p>}

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
                            onDragLeave={() => setDragOverRowId(null)}
                            onDrop={(e) => onDropBetweenRows(e, null)}
                        >
                            <div className="drop-indicator">Drop here to insert at top</div>
                        </div>
                    )}

                    {rowOrder.map((rowId) => {
                        const rowFields = rowMap.get(rowId) || [];
                        const span = getSpan(rowFields.length);
                        const isRowDragOver = dragOverRowId === rowId;

                        return (
                            <React.Fragment key={rowId}>
                                <div className={`form-row-wrapper ${isRowDragOver ? `drag-over-${dragOverPosition}` : ''}`}>
                                    <div
                                        className="row-drag-handle"
                                        draggable
                                        onDragStart={(e) => onRowDragStart(e, rowId)}
                                        title="Drag to reorder row"
                                    >
                                        <img src="/assets/drag-drop.svg" alt="drag-handle" />
                                    </div>

                                    <div
                                        className="form-row"
                                        onDragOver={(e) => { if (!draggedRowId.current) e.preventDefault(); }}
                                        onDrop={(e) => onDropIntoRow(e, rowId)}
                                    >
                                        {rowFields.map((field) => {
                                            const isActive = field.id === activeId;
                                            return (
                                                <div key={field.id} className={`form-col span-${span}`}>
                                                    <div
                                                        draggable
                                                        onDragStart={() => onDragStart(field.id)}
                                                        onDragEnd={() => { draggedFieldId.current = null; setIsDragging(false); }}
                                                        onClick={(e) => { e.stopPropagation(); setActiveId(field.id); }}
                                                        className={`form-field ${isActive ? "active" : ""}`}
                                                    >
                                                        {/* LABEL + ACTIONS */}
                                                        {field.label && !["horizontal_line", "primary_button", "secondary_button"].includes(field.type) && (
                                                            <div className="label-with-action">
                                                                <label className={field.type === "header" ? "header-label" : ""}>
                                                                    {field.label}{field.required && field.type !== "header" && <span className="star"> *</span>}
                                                                </label>
                                                                <div className="field-actions">
                                                                    <img src="/assets/edit.svg" alt="edit" onClick={(e) => { e.stopPropagation(); setEditField(field); setActiveId(field.id); }} />
                                                                    <img src="/assets/trash.svg" alt="delete" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* HORIZONTAL LINE */}
                                                        {field.type === "horizontal_line" && (
                                                            <div className="hr-with-action">
                                                                <hr className="form-hr" />
                                                                <img src="/assets/trash.svg" alt="delete" onClick={() => removeField(field.id)} />
                                                            </div>
                                                        )}

                                                        {/* BUTTONS */}
                                                        {["primary_button", "secondary_button"].includes(field.type) && (
                                                            <div className="button-field-with-action">
                                                                <button className={field.type === "primary_button" ? "primary-button" : "secondary-button"} disabled>
                                                                    {field.label || (field.type === "primary_button" ? "Primary Button" : "Secondary Button")}
                                                                </button>
                                                                <div className="field-actions">
                                                                    <img src="/assets/edit.svg" alt="edit" onClick={(e) => { e.stopPropagation(); setEditField(field); setActiveId(field.id); }} />
                                                                    <img src="/assets/trash.svg" alt="delete" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* FIELD PREVIEW */}
                                                        {(() => {
                                                            switch (field.type) {
                                                                case "input": return <input readOnly placeholder={field.placeholder} />;
                                                                case "textarea": return <textarea readOnly placeholder={field.placeholder} />;
                                                                case "number": return <input readOnly type="number" placeholder={field.placeholder} />;
                                                                case "date": return <input type="date" placeholder={field.placeholder} />;
                                                                case "file": return <input type="file" readOnly disabled placeholder={field.placeholder || `Upload ${field.label}`} />;
                                                                case "checkbox": return <div className="checkbox-group">{field.options?.map((opt, i) => (<label key={i} className="checkbox-wrapper"><input type="checkbox" disabled /><span>{opt}</span></label>))}</div>;
                                                                case "switch": return <label className="switch"><input type="checkbox" disabled /><span className="slider" /></label>;
                                                                case "select": return <div className="custom-select-wrapper disabled"><div className="custom-select-display">{field.selectedValue || `Select ${field.label}`}<span className="arrow" /></div></div>;
                                                                case "radio": return <div className="radio-group">{field.options?.map((opt, i) => (<label key={i} className="radio-wrapper"><input type="radio" name={field.id} /><span>{opt}</span></label>))}</div>;
                                                                default: return null;
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {editField && (
                <EditFieldModal
                    open={!!editField}
                    field={editField}
                    onClose={() => { setEditField(null); setActiveId(null); }}
                    onSave={(data) => { updateField(editField.id, data); setEditField(null); setActiveId(null); }}
                />
            )}
        </>
    );
};

export default EditTemplateForm;
