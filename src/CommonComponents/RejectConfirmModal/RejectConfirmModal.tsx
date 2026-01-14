import React, { useState, useRef, useEffect } from "react";
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
    confirmText = "Reject",
    cancelText = "Cancel",
    confirmType = "danger",
}) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(open);
    const [animateClose, setAnimateClose] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    /* SAME open / close handling */
    useEffect(() => {
        if (open) {
            setShowModal(true);
            setAnimateClose(false);
        } else {
            setAnimateClose(true);
            setTimeout(() => setShowModal(false), 300);
        }
    }, [open]);

    const handleClose = () => {
        setAnimateClose(true);
        setTimeout(() => onCancel(), 300);
    };

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Rejection reason is required");
            return;
        }
        setError("");
        onConfirm(reason.trim());
        setReason("");
    };

    if (!showModal) return null;

    return (
        <Modal
            open={showModal}
            footer={null}
            centered
            closable={false}
            width={412}
            zIndex={2000}
            getContainer={false}
            transitionName=""
            className={`reject-confirm-modal ${animateClose ? "modal-exit" : "modal-enter"}`}
        >
            <div className="reject-wrapper" ref={modalRef}>
                {/* HEADER */}
                <div className="reject-header">
                    <h2>{title}</h2>
                    <div className="close-icon" onClick={handleClose}>
                        <img src="/assets/x-02.svg" alt="close" />
                    </div>
                </div>

                {/* BODY */}
                <div className="reject-body">
                    <div className="confirm-form">
                        <label className="confirm-label">
                            Rejection Reason<span className="required">*</span>
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
                </div>

                {/* FOOTER */}
                <div className="reject-footer">
                    <button className="confirm-btn secondary" onClick={handleClose}>
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
        </Modal>
    );
};

export default RejectConfirmModal;