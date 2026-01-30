import React, { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= TYPES ================= */

type FieldType = "input" | "textarea" | "select";

interface Field {
    id: string;
    type: FieldType;
    label: string;
    rowId: string;
}

/* ================= UTILS ================= */

const uid = () => crypto.randomUUID();

const getSpan = (count: number) =>
    count === 1 ? 12 : count === 2 ? 6 : count === 3 ? 4 : 3;

/* ================= SORTABLE FIELD ================= */

const SortableField: React.FC<{ field: Field }> = ({ field }) => {
    const { setNodeRef, attributes, listeners, transform, transition } =
        useSortable({ id: field.id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className="form-field"
        >
            <label>{field.label}</label>
            <input placeholder={`Enter ${field.label}`} readOnly />
        </div>
    );
};

/* ================= FORM BUILDER ================= */

export default function FormBuilder() {
    const [fields, setFields] = useState<Field[]>([]);

    /* ===== Group fields by rowId ===== */
    const rows = Array.from(
        fields.reduce<Map<string, Field[]>>((map, field) => {
            const row = map.get(field.rowId) || [];
            map.set(field.rowId, [...row, field]);
            return map;
        }, new Map())
    );

    /* ===== Drag end ===== */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setFields((prev) => {
            const oldIndex = prev.findIndex((f) => f.id === active.id);
            const newIndex = prev.findIndex((f) => f.id === over.id);

            const updated = [...prev];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);

            return updated;
        });
    };

    /* ===== Add field ===== */
    const addField = () => {
        const rowId = uid();
        setFields((prev) => [
            ...prev,
            {
                id: uid(),
                type: "input",
                label: "Text Input",
                rowId,
            },
        ]);
    };

    return (
        <div style={{ padding: 24 }}>
            <button onClick={addField}>Add Field</button>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {rows.map(([rowId, rowFields]) => {
                    const span = getSpan(rowFields.length);

                    return (
                        <SortableContext
                            key={rowId}
                            items={rowFields.map((f) => f.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="form-row">
                                {rowFields.map((field) => (
                                    <div key={field.id} className={`col span-${span}`}>
                                        <SortableField field={field} />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    );
                })}
            </DndContext>

            {/* ===== BASIC STYLES ===== */}
            <style>{`
        .form-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .col {
          flex: 1;
        }
        .span-12 { flex: 0 0 100%; }
        .span-6 { flex: 0 0 50%; }
        .span-4 { flex: 0 0 33.33%; }
        .span-3 { flex: 0 0 25%; }

        .form-field {
          border: 1px dashed #aaa;
          padding: 12px;
          background: #fff;
          cursor: grab;
        }
        .form-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
        }
      `}</style>
        </div>
    );
}
