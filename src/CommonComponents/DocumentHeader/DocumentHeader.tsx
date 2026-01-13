import React, { useState } from "react";
import { Breadcrumb, Select, Tag } from "antd";
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
    // Use displayStatus if available, otherwise fall back to status
    const statusToDisplay = displayStatus || status;

    if (!statusToDisplay) {
      return null;
    }

    // If displayStatus is provided, use it directly; otherwise use statusLabelMap
    const label =
      displayStatus || (status ? statusLabelMap[status] ?? status : "");

    return (
      <Tag
        className={`doc-header-status doc-header-status--${
          status?.toLowerCase() || "draft"
        }`}
      >
        <span className="dot" />
        {label}
      </Tag>
    );
  };

  return (
      <>
      <div className="document-header">
        <div className="document-header-left">
          <div className="document-header-brand">
            <img src="/assets/Main-Logo.svg" alt="Nodo AI" className="app-logo" />
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

        {/* Separator */}
        <span className="header-separator">|</span>

        {/* Back + Breadcrumb */}
        <div className="document-header-breadcrumb">
          {onBackClick && (
            <button className="back-button" onClick={onBackClick}>
              <img src="/assets/chevron-left.svg" alt="" />
            </button>
          )}

          <Breadcrumb
            className="doc"
            separator={
              <img
                src="/assets/separtor.svg"
                alt="separator"
                style={{
                  width: 16,
                  height: 16,
                  margin: "0 6px",
                  verticalAlign: "middle",
                }}
              />
            }
          >
            <Breadcrumb.Item className="doc">Documents</Breadcrumb.Item>
            <Breadcrumb.Item className="filename">{fileName}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* Status */}
        {renderStatus()}
      </div>

      <div className="document-header-right">
        {versionOptions && versionOptions.length > 0 && (
          <div className="version-select">
            <Select
              value={selectedVersion}
              onChange={onVersionChange}
              options={versionOptions}
              className="version-dropdown"
            />
          )}

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