import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateEditTemplateForm from "./CreateEditTemplateForm";
import FillTemplateForm from "./SubmitTemplateForm";

const TemplateLayout = () => {
    const [isDirty, setIsDirty] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isSubmitMode, setIsSubmitMode] = useState(false);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode based on URL path
    useEffect(() => {
        const isView = location.pathname.includes("/view/");
        const isSubmit = location.pathname.includes("/submit/");

        setIsViewMode(isView);
        setIsSubmitMode(isSubmit);
    }, [location.pathname]);

    const isEditMode = !!id && !isViewMode && !isSubmitMode;

    // Render submit mode (fillable form)
    if (isSubmitMode) {
        return (
            <div className="template-page">
                <div className="template-wrapper">
                    {/* Header */}
                    <div className="create-template-header">
                        <div className="back-button" onClick={() => navigate("/templates")}>
                            <img src="/assets/chevron-left.svg" alt="Back" />
                        </div>

                        <div className="breadcrumb" onClick={() => navigate("/templates")}>
                            <span>Templates</span>
                            <img src="/assets/chevron-left.svg" alt="arrow" />
                        </div>

                        <h5 className="form-title">Submit Form</h5>
                    </div>

                    {/* Main Content - Submit Form */}
                    <div className="template-main-content">
                        <section className="create-template-form">
                            <FillTemplateForm />
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    // Render create/edit/view modes
    return (
        <div className="template-page">
            <div className="template-wrapper">
                {/* Header */}
                <div className="create-template-header">
                    <div className="back-button" onClick={() => navigate("/templates")}>
                        <img src="/assets/chevron-left.svg" alt="Back" />
                    </div>

                    <div className="breadcrumb" onClick={() => navigate("/templates")}>
                        <span>Templates</span>
                        <img src="/assets/chevron-left.svg" alt="arrow" />
                    </div>

                    <h5 className="form-title">
                        {isViewMode ? "View Template" : isEditMode ? "Edit Template" : "Create Template"}
                    </h5>
                </div>

                {/* Main Content */}
                <div className="template-main-content">
                    {/* Sidebar - Hidden in view mode */}
                    {!isViewMode && (
                        <aside className="create-template-sidebar">
                            <CreateTemplateSidebar />
                        </aside>
                    )}

                    {/* Form Area */}
                    <section className="create-template-form">
                        <CreateEditTemplateForm
                            templateId={id}
                            isViewMode={isViewMode}
                            onFieldsChange={(changed) => setIsDirty(changed)}
                        />
                    </section>
                </div>

                {/* Footer - Hidden in view mode */}
                {!isViewMode && (
                    <div className="create-template-footer">
                        <button className="secondary-button" onClick={() => navigate("/templates")}>
                            Cancel
                        </button>
                        <button
                            className="primary-button"
                            onClick={() => (window as any).__saveTemplate?.()}
                            disabled={isEditMode && !isDirty}
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