import React, { useEffect, useState } from "react";
import DocumentHeader from "../../../CommonComponents/DocumentHeader/DocumentHeader";
import ChatSidebar from "../../../CommonComponents/ChatSidebar/ChatSidebar";
import SummarySidebar from "../../../CommonComponents/SummarySidebar/SummarySidebar";
import type { DocumentHeaderProps } from "../../../types/common";
import "./Styles/DocumentLayout.scss";

import type { ApiDocument } from "../../../types/common";
interface AiChatResult {
  text: string;
  sessionId: string;
  citations: any[];
}
interface DocumentLayoutProps {
  headerProps: DocumentHeaderProps;
  showSummarySidebar?: boolean;
  showChatSidebar?: boolean;
  children?: React.ReactNode;
  isSummaryGenerating?: boolean;
  document?: ApiDocument | null;
  summaryText?: string;
  suggestedTags?: string[];
  activeTags?: string[];
  onSummaryChange?: (summary: string) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  onCreateTag?: (tag: string) => void;
  onSaveMetadata?: () => void;
  onRegenerate?: () => void;
  onSendMessage?: (
    message: string,
    documentId: number
  ) => Promise<AiChatResult>;
}

const DocumentLayout: React.FC<DocumentLayoutProps> = ({
  headerProps,
  showSummarySidebar = true,
  showChatSidebar = true,
  children,
  document,
  suggestedTags = [],
  activeTags = [],
  isSummaryGenerating,
  onSummaryChange,
  summaryText,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onSaveMetadata,
  onRegenerate,
  onSendMessage,
}) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSummaryClosing, setIsSummaryClosing] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);

  // Toggle Summary Sidebar - if opening, close Chat (only one open at a time)
  const toggleSummarySidebar = () => {
    if (isSummaryOpen) {
      // If Summary is open and user clicks toggle:
      // close Summary and open Chat (if Chat sidebar is available)
      setIsSummaryOpen(false);
      setIsSummaryClosing(true);
      setTimeout(() => setIsSummaryClosing(false), 300);

      if (showChatSidebar) {
        setIsChatOpen(true);
        setIsChatClosing(false);
      }
    } else {
      // If opening Summary, close Chat first (only one open at a time)
      if (isChatOpen) {
        setIsChatOpen(false);
        setIsChatClosing(true);
        setTimeout(() => setIsChatClosing(false), 300);
      }
      setIsSummaryOpen(true);
    }
  };

  // Toggle Chat Sidebar - if opening, close Summary (only one open at a time)
  const toggleChatSidebar = () => {
    if (isChatOpen) {
      // If Chat is open and user clicks toggle:
      // close Chat and open Summary (if Summary sidebar is available)
      setIsChatOpen(false);
      setIsChatClosing(true);
      setTimeout(() => setIsChatClosing(false), 300);

      if (showSummarySidebar) {
        setIsSummaryOpen(true);
        setIsSummaryClosing(false);
      }
    } else {
      // If opening Chat, close Summary first (only one open at a time)
      if (isSummaryOpen) {
        setIsSummaryOpen(false);
        setIsSummaryClosing(true);
        setTimeout(() => setIsSummaryClosing(false), 300);
      }
      setIsChatOpen(true);
    }
  };



  return (
    <div className="document-layout">
      <DocumentHeader {...headerProps} />

      <div className="document-layout-body">
        {/* Left Sidebar - Summary */}
        {showSummarySidebar && (
          <div
            className={`document-layout-sidebar document-layout-sidebar--left ${isSummaryOpen ? "open" : "collapsed"
              } ${isSummaryClosing ? "closing" : ""}`}
          >
            <SummarySidebar
              isOpen={isSummaryOpen}
              onToggle={toggleSummarySidebar}
              summary={summaryText}
              suggestedTags={suggestedTags || []}
              activeTags={activeTags || []}
              onSummaryChange={onSummaryChange}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onCreateTag={onCreateTag}
              onSaveMetadata={onSaveMetadata}
              onRegenerate={onRegenerate}
              documentId={document?.document_id}
              isSummaryGenerating={isSummaryGenerating}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="document-layout-main">
          {children ?? (
            <div className="document-placeholder">
              <span className="document-placeholder-label">
                Document preview
              </span>
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat */}
        {showChatSidebar && (
          <div
            className={`document-layout-sidebar document-layout-sidebar--right ${isChatOpen ? "open" : "collapsed"
              } ${isChatClosing ? "closing" : ""}`}
          >
            <ChatSidebar
              isOpen={isChatOpen}
              onToggle={toggleChatSidebar}
              contextValue={document?.version?.file_name || ""}
              documentId={document?.document_id}
              onSendMessage={onSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLayout;
