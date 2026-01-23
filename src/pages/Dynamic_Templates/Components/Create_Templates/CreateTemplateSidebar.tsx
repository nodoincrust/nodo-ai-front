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
    { type: "horizontal_line", label: "Horizontal Line" },
    { type: "secondary_button", label: "Secondary Button" },
    { type: "primary_button", label: "Primary Button" },
    { type: "file", label: "File Upload" },
];

const CreateTemplateSidebar = () => {
    const onDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        item: typeof COMPONENTS[number]
    ) => {
        e.dataTransfer.setData("type", item.type);
        e.dataTransfer.setData("label", item.label);
    };

    return (
        <div className="sidebar-panel">
            {COMPONENTS.map((item) => (
                <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="sidebar-item"
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
};

export default CreateTemplateSidebar;