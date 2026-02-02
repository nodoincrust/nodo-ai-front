import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormField, FieldType, CreateEditTemplateFormProps } from "../../../../types/common";
import { uid } from "../../../../utils/utilFunctions";
import EditFieldModal from "./EditFieldModal";
import { getLoaderControl } from "../../../../CommonComponents/Loader/loader";
import { notification } from "antd";
import { MESSAGES } from "../../../../utils/Messages";
import { getTemplateById, saveTemplate } from "../../../../services/templates.services";

const CreateEditTemplateForm: React.FC<CreateEditTemplateFormProps> = ({ templateId, isViewMode, onFieldsChange }) => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editField, setEditField] = useState<FormField | null>(null);
    const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const draggedFieldId = useRef<string | null>(null);
    const draggedRowId = useRef<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const initialFieldsRef = useRef<FormField[]>([]);

    const navigate = useNavigate();
    const isEditMode = !!templateId && !isViewMode;

    /* ================= FETCH TEMPLATE (EDIT MODE ONLY) ================= */
    useEffect(() => {
        if (!templateId) return;

        const fetchTemplate = async () => {
            const res = await getTemplateById(templateId);

            if (res?.statusCode === 200) {
                const loadedFields: FormField[] = [];

                res.data.rows.forEach((row: any) => {
                    const rowId = uid(); // ONE rowId per backend row

                    row.fields
                        .sort((a: any, b: any) => a.fieldOrder - b.fieldOrder)
                        .forEach((f: any) => {
                            loadedFields.push({
                                ...f,
                                rowId, // SAME rowId for all fields in this row
                                hasUserEdited: true, // Mark loaded fields as already edited/saved
                                isNewlyDropped: false, // Not newly dropped
                            });
                        });
                });

                setFields(loadedFields);
                initialFieldsRef.current = loadedFields; // store initial state
            }
        };

        fetchTemplate();
    }, [templateId]);


    /* ================= TRACK CHANGES ================= */
    useEffect(() => {
        if (!isEditMode) return;

        const hasChanges =
            fields.length !== initialFieldsRef.current.length ||
            fields.some((f, i) => {
                const initial = initialFieldsRef.current[i];
                return !initial ||
                    f.label !== initial.label ||
                    f.type !== initial.type ||
                    f.placeholder !== initial.placeholder ||
                    JSON.stringify(f.options) !== JSON.stringify(initial.options);
            });

        onFieldsChange?.(hasChanges);
    }, [fields, isEditMode, onFieldsChange]);

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
            allowedFileTypes: type === "file" ? [".pdf", ".jpg", ".png"] : undefined,
            rowId: targetRowId || uid(),
            hasUserEdited: false,
            isNewlyDropped: true, // Mark as newly dropped - not yet saved via edit modal
        };

        setFields((prev) => [...prev, newField]);
    };

    /* ================= UPDATE / REMOVE FIELD ================= */
    const updateField = (id: string, data: Partial<FormField>) => {
        setFields(prev => prev.map(f => (f.id === id ? { ...f, ...data, isNewlyDropped: false } : f)));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const addField = (newField: FormField) => {
        setFields(prev => [...prev, newField]);
    };

    /* ================= DRAG START - FIELD ================= */
    const onDragStart = (fieldId: string) => {
        if (isViewMode) return;
        draggedFieldId.current = fieldId;
        draggedRowId.current = null;
        setIsDragging(true);
    };

    /* ================= DRAG START - ROW ================= */
    const onRowDragStart = (e: React.DragEvent, rowId: string) => {
        if (isViewMode) return;
        e.stopPropagation();
        draggedRowId.current = rowId;
        draggedFieldId.current = null;
        setIsDragging(true);
    };

    /* ================= ROW REORDERING LOGIC ================= */
    const reorderRows = (draggedRow: string, targetRowId: string, position: 'before' | 'after') => {
        if (isViewMode) return;
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
        if (isViewMode) return;
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
        if (isViewMode) return;
        e.preventDefault();
        e.stopPropagation();

        const draggedId = draggedFieldId.current;

        // Handle row drag drops
        if (draggedRowId.current) {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
            onDropRow(e, targetRowId, position);
            return;
        }

        // Case 1: New field from sidebar
        if (!draggedId) {
            const type = e.dataTransfer.getData("type") as FieldType;
            const label = e.dataTransfer.getData("label");
            if (type && label) {
                const rowFields = fields.filter(f => (f.rowId || '') === targetRowId);
                if (rowFields.length >= 4) {
                    // Full row → create new row
                    onDropNewField(e, uid());
                } else {
                    // Row has space → drop here
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
            let targetRowFields = prev.filter(f => (f.rowId || '') === targetRowId);

            // Allow dropping into empty row (targetRowFields.length === 0)
            if (targetRowFields.length >= 4 && sourceRowId !== targetRowId) {
                return prev; // full row, cannot drop
            }

            // Update the rowId of the dragged field
            let updatedFields = prev.map(f =>
                f.id === draggedId ? { ...f, rowId: targetRowId } : f
            );

            // Reorder within the target row if dropping on a specific field
            if (targetFieldId) {
                const otherRows = updatedFields.filter(f => (f.rowId || '') !== targetRowId);
                const row = updatedFields.filter(f => (f.rowId || '') === targetRowId);

                const draggedIndex = row.findIndex(f => f.id === draggedId);
                const targetIndex = row.findIndex(f => f.id === targetFieldId);

                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const [moved] = row.splice(draggedIndex, 1);
                    row.splice(targetIndex, 0, moved);
                }

                updatedFields = [...otherRows, ...row];
            }

            return updatedFields;
        });

        draggedFieldId.current = null;
        setIsDragging(false);
    };

    /* ================= DROP INTO EMPTY SPACE ================= */
    const onDropIntoEmptySpace = (e: React.DragEvent) => {
        if (isViewMode) return;
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
        if (isViewMode) return;
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

    const buildRowsPayload = () => {
        const rowMap = new Map<string, FormField[]>();
        const rowOrder: string[] = [];
        const seen = new Set<string>();

        fields.forEach((field) => {
            const rowId = field.rowId || "";

            if (!rowMap.has(rowId)) {
                rowMap.set(rowId, []);
            }
            rowMap.get(rowId)!.push(field);

            if (!seen.has(rowId)) {
                rowOrder.push(rowId);
                seen.add(rowId);
            }
        });

        return rowOrder.map((rowId, rowIndex) => ({
            // rowId,
            rowOrder: rowIndex + 1,
            fields: (rowMap.get(rowId) || []).map((field, fieldIndex) => ({
                // id: field.id,
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required,
                requiredErrorMessage: field.required
                    ? field.requiredErrorMessage || ""
                    : "",
                options: field.options,
                allowedFileTypes: field.allowedFileTypes,
                fieldOrder: fieldIndex + 1,
                className:
                    field.type === "primary_button"
                        ? "primary-button"
                        : field.type === "secondary_button"
                            ? "secondary-button"
                            : field.type === "header"
                                ? "header-label"
                                : "form-field",
            })),
        }));
    };

    /* ================= SAVE TEMPLATE ================= */
    const handleSaveTemplate = async () => {
        try {
            getLoaderControl()?.showLoader();

            if (fields.length === 0) {
                notification.error({
                    message: MESSAGES.ERRORS.PLEASE_ADD_AT_LEAST_ONE_FIELD_BEFORE_SAVING_THE_FORM,
                });
                getLoaderControl()?.hideLoader();
                return;
            }

            const headerField = fields.find(f => f.type === "header" && f.label?.trim());
            if (!headerField) {
                notification.error({ message: MESSAGES.ERRORS.FORM_NAME_REQUIRED });
                getLoaderControl()?.hideLoader();
                return;
            }

            const hasButton = fields.some(f => f.type === "primary_button" || f.type === "secondary_button");
            if (!hasButton) {
                notification.error({ message: MESSAGES.ERRORS.AT_LEAST_ONE_BUTTON_REQUIRED });
                getLoaderControl()?.hideLoader();
                return;
            }

            const payload = {
                templateName: headerField.label.trim(),
                rows: buildRowsPayload(),
            } as Parameters<typeof saveTemplate>[0];

            // Pass templateId when editing
            if (isEditMode && templateId) {
                payload.templateId = templateId;
            }

            console.log("Payload", payload);

            const res = await saveTemplate(payload);

            if (res?.statusCode === 200) {
                notification.success({
                    message: isEditMode
                        ? res.message || MESSAGES.SUCCESS.TEMPLATE_UPDATED_SUCCESSFULLY
                        : res.message || MESSAGES.SUCCESS.TEMPLATE_SAVED_SUCCESSFULLY,
                });

                navigate(-1);
            } else {
                notification.error({
                    message: isEditMode
                        ? res.message || MESSAGES.ERRORS.FAILED_TO_UPDATE_TEMPLATE
                        : res.message || MESSAGES.ERRORS.FAILED_TO_SAVE_TEMPLATE,
                });
            }
        } catch (error: any) {
            notification.error({
                message: error?.response?.data?.message || MESSAGES.ERRORS.SOMETHING_WENT_WRONG,
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
            <div className={`template-form-container ${isDragging ? 'dragging-active' : ""} ${isViewMode ? "view-mode" : ""}`} ref={containerRef}>
                <div
                    className="drop-zone"
                    onDragOver={(e) => !isViewMode && e.preventDefault()}
                    onDrop={(e) => !isViewMode && onDropIntoEmptySpace(e)}
                >
                    {fields.length === 0 && <p className="drop-placeholder">Drag & Drop fields here</p>}

                    {/* Drop zone at the very top */}
                    {/* {rowOrder.length > 0 && (
                        <div
                            className={`row-drop-zone ${dragOverRowId === 'top' ? 'drag-over' : ''}`}
                            onDragOver={(e) => {
                            if (isViewMode) return;
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
                    )} */}

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
                                    {!isViewMode && (
                                        <div
                                            className="row-drag-handle"
                                            draggable={!isViewMode}
                                            onDragStart={(e) => onRowDragStart(e, rowId)}
                                            onDragOver={(e) => {
                                                if (isViewMode) return;
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
                                    )}

                                    <div
                                        className="form-row"
                                        onDragOver={(e) => {
                                            if (isViewMode) return;
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
                                                        draggable={!isViewMode}
                                                        onDragStart={() => onDragStart(field.id)}
                                                        onDragOver={(e) => {
                                                            if (isViewMode) return;
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
                                                            if (isViewMode) return;
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
                                                                        {!isViewMode && (
                                                                            <>
                                                                                <img
                                                                                    src="/assets/edit.svg"
                                                                                    alt="edit"
                                                                                    onClick={(e) => {
                                                                                        if (isViewMode) return;
                                                                                        e.stopPropagation();
                                                                                        setActiveId(field.id);
                                                                                        setEditField(field);
                                                                                    }}
                                                                                />
                                                                                <img
                                                                                    src="/assets/trash.svg"
                                                                                    alt="delete"
                                                                                    onClick={(e) => {
                                                                                        if (isViewMode) return;
                                                                                        e.stopPropagation();
                                                                                        removeField(field.id);
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* ===== HORIZONTAL LINE ===== */}
                                                        {field.type === "horizontal_line" && (
                                                            <div className="hr-with-action">
                                                                <hr className="form-hr" />
                                                                {!isViewMode && (
                                                                    <img
                                                                        src="/assets/trash.svg"
                                                                        alt="delete"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeField(field.id);
                                                                        }}
                                                                    />
                                                                )}
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
                                                                {!isViewMode && (
                                                                    <div className="field-actions">
                                                                        <img
                                                                            src="/assets/edit.svg"
                                                                            alt="edit"
                                                                            onClick={(e) => {
                                                                                if (isViewMode) return;
                                                                                e.stopPropagation();
                                                                                setActiveId(field.id);
                                                                                setEditField(field);
                                                                            }}
                                                                        />
                                                                        <img
                                                                            src="/assets/trash.svg"
                                                                            alt="delete"
                                                                            onClick={(e) => {
                                                                                if (isViewMode) return;
                                                                                e.stopPropagation();
                                                                                removeField(field.id);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ===== FIELD PREVIEW ===== */}
                                                        {(() => {
                                                            switch (field.type) {
                                                                case "input":
                                                                    return <input readOnly placeholder={field.placeholder} />;
                                                                case "email":
                                                                    return <input readOnly type="email" placeholder={field.placeholder} />;
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
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {editField && !isViewMode && (
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

export default CreateEditTemplateForm;