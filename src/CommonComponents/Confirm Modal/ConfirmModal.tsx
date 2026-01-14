import React from "react";
import { Modal } from "antd";
import "./styles/ConfirmModal.scss";
import { ConfirmModalProps } from "../../types/common";

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    onCancel,
    onConfirm,
    title,
    description,
    confirmText,
    cancelText = "Cancel",
    icon,
    confirmType = "danger",
    confirmBtnClassName,
}) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            closable={false}
            rootClassName="confirm-modal-root"
            width={353}
            zIndex={2000}
            getContainer={false}
        >
            <div className="confirm-modal-content">
                {/* Icon */}
                {icon && (
                    <div className="confirm-icon">
                        <img src={icon} alt={`${title} Icon`} className="confirm-icon-img" />
                    </div>
                )}

                <div className="confirm-bottom">
                    <div className="confirm-text">
                        <h2 className="confirm-title">{title}</h2>
                        <p className="confirm-description">{description}</p>
                    </div>

                    <div className="confirm-actions">
                        <button className="confirm-btn secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button
                            className={`confirm-btn ${confirmType} ${confirmBtnClassName || ""}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;