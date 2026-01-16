import React, { useState, useEffect } from "react";
import {
    DoubleLeftOutlined,
    DoubleRightOutlined,
    CopyOutlined,
    EditOutlined,
    ReloadOutlined,
    FolderOutlined,
} from "@ant-design/icons";
import { notification, Spin } from "antd";
import "./Styles/AwaitingApprovalSidebar.scss";

interface AwaitingApprovalSidebarProps {
    title?: string;
    isOpen?: boolean;
    onToggle?: () => void;
    summary?: string;
    suggestedTags?: string[];
    activeTags?: string[];
    onSummaryChange?: (summary: string) => void;
    onAddTag?: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
    onCreateTag?: (tag: string) => void;
    onSaveMetadata?: () => void;
    onRegenerate?: () => Promise<void> | void;
    documentId?: number;
}

const AwaitingApprovalSidebar: React.FC<AwaitingApprovalSidebarProps> = ({
    title = "Summary",
    isOpen = true,
    onToggle,
    summary: propSummary = "",
    suggestedTags: propSuggestedTags = [],
    activeTags: propActiveTags = [],
    onSummaryChange,
    onAddTag,
    onRemoveTag,
    onCreateTag,
    onSaveMetadata,
    onRegenerate,
    documentId,
}) => {
    const [summary, setSummary] = useState(propSummary);
    const [suggestedTags] = useState<string[]>(propSuggestedTags);
    const [activeTags, setActiveTags] = useState<string[]>(propActiveTags);
    const [newTag, setNewTag] = useState("");
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setSummary(propSummary);
    }, [propSummary]);

    useEffect(() => {
        setActiveTags(propActiveTags);
    }, [propActiveTags]);

    const handleCopySummary = () => {
        navigator.clipboard.writeText(summary);
        notification.success({
            message: "Summary copied to clipboard",
            duration: 2,
        });
    };

    const handleSummaryChange = (newSummary: string) => {
        setSummary(newSummary);
        if (onSummaryChange) {
            onSummaryChange(newSummary);
        }
    };

    const handleEditSummary = () => {
        setIsEditingSummary(true);
    };

    const handleRegenerate = async () => {
        if (!onRegenerate) {
            notification.info({ message: "Regenerating summary..." });
            return;
        }

        try {
            setIsRegenerating(true);
            await onRegenerate();
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleWriteOwnSummary = () => {
        setIsEditingSummary(true);
        setSummary("");
        if (onSummaryChange) {
            onSummaryChange("");
        }
    };

    const handleAddTag = (tag: string) => {
        if (!activeTags.includes(tag)) {
            const updatedTags = [...activeTags, tag];
            setActiveTags(updatedTags);
            if (onAddTag) {
                onAddTag(tag);
            }
        }
    };

    const handleRemoveTag = (tag: string) => {
        const updatedTags = activeTags.filter((t) => t !== tag);
        setActiveTags(updatedTags);
        if (onRemoveTag) {
            onRemoveTag(tag);
        }
    };

    const handleCreateTag = () => {
        const value = newTag.trim();
        if (!value) return;

        // Update local active tags immediately
        if (!activeTags.includes(value)) {
            const updated = [...activeTags, value];
            setActiveTags(updated);
            if (onAddTag) {
                onAddTag(value);
            }
        }

        // Notify parent about new tag creation
        if (onCreateTag) {
            onCreateTag(value);
        } else {
            notification.success({ message: `Tag "${value}" created` });
        }

        setNewTag("");
    };

    const handleSaveMetadata = () => {
        if (onSaveMetadata) {
            onSaveMetadata();
        } else {
            notification.success({ message: "Metadata saved successfully" });
        }
    };

    return (
        <aside className={`awaiting-approval-sidebar ${isOpen ? "open" : "collapsed"}`}>
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
                            {isOpen ? (
                                <img src="/assets/collapse.svg" alt="" />
                            ) : (
                                <img src="/assets/expand.svg" alt="" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {!isOpen && (
                <button
                    type="button"
                    className="summary-icon-btn"
                    onClick={onToggle}
                    title="Open Summary"
                >
                    <img src="/assets/Summary.svg" alt="Summary" />
                </button>
            )}

            {isOpen && (
                <>
                    <div className="summary-body">
                        {/* AI Generated Section */}
                        <div className="summary-ai-section">
                            <div className="summary-text-box">
                                {/* <div className="summary-ai-header">
                                    <div className="summary-ai-badge">
                                        <span className="summary-ai-sparkle">
                                            <img src="/assets/Star.svg" alt="" />
                                        </span>
                                        <span className="summary-ai-label">AI Generated</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="summary-copy-btn"
                                        onClick={handleCopySummary}
                                        title="Copy summary"
                                    >
                                        <svg
                                            className="action-icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                className="icon-outline"
                                                fill="currentColor"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M15.5 4.04492H12.1197C10.5882 4.04491 9.37516 4.0449 8.42582 4.17253C7.4488 4.30389 6.65801 4.58066 6.03437 5.20429C5.41073 5.82793 5.13397 6.61872 5.00261 7.59574C4.87498 8.54508 4.87499 9.7581 4.875 11.2896V16.3366C4.875 17.8968 6.01838 19.1899 7.51293 19.4239C7.6279 20.0605 7.84794 20.6039 8.29029 21.0463C8.79189 21.5479 9.42345 21.7636 10.1735 21.8645C10.896 21.9616 11.8146 21.9616 12.9543 21.9616H15.5457C16.6854 21.9616 17.604 21.9616 18.3265 21.8645C19.0766 21.7636 19.7081 21.5479 20.2097 21.0463C20.7113 20.5447 20.9271 19.9131 21.0279 19.163C21.125 18.4406 21.125 17.522 21.125 16.3823V12.1242C21.125 10.9845 21.125 10.0659 21.0279 9.34346C20.9271 8.59337 20.7113 7.96181 20.2097 7.46021C19.7674 7.01786 19.2239 6.79783 18.5873 6.68285C18.3534 5.1883 17.0602 4.04492 15.5 4.04492ZM17.2744 6.56256C17.0221 5.82512 16.323 5.29492 15.5 5.29492H12.1667C10.5777 5.29492 9.44876 5.29625 8.59238 5.41139C7.75397 5.52411 7.27093 5.7355 6.91825 6.08817C6.56558 6.44085 6.35419 6.92389 6.24147 7.7623C6.12633 8.61868 6.125 9.74757 6.125 11.3366V16.3366C6.125 17.1596 6.6552 17.8587 7.39264 18.111C7.37498 17.6027 7.37499 17.028 7.375 16.3823V12.1242C7.37498 10.9845 7.37497 10.0659 7.4721 9.34346C7.57295 8.59337 7.7887 7.96181 8.29029 7.46021C8.79189 6.95862 9.42345 6.74287 10.1735 6.64203C10.896 6.54489 11.8146 6.54491 12.9543 6.54492H15.5457C16.1914 6.54491 16.7661 6.5449 17.2744 6.56256ZM9.17418 8.3441C9.40481 8.11346 9.72862 7.96309 10.3401 7.88088C10.9696 7.79625 11.8038 7.79492 13 7.79492H15.5C16.6962 7.79492 17.5304 7.79625 18.1599 7.88088C18.7714 7.96309 19.0952 8.11346 19.3258 8.3441C19.5565 8.57473 19.7068 8.89854 19.789 9.51002C19.8737 10.1395 19.875 10.9737 19.875 12.1699V16.3366C19.875 17.5328 19.8737 18.367 19.789 18.9965C19.7068 19.608 19.5565 19.9318 19.3258 20.1624C19.0952 20.3931 18.7714 20.5434 18.1599 20.6256C17.5304 20.7103 16.6962 20.7116 15.5 20.7116H13C11.8038 20.7116 10.9696 20.7103 10.3401 20.6256C9.72862 20.5434 9.40481 20.3931 9.17418 20.1624C8.94354 19.9318 8.79317 19.608 8.71096 18.9965C8.62633 18.367 8.625 17.5328 8.625 16.3366V12.1699C8.625 10.9737 8.62633 10.1395 8.71096 9.51002C8.79317 8.89854 8.94354 8.57473 9.17418 8.3441Z"
                                            />

                                            <path
                                                width="24"
                                                height="24"
                                                className="icon-filled"
                                                fill="currentColor"
                                                d="M12.7 1.66992H9.45487C7.98466 1.66991 6.82015 1.6699 5.90878 1.79292C4.97084 1.91953 4.21169 2.18629 3.613 2.78739C3.0143 3.38848 2.74861 4.15069 2.62251 5.09239C2.49998 6.00742 2.49999 7.1766 2.5 8.65271V13.5173C2.5 14.7741 3.26663 15.8511 4.35597 16.3026C4.2999 15.5447 4.29995 14.4813 4.3 13.5966L4.3 9.50125L4.3 9.42193C4.29994 8.35388 4.29989 7.43362 4.39857 6.69668C4.50433 5.9069 4.74282 5.14985 5.35442 4.5358C5.96601 3.92175 6.72003 3.6823 7.50665 3.57612C8.24064 3.47704 9.15722 3.47709 10.221 3.47715L10.3 3.47715H12.7L12.779 3.47715C13.8428 3.47709 14.7574 3.47704 15.4914 3.57612C15.0523 2.45975 13.968 1.66992 12.7 1.66992Z"
                                            />
                                            <path
                                                width="24"
                                                height="24"
                                                className="icon-filled"
                                                fill="currentColor"
                                                d="M5.5 9.49701C5.5 7.22518 5.5 6.08927 6.20294 5.3835C6.90589 4.67773 8.03726 4.67773 10.3 4.67773H12.7C14.9627 4.67773 16.0941 4.67773 16.7971 5.3835C17.5 6.08927 17.5 7.22518 17.5 9.49701V13.5131C17.5 15.7849 17.5 16.9208 16.7971 17.6266C16.0941 18.3324 14.9627 18.3324 12.7 18.3324H10.3C8.03726 18.3324 6.90589 18.3324 6.20294 17.6266C5.5 16.9208 5.5 15.7849 5.5 13.5131V9.49701Z"
                                            />
                                        </svg>
                                    </button>
                                </div> */}
                                {isEditingSummary ? (
                                    <textarea
                                        value={summary}
                                        onChange={(e) => handleSummaryChange(e.target.value)}
                                        className="summary-textarea"
                                        placeholder="Enter your summary..."
                                    />
                                ) : (
                                    <p className="summary-text">{summary || "No summary available."}</p>
                                )}

                                {/* <div className="summary-actions">
                                    <button
                                        type="button"
                                        className="summary-action-btn"
                                        onClick={handleEditSummary}
                                    >
                                        <svg
                                            className="action-icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M5.53999 21.0938C4.92999 21.0938 4.35999 20.8838 3.94999 20.4938C3.42999 20.0038 3.17999 19.2638 3.26999 18.4638L3.63999 15.2238C3.70999 14.6138 4.07999 13.8038 4.50999 13.3638L12.72 4.67378C14.77 2.50378 16.91 2.44378 19.08 4.49378C21.25 6.54378 21.31 8.68378 19.26 10.8538L11.05 19.5438C10.63 19.9938 9.84999 20.4138 9.23999 20.5138L6.01999 21.0638C5.84999 21.0738 5.69999 21.0938 5.53999 21.0938ZM15.93 4.48378C15.16 4.48378 14.49 4.96378 13.81 5.68378L5.59999 14.3838C5.39999 14.5938 5.16999 15.0938 5.12999 15.3838L4.75999 18.6238C4.71999 18.9538 4.79999 19.2238 4.97999 19.3938C5.15999 19.5638 5.42999 19.6238 5.75999 19.5738L8.97999 19.0238C9.26999 18.9738 9.74999 18.7138 9.94999 18.5038L18.16 9.81378C19.4 8.49378 19.85 7.27378 18.04 5.57378C17.24 4.80378 16.55 4.48378 15.93 4.48378Z" />
                                        </svg>

                                        <span>Edit Summary</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="summary-action-btn"
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating}
                                    >
                                        <svg
                                            className="action-icon"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M1.67511 11.3318C1.41526 11.4567 1.25 11.7195 1.25 12.0078C1.25 12.7431 1.32394 13.462 1.46503 14.157C2.46112 19.0641 6.79837 22.7578 12 22.7578C17.9371 22.7578 22.75 17.9449 22.75 12.0078C22.75 6.07075 17.9371 1.25781 12 1.25781C7.59065 1.25781 3.80298 3.9124 2.14482 7.70753C1.97898 8.0871 2.15224 8.52924 2.53181 8.69508C2.91137 8.86091 3.35351 8.68765 3.51935 8.30809C4.94742 5.0396 8.20808 2.75781 12 2.75781C17.1086 2.75781 21.25 6.89918 21.25 12.0078C21.25 17.1164 17.1086 21.2578 12 21.2578C7.84953 21.2578 4.33622 18.5236 3.16544 14.7578H4.5C4.81852 14.7578 5.10229 14.5566 5.20772 14.2561C5.31315 13.9555 5.21724 13.6211 4.96852 13.4222L2.46852 11.4222C2.24339 11.2421 1.93496 11.2069 1.67511 11.3318Z" />
                                        </svg>
                                        <span>Regenerate</span>
                                    </button>
                                </div> */}
                            </div>

                            {/* <button
                                type="button"
                                className="summary-write-own-btn"
                                onClick={handleWriteOwnSummary}
                            >
                                Write Your Own Summary
                            </button> */}
                        </div>

                        {/* Suggested Tags Section */}
                        {/* <div className="summary-tags-section">
                            <div className="summary-tags-header">
                                <span className="summary-label">Suggested Tags</span>
                                <span className="summary-tags-sparkle">
                                    <img src="/assets/sparklestar.svg" alt="sparkle" />
                                </span>
                            </div>
                            <div className="summary-tags-list">
                                {suggestedTags.map((tag) => (
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

                            <span className="summary-tag">Create New Tag</span>
                            <div className="summary-create-tag">
                                <div className="">
                                    <input
                                        type="text"
                                        className="summary-tag-input"
                                        placeholder="Enter tag name"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleCreateTag();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="summary-button">
                                    <button
                                        type="button"
                                        className="tag-add-button"
                                        onClick={handleCreateTag}
                                    >
                                        <span className="tag-plus">Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="summary-active-tags">
                            <span className="summary-tag-label">
                                ACTIVE TAGS ({activeTags.length}/10)
                            </span>

                            <div className="summary-tags-list">
                                {activeTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className="summary-tag-btn active"
                                    >
                                        {tag}
                                        <span
                                            className="tag-remove"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            ×
                                        </span>
                                    </button>
                                ))}

                                {activeTags.length === 0 && (
                                    <span className="summary-empty-text">
                                        No active tags selected
                                    </span>
                                )}
                            </div>
                        </div> */}
                    </div>

                    {/* <div className="summary-footer">
                        <button
                            type="button"
                            className="summary-save-btn"
                            onClick={handleSaveMetadata}
                        >
                            <img src="/assets/save.svg" alt="" />
                            <span>Save Metadata</span>
                        </button>
                    </div> */}
                </>
            )}
        </aside>
    );
};

export default AwaitingApprovalSidebar;