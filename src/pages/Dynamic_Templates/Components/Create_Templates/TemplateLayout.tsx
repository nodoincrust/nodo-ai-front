import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateTemplateForm from "./CreateEditTemplateForm";
import EditTemplateForm from "./EditTemplateForm";
import CreateEditTemplateForm from "./CreateEditTemplateForm";

const TemplateLayout = () => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        setIsEditMode(!!id);
    }, [id]);

    useEffect(() => {
        if (id && location.pathname.includes("/view/")) {
            setIsViewMode(true);
        }
        setIsEditMode(!!id && !isViewMode);
    }, [id, location.pathname]);

    return (
        <div className="template-page">
            <div className="template-wrapper">
                {/* Header */}
                <div className="create-template-header">
                    <div className="back-button" onClick={() => navigate(-1)}>
                        <img src="/assets/chevron-left.svg" alt="Back" />
                    </div>

                    <div className="breadcrumb" onClick={() => navigate(-1)}>
                        <span>Templates</span>
                        <img src="/assets/chevron-left.svg" alt="arrow" />
                    </div>

                    <h5 className="form-title">{isViewMode ? "View Template" : isEditMode ? "Edit Template" : "Create Template"}</h5>
                </div>

                {/* Main Content */}
                <div className="template-main-content">
                    {!isViewMode && (
                        <aside className="create-template-sidebar">
                            <CreateTemplateSidebar />
                        </aside>
                    )}

                    <section className="create-template-form">
                        <CreateEditTemplateForm templateId={id} isViewMode={isViewMode} onFieldsChange={(changed) => setIsDirty(changed)} />
                    </section>
                </div>

                {/* Footer */}
                {!isViewMode && (
                    <div className="create-template-footer">
                        <button className="secondary-button" onClick={() => navigate(-1)}>Cancel</button>
                        <button
                            className="primary-button"
                            onClick={() => (window as any).__saveTemplate?.()}
                            disabled={isEditMode && !isDirty} // DISABLED in edit mode if no changes
                        >
                            Save Template
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default TemplateLayout;
