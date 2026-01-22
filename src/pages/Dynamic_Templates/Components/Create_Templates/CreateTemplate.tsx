import React from "react";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateTemplateForm from "./CreateTemplateForm";

const CreateTemplate = () => {
    return (
        <div className="template-page">
            <div className="template-wrapper">
                <div className="create-template-header">
                    <h5 className="form-title">Create Template</h5>
                </div>

                <div className="template-main-content">
                    <aside className="create-template-sidebar">
                        <CreateTemplateSidebar />
                    </aside>

                    <section className="create-template-form">
                        <CreateTemplateForm />
                    </section>
                </div>

                <div className="create-template-footer">
                    <button className="secondary-button">Cancel</button>
                    <button className="primary-button" onClick={() => (window as any).__saveTemplate?.()}>Save Template</button>
                </div>
            </div>
        </div>
    );
};

export default CreateTemplate;