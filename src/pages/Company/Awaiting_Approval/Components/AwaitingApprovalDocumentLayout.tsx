import React, { useState } from "react";
import { ApiDocument, DocumentHeaderProps } from "../../../../types/common";
import DocumentHeader from "../../../../CommonComponents/DocumentHeader/DocumentHeader";
import SummarySidebar from "../../../../CommonComponents/SummarySidebar/SummarySidebar";
import './Styles/AwaitingApprovalDocumentLayout.scss'
import AwaitingApprovalSidebar from "./AwaitingApprovalSidebar";
interface AwaitingApprovalDocumentLayoutProps {
    headerProps: DocumentHeaderProps;
    document?: ApiDocument | null;
    children?: React.ReactNode;

    showSummarySidebar?: boolean;

    onSummaryChange?: (summary: string) => void;
    onAddTag?: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
    onCreateTag?: (tag: string) => void;
    onSaveMetadata?: () => void;
    onRegenerate?: () => void;
}

const AwaitingApprovalDocumentLayout: React.FC<
    AwaitingApprovalDocumentLayoutProps
> = ({
    headerProps,
    document,
    children,
    showSummarySidebar = true,
    onSummaryChange,
    onAddTag,
    onRemoveTag,
    onCreateTag,
    onSaveMetadata,
    onRegenerate,
}) => {
        const [isSummaryOpen, setIsSummaryOpen] = useState(true);
        const [isSummaryClosing, setIsSummaryClosing] = useState(false);

        const toggleSummarySidebar = () => {
            if (isSummaryOpen) {
                setIsSummaryOpen(false);
                setIsSummaryClosing(true);
                setTimeout(() => setIsSummaryClosing(false), 300);
            } else {
                setIsSummaryOpen(true);
            }
        };

        return (
            <div className="document-layout">
                <DocumentHeader {...headerProps} />

                <div className="document-layout-body">
                    {/* Left Sidebar – Summary */}
                    {showSummarySidebar && (
                        <div
                            className={`document-layout-sidebar document-layout-sidebar--left ${isSummaryOpen ? "open" : "collapsed"
                                } ${isSummaryClosing ? "closing" : ""}`}
                        >
                            <AwaitingApprovalSidebar
                                isOpen={isSummaryOpen}
                                onToggle={toggleSummarySidebar}
                                summary={document?.version?.summary}
                                suggestedTags={document?.version?.tags || []}
                                activeTags={document?.version?.tags || []}
                                onSummaryChange={onSummaryChange}
                                onRegenerate={onRegenerate}
                                documentId={document?.document_id}
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
                </div>
            </div>
        );
    };

export default AwaitingApprovalDocumentLayout;