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
  IN_REVIEW: "In review",
};

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  breadcrumb,
  fileName,
  status,
  onBackClick,
  versionOptions,
  selectedVersion,
  onVersionChange,
  onSubmit,
  extraActions = [],
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAction, setRejectAction] = useState<(() => void) | null>(null);

  const renderStatus = () => {
    if (!status) return null;
    const label = statusLabelMap[status] ?? status;

    return (
      <Tag className={`doc-header-status doc-header-status--${status.toLowerCase()}`}>
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

        <div className="document-header-right">
          {versionOptions && versionOptions.length > 0 && (
            <Select
              value={selectedVersion}
              onChange={onVersionChange}
              options={versionOptions}
              className="version-dropdown"
            />
          )}

          {onSubmit && (
            <PrimaryButton
              text="Submit"
              onClick={onSubmit}
              className="document-header-submit-btn"
            />
          )}

          {extraActions.length > 0 && (
            <div className="language-header-top">
              {extraActions
                .filter(a => a.label === "Approve" || a.label === "Reject")
                .map(a => (
                  <PrimaryButton
                    key={a.label}
                    text={a.label}
                    className={`document-header-action-btn ${a.label.toLowerCase()}-btn`}
                    onClick={() => {
                      if (a.label === "Reject") {
                        setRejectAction(() => a.onClick);
                        setShowRejectModal(true);
                      } else {
                        a.onClick();
                      }
                    }}
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