import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateTemplateForm from "./CreateTemplateForm";
import EditTemplateForm from "./EditTemplateForm";

const CreateTemplate = () => {
    const { id } = useParams<{ id: string }>();
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        console.log("Id",id);
        
        setIsEditMode(!!id);
    }, [id]);

    return (
        <div className="template-page">
            <div className="template-wrapper">
                {/* Header */}
                <div className="create-template-header">
                    <h5 className="form-title">{isEditMode ? "Edit Template" : "Create Template"}</h5>
                </div>

                {/* Main Content */}
                <div className="template-main-content">
                    {/* Sidebar */}
                    <aside className="create-template-sidebar">
                        <CreateTemplateSidebar />
                    </aside>

                    {/* Form Section */}
                    <section className="create-template-form">
                        {isEditMode ? <EditTemplateForm /> : <CreateTemplateForm />}
                    </section>
                </div>

                {/* Footer */}
                <div className="create-template-footer">
                    <button className="secondary-button">Cancel</button>
                    <button className="primary-button" onClick={() => (window as any).__saveTemplate?.()}>
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTemplate;
