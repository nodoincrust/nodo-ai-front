import React, { useState } from "react";
import DocumentHeader from "../../../CommonComponents/DocumentHeader/DocumentHeader";
import ChatSidebar from "../../../CommonComponents/ChatSidebar/ChatSidebar";
import SummarySidebar from "../../../CommonComponents/SummarySidebar/SummarySidebar";
import type { DocumentHeaderProps } from "../../../types/common";
import "./Styles/DocumentLayout.scss";

interface DocumentLayoutProps {
  headerProps: DocumentHeaderProps;
  showSummarySidebar?: boolean;
  showChatSidebar?: boolean;
  children?: React.ReactNode;
}

const DocumentLayout: React.FC<DocumentLayoutProps> = ({
  headerProps,
  showSummarySidebar = true,
  showChatSidebar = true,
  children,
}) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSummaryClosing, setIsSummaryClosing] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);

  // Toggle Summary Sidebar - if opening, close Chat (only one open at a time)
  const toggleSummarySidebar = () => {
    if (isSummaryOpen) {
      setIsSummaryOpen(false);
      setIsSummaryClosing(true);
      setTimeout(() => setIsSummaryClosing(false), 300);
    } else {
      // If opening Summary, close Chat
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
      setIsChatOpen(false);
      setIsChatClosing(true);
      setTimeout(() => setIsChatClosing(false), 300);
    } else {
      // If opening Chat, close Summary
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
            className={`document-layout-sidebar document-layout-sidebar--left ${
              isSummaryOpen ? "open" : "collapsed"
            } ${isSummaryClosing ? "closing" : ""}`}
          >
            <SummarySidebar
              isOpen={isSummaryOpen}
              onToggle={toggleSummarySidebar}
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
            className={`document-layout-sidebar document-layout-sidebar--right ${
              isChatOpen ? "open" : "collapsed"
            } ${isChatClosing ? "closing" : ""}`}
          >
            <ChatSidebar isOpen={isChatOpen} onToggle={toggleChatSidebar} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLayout;


