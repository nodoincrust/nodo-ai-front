import React from "react";
import { FieldType } from "../../../../types/common";

const COMPONENTS: { type: FieldType; label: string }[] = [
    { type: "header", label: "Header / Template Name" },
    { type: "input", label: "Text Input" },
    { type: "textarea", label: "Textarea" },
    { type: "select", label: "Dropdown" },
    { type: "checkbox", label: "Checkbox" },
    { type: "radio", label: "Radio" },
    { type: "switch", label: "Switch" },
    { type: "date", label: "Date" },
    { type: "number", label: "Number" },
    { type: "email", label: "Email" },
    { type: "horizontal_line", label: "Horizontal Line" },
    { type: "secondary_button", label: "Secondary Button" },
    { type: "primary_button", label: "Primary Button" },
    { type: "file", label: "File Upload" },
];

interface CreateTemplateSidebarProps {
    isViewMode?: boolean;
}

const CreateTemplateSidebar: React.FC<CreateTemplateSidebarProps> = ({ isViewMode }) => {
    const onDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        item: typeof COMPONENTS[number]
    ) => {
        if (isViewMode) return;

        e.dataTransfer.setData("type", item.type);
        e.dataTransfer.setData("label", item.label);
    };

    return (
        <div className={`sidebar-panel ${isViewMode ? "view-mode" : ""}`}>
            {COMPONENTS.map((item) => (
                <div
                    key={item.type}
                    {...(!isViewMode && { draggable: true })}
                    onDragStart={(e) => onDragStart(e, item)}
                    className={`sidebar-item ${isViewMode ? "view-mode" : ""}`}
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default CreateTemplateSidebar;