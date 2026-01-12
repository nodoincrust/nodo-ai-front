import React from "react";
import { Breadcrumb, Select, Tag } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import "./DocumentHeader.scss";
import type { DocumentHeaderProps, DocumentStatus } from "../../types/common";

const statusLabelMap: Record<DocumentStatus, string> = {
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
  const renderStatus = () => {
    if (!status) return null;

    const label = statusLabelMap[status] ?? status;

    return (
      <Tag
        className={`doc-header-status doc-header-status--${status.toLowerCase()}`}
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

          <Breadcrumb separator="/" className="doc">
            <Breadcrumb.Item className="doc" onClick={onBackClick}>Documents</Breadcrumb.Item>
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

        {onSubmit && (
          <PrimaryButton
            text="Submit"
            onClick={onSubmit}
            className="document-header-submit-btn"
          />
        )}
        {/* Approve + Reject buttons */}
        <div className="language-header-top">
          {/* Approve button */}
          <PrimaryButton
            text="Approve"
            onClick={extraActions.find(a => a.label === "Approve")?.onClick}
            className="document-header-action-btn approve-btn"
          />

          {/* Reject button */}
          <PrimaryButton
            text="Reject"
            onClick={extraActions.find(a => a.label === "Reject")?.onClick}
            className="document-header-action-btn reject-btn"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
