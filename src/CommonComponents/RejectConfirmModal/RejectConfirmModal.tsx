import React, { useState } from "react";
import { Modal, Input } from "antd";
import "./Styles/RejectConfirmModal.scss";
import { ConfirmModalProps } from "../../types/common";

interface RejectConfirmModalProps extends Omit<ConfirmModalProps, "onConfirm"> {
    onConfirm: (reason: string) => void;
}

const RejectConfirmModal: React.FC<RejectConfirmModalProps> = ({
    open,
    onCancel,
    onConfirm,
    title,
    description,
    confirmText = "Reject",
    cancelText = "Cancel",
    icon,
    confirmType = "danger",
}) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Rejection reason is required");
            return;
        }
        setError("");
        onConfirm(reason.trim());
        setReason("");
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            closable={false}
            rootClassName="reject-confirm-modal-root"
            width={353}
            zIndex={2000}
            getContainer={false}
        >
            <div className="confirm-modal-content">
                {/* Icon */}
                {/* {icon && (
                    <div className="confirm-icon">
                        <img src={icon} alt={`${title} Icon`} className="confirm-icon-img" />
                    </div>
                )} */}

                <div className="confirm-bottom">
                    <div className="confirm-text">
                        <h2 className="confirm-title">{title}</h2>
                        {/* <p className="confirm-description">{description}</p> */}
                    </div>

                    {/* Reason Field */}
                    <div className="confirm-form">
                        <label className="confirm-label">
                            Rejection Reason <span className="required">*</span>
                        </label>

                        <Input.TextArea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError("");
                            }}
                            rows={3}
                            placeholder="Enter reason for rejection"
                            className={`confirm-textarea ${error ? "error" : ""}`}
                        />

                        {error && <span className="confirm-error">{error}</span>}
                    </div>

                    <div className="confirm-actions">
                        <button className="confirm-btn secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button
                            className={`confirm-btn ${confirmType}`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default RejectConfirmModal;
