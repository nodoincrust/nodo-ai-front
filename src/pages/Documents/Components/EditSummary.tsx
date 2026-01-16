import React, { useState, useEffect } from "react";
import { notification } from "antd";
import AppModal from "../../../components/common/AppModal";
import { saveDocumentMetadata } from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import "./Styles/EditSummary.scss";

interface EditSummaryProps {
  open: boolean;
  onClose: () => void;
  summary: string;
  documentId: number;
  activeTags?: string[];
  onUpdate?: (updatedSummary: string) => void;
  isUserWrittenSummary?: boolean;
}

const EditSummary: React.FC<EditSummaryProps> = ({
  open,
  onClose,
  summary: initialSummary,
  documentId,
  activeTags = [],
  onUpdate,
  isUserWrittenSummary = false,
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when prop changes (when modal opens with new summary)
  useEffect(() => {
    if (open) {
      setSummary(initialSummary);
    }
  }, [open, initialSummary]);

  const handleUpdate = async () => {
    if (!documentId) {
      notification.error({
        message: "Document ID is required",
      });
      return;
    }

    setIsSaving(true);
    getLoaderControl()?.showLoader();

    try {
      const payload = {
        summary: summary.trim(),
        tags: activeTags.filter(Boolean),
        is_self_generated: isUserWrittenSummary, // Preserve existing state (user-written or AI-generated)
      };

      await saveDocumentMetadata(documentId, payload);

      notification.success({
        message: "Summary updated successfully",
      });

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(summary.trim());
      }

      onClose();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to update summary",
      });
    } finally {
      setIsSaving(false);
      getLoaderControl()?.hideLoader();
    }
  };

  const handleCancel = () => {
    // Reset to initial summary when canceling
    setSummary(initialSummary);
    onClose();
  };

  return (
    <AppModal
      open={open}
      title="Edit Summary"
      onClose={handleCancel}
      width="412px"
      height="92vh"
      footer={
        <div className="edit-summary-footer">
          <button
            type="button"
            className="edit-summary-btn cancel-btn"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="edit-summary-btn update-btn"
            onClick={handleUpdate}
            disabled={isSaving}
          >
            {isSaving ? "Updating..." : "Update Summary"}
          </button>
        </div>
      }
    >
      <div className="edit-summary-content">
        <label className="edit-summary-label">Summary</label>
        <textarea
          className="edit-summary-textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Enter your summary..."
          rows={12}
          disabled={isSaving}
        />
      </div>
    </AppModal>
  );
};

export default EditSummary;

