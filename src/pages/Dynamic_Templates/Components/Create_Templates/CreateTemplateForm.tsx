import React, { useState } from "react";

interface DroppedItem {
    type: string;
    label: string;
}

const CreateTemplateForm = () => {
    const [fields, setFields] = useState<DroppedItem[]>([]);

    const allowDrop = (e: any) => e.preventDefault();

    const onDrop = (e: any) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("type");
        const label = e.dataTransfer.getData("label");

        setFields((prev) => [...prev, { type, label }]);
    };

    const renderField = (field: DroppedItem, index: number) => {
        switch (field.type) {
            case "label":
                return <label key={index}>{field.label}</label>;

            case "input":
            case "search-input":
                return <input key={index} type="text" placeholder={field.label} />;

            case "email-input":
                return <input key={index} type="email" placeholder={field.label} />;

            case "password-input":
                return <input key={index} type="password" placeholder={field.label} />;

            case "number-input":
            case "counter":
                return <input key={index} type="number" placeholder={field.label} />;

            case "phone-input":
                return <input key={index} type="tel" placeholder={field.label} />;

            case "textarea":
                return <textarea key={index} placeholder={field.label} />;

            case "select":
            case "dropdown":
            case "country-select":
            case "state-select":
            case "combobox":
            case "autocomplete":
                return (
                    <select key={index}>
                        <option value="">{field.label}</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                    </select>
                );

            case "multi-select":
                return (
                    <select key={index} multiple>
                        <option>Option 1</option>
                        <option>Option 2</option>
                    </select>
                );

            case "checkbox":
                return (
                    <label key={index}>
                        <input type="checkbox" /> {field.label}
                    </label>
                );

            case "radio":
                return (
                    <div key={index}>
                        <label><input type="radio" name={`r-${index}`} /> Option 1</label>
                        <label><input type="radio" name={`r-${index}`} /> Option 2</label>
                    </div>
                );

            case "switch":
            case "toggle":
                return (
                    <label key={index} className="switch">
                        <input type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                );

            case "date-picker":
                return <input key={index} type="date" />;

            case "time-picker":
                return <input key={index} type="time" />;

            case "datetime-picker":
                return <input key={index} type="datetime-local" />;

            case "month-picker":
                return <input key={index} type="month" />;

            case "year-picker":
                return <input key={index} type="number" placeholder="YYYY" />;

            case "range-picker":
            case "slider":
                return <input key={index} type="range" min={0} max={100} />;

            case "rating":
                return (
                    <div key={index} className="rating">
                        {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                    </div>
                );

            case "tags-input":
            case "chips":
                return <input key={index} type="text" placeholder="Enter tags" />;

            case "file-upload":
            case "document-upload":
                return <input key={index} type="file" />;

            case "image-upload":
                return <input key={index} type="file" accept="image/*" />;

            case "file-dropzone":
                return (
                    <div key={index} style={{ border: "2px dashed #ccc", padding: 20 }}>
                        Drag & Drop Files
                    </div>
                );

            case "button":
            case "submit":
            case "reset":
            case "icon-button":
                return <button key={index}>{field.label}</button>;

            case "tooltip":
            case "helper-text":
            case "error-message":
            case "info-icon":
                return <small key={index}>{field.label}</small>;

            case "divider":
                return <hr key={index} />;

            case "fieldset":
                return <fieldset key={index}><legend>{field.label}</legend></fieldset>;

            case "legend":
                return <legend key={index}>{field.label}</legend>;

            case "form":
                return <form key={index}></form>;

            default:
                return null;
        }
    };

    return (
        <div className="template-form-container">
            <div className="drop-zone" onDragOver={allowDrop} onDrop={onDrop}>
                {fields.length === 0 && <p className="drop-placeholder">Drag fields here</p>}

                {fields.map((field, i) => (
                    <div className="form-field" key={i}>
                        {renderField(field, i)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreateTemplateForm;