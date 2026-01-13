import React, { useState } from "react";
import { Breadcrumb, Select, Tag ,Popover } from "antd";
import PrimaryButton from "../Buttons/PrimaryButton";
import ConfirmModal from "../Confirm Modal/ConfirmModal";
import "./DocumentHeader.scss";
import type { DocumentHeaderProps } from "../../types/common";
import RejectConfirmModal from "../RejectConfirmModal/RejectConfirmModal";

const statusLabelMap: any = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  AWAITING_APPROVAL: "Awaiting Approval",
};

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  breadcrumb,
  fileName,
  status,
  rejectionRemark,
  displayStatus,
  onBackClick,
  versionOptions,
  selectedVersion,
  onVersionChange,
  onSubmit,
  submitDisabled,
  extraActions = [],
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAction, setRejectAction] = useState<(() => void) | null>(null);

const renderStatus = () => {
  const statusToDisplay = displayStatus || status;
  if (!statusToDisplay) return null;

  const label =
    displayStatus || (status ? statusLabelMap[status] ?? status : "");

  const statusTag = (
    <Tag
      className={`doc-header-status doc-header-status--${
        status?.toLowerCase() || "draft"
      }`}
    >
      <span className="dot" />
      {label}
    </Tag>
  );

  // ✅ Show popover ONLY when rejected & remark exists
  if (status === "REJECTED" && rejectionRemark) {
    return (
      <Popover
        content={
          <div className="rejection-popover">
            <strong>Rejection Remark</strong>
            <p>{rejectionRemark}</p>
          </div>
        }
        placement="bottom"
        trigger="hover"
      >
        {statusTag}
      </Popover>
    );
  }

  return statusTag;
};


  return (
    <>
      <div className="document-header">
        <div className="document-header-left">
          <div className="document-header-brand">
            <img
              src="/assets/Main-Logo.svg"
              alt="Nodo AI"
              className="app-logo"
            />
            <span className="app-name">Nodo AI</span>
          </div>

          <span className="header-separator">|</span>

          <div className="document-header-breadcrumb">
            {onBackClick && (
              <button className="back-button" onClick={onBackClick}>
                <img src="/assets/chevron-left.svg" alt="" />
              </button>
            )}

            <Breadcrumb separator="/" className="doc">
              <Breadcrumb.Item onClick={onBackClick}>Documents</Breadcrumb.Item>
              <Breadcrumb.Item className="filename">{fileName}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {renderStatus()}
        </div>

        <div className="document-header-right">
          {/* Version selector (when options are provided) */}
          {versionOptions && versionOptions.length > 0 && (
            <div className="document-header-version-select">
              <Select
                value={selectedVersion}
                onChange={onVersionChange}
                options={versionOptions}
                className="version-select"
              />
            </div>
          )}

          {/* Notification bell button */}
          {/* <button className="notification-bell-btn" title="Notifications">
            <img src="/assets/Notifications.svg" alt="Notifications" />
          </button> */}

          {/* Submit button (when onSubmit is provided) */}
          {onSubmit && (
            <PrimaryButton
              text="Submit"
              onClick={onSubmit}
              disabled={submitDisabled}
              className="document-header-submit-btn"
            />
          )}
          
          {/* Approve + Reject buttons */}
          {extraActions?.length > 0 && (
            <div className="language-header-top">
              {extraActions.map((action) => (
                <PrimaryButton
                  key={action.label}
                  text={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`document-header-action-btn ${action.label
                    .toLowerCase()
                    .replace(" ", "-")}-btn`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REJECT CONFIRM MODAL */}
      <RejectConfirmModal
        open={showRejectModal}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={() => {
          rejectAction?.();
          setShowRejectModal(false);
        }}
        title="Reject this document?"
        description="Are you sure you want to reject this document?"
        confirmText="Reject"
        icon="/assets/reject.svg"
      />
    </>
  );
};

export default DocumentHeader;
