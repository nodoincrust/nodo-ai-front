import React from "react";
import { templateComponents } from "./templateComponents";

const CreateTemplateSidebar = () => {
    const onDragStart = (e: any, component: any) => {
        e.dataTransfer.setData("type", component.elementType);
        e.dataTransfer.setData("label", component.label);
    };

    return (
        <div className="sidebar-panel">
            {templateComponents.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className="sidebar-item"
                >
                    <img src={item.icon} alt="" />
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default CreateTemplateSidebar;