import React from "react";
import "../Styles/CreateTemplate.scss";
import CreateTemplateSidebar from "./CreateTemplateSidebar";
import CreateTemplateForm from "./CreateTemplateForm";
import { useNavigate } from "react-router-dom";
import SecondaryButton from "../../../../CommonComponents/Buttons/SecondaryButton";
import PrimaryButton from "../../../../CommonComponents/Buttons/PrimaryButton";

const CreateTemplate = () => {
    const navigate = useNavigate();

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
                    <SecondaryButton
                        text="Cancel"
                        onClick={() => navigate(-1)}
                    />
                    <PrimaryButton
                        text="Save Template"
                        onClick={() => {
                            // save handler will go here later
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateTemplate;