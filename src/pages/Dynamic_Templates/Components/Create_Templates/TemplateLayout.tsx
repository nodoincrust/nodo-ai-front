import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateEditTemplateForm from "./CreateEditTemplateForm";
import SubmitTemplateForm from "./SubmitTemplateForm";

const TemplateLayout = () => {
    const [isDirty, setIsDirty] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isSubmitMode, setIsSubmitMode] = useState(false);
    const [breadcrumbText, setBreadcrumbText] = useState("Templates");
    const [formTitle, setFormTitle] = useState("");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode and breadcrumb based on URL path
    useEffect(() => {
        const path = location.pathname;
        const isView = path.includes("/view/");
        const isSubmit = path.includes("/submit/");

        setIsViewMode(isView);
        setIsSubmitMode(isSubmit);

        // Breadcrumb
        if (path.includes("/sharedworkspace/submit/")) {
            setBreadcrumbText("Shared Workspace");
        } else {
            setBreadcrumbText("Templates");
        }

        // Form title
        if (isSubmit) {
            setFormTitle(path.includes("/sharedworkspace/submit/") ? "Submit Form" : "Submit Form");
        } else if (isView) {
            setFormTitle("View Template");
        } else if (id) {
            setFormTitle("Edit Template");
        } else {
            setFormTitle("Create Template");
        }
    }, [location.pathname, id]);

    const isEditMode = !!id && !isViewMode && !isSubmitMode;

    // Render submit mode (fillable form)
    if (isSubmitMode) {
        return (
            <div className="template-page">
                <div className="template-wrapper">
                    {/* Header */}
                    <div className="create-template-header">
                        <div className="back-button" onClick={() => navigate(-1)}>
                            <img src="/assets/chevron-left.svg" alt="Back" />
                        </div>

                        <div className="breadcrumb" onClick={() => navigate(-1)}>
                            <span>{breadcrumbText}</span>
                            <img src="/assets/chevron-left.svg" alt="arrow" />
                        </div>

                        <h5 className="form-title">{formTitle}</h5>
                    </div>

                    {/* Main Content - Submit Form */}
                    <div className="template-main-content">
                        <section className="create-template-form">
                            <SubmitTemplateForm />
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
                        <span>{breadcrumbText}</span>
                        <img src="/assets/chevron-left.svg" alt="arrow" />
                    </div>

                    <h5 className="form-title">{formTitle}</h5>
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
                            {isEditMode ? "Update Template" : "Create Template"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateLayout;