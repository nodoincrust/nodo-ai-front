import React from "react";
import { Breadcrumb, Select, Tag } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import "./DocumentHeader.scss";
import type {
  DocumentHeaderProps,
  DocumentStatus,
  DocumentHeaderAction,
} from "../../types/common";

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
    <div className="document-header">
      <div className="document-header-left">
        {/* Logo + App Name */}
        <div className="document-header-brand">
          <img src="/assets/Main-Logo.svg" alt="Nodo AI" className="app-logo" />
          <span className="app-name">Nodo AI</span>
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
              size="small"
              className="version-dropdown"
            />
          </div>
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
    </div>
  );
};

export default DocumentHeader;
