import React, { useState } from "react";
import { DoubleLeftOutlined, DoubleRightOutlined, CopyOutlined, EditOutlined, ReloadOutlined, FolderOutlined } from "@ant-design/icons";
import { notification } from "antd";
import "./SummarySidebar.scss";

interface SummarySidebarProps {
  title?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SummarySidebar: React.FC<SummarySidebarProps> = ({
  title = "Summary",
  isOpen = true,
  onToggle,
}) => {
  const [summary, setSummary] = useState(
    "Review AI-generated metadata This document outlines the Q3 financial performance, highlighting a 15% increase in recurring revenue driven by enterprise adoption. Key risks identified include market volatility in the APAC region and supply chain disruptions affecting hardware delivery timelines."
  );

  const [tags] = useState<string[]>([
    "Financials",
    "Q3 2023",
    "Confidential",
    "Sales",
  ]);

  const [newTag, setNewTag] = useState("");
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    notification.success({
      message: "Summary copied to clipboard",
      duration: 2,
    });
  };

  const handleEditSummary = () => {
    setIsEditingSummary(true);
  };

  const handleRegenerate = () => {
    // TODO: Implement regenerate functionality
    notification.info({ message: "Regenerating summary..." });
  };

  const handleWriteOwnSummary = () => {
    setIsEditingSummary(true);
    setSummary("");
  };

  const handleAddTag = (tag: string) => {
    // TODO: Add tag functionality
    notification.info({ message: `Tag "${tag}" added` });
  };

  const handleCreateTag = () => {
    if (newTag.trim()) {
      // TODO: Add new tag
      setNewTag("");
      notification.success({ message: `Tag "${newTag}" created` });
    }
  };

  const handleSaveMetadata = () => {
    // TODO: Implement save metadata functionality
    notification.success({ message: "Metadata saved successfully" });
  };

  return (
    <aside className={`summary-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="summary-header">
        <div className="summary-header-top">
          <h3 className="summary-title">{title}</h3>
          {onToggle && (
            <button
              type="button"
              className="summary-toggle-btn"
              onClick={onToggle}
              title={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="summary-body">
            {/* AI Generated Section */}
            <div className="summary-ai-section">
              <div className="summary-ai-header">
                <div className="summary-ai-badge">
                  <span className="summary-ai-sparkle">✨</span>
                  <span className="summary-ai-label">AI Generated</span>
                </div>
                <button
                  type="button"
                  className="summary-copy-btn"
                  onClick={handleCopySummary}
                  title="Copy summary"
                >
                  <CopyOutlined />
                </button>
              </div>
              
              <div className="summary-text-box">
                {isEditingSummary ? (
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="summary-textarea"
                    placeholder="Enter your summary..."
                  />
                ) : (
                  <p className="summary-text">{summary}</p>
                )}
              </div>

              <div className="summary-actions">
                <button
                  type="button"
                  className="summary-action-btn"
                  onClick={handleEditSummary}
                >
                  <EditOutlined />
                  <span>Edit Summary</span>
                </button>
                <button
                  type="button"
                  className="summary-action-btn"
                  onClick={handleRegenerate}
                >
                  <ReloadOutlined />
                  <span>Regenerate</span>
                </button>
              </div>

              <button
                type="button"
                className="summary-write-own-btn"
                onClick={handleWriteOwnSummary}
              >
                Write Your Own Summary
              </button>
            </div>

            {/* Suggested Tags Section */}
            <div className="summary-tags-section">
              <div className="summary-tags-header">
                <span className="summary-tags-sparkle">✨</span>
                <span className="summary-label">Suggested Tags</span>
              </div>
              <div className="summary-tags-list">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="summary-tag-btn"
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                    <span className="tag-plus">+</span>
                  </button>
                ))}
              </div>
              
              <div className="summary-create-tag">
                <input
                  type="text"
                  className="summary-tag-input"
                  placeholder="Create new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTag();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="summary-footer">
            <button
              type="button"
              className="summary-save-btn"
              onClick={handleSaveMetadata}
            >
              <FolderOutlined />
              <span>Save Metadata</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default SummarySidebar;


