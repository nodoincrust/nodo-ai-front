import React, { useState, useEffect } from "react";
import { notification } from "antd";
import AppModal from "../../../components/common/AppModal";
import { saveDocumentMetadata } from "../../../services/documents.service";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import "./Styles/EditSummary.scss";

interface WriteownSummaryProps {
  open: boolean;
  onClose: () => void;
  summary?: string;
  documentId: number;
  activeTags?: string[];
  onSave?: (savedSummary: string) => void;
}

const WriteownSummary: React.FC<WriteownSummaryProps> = ({
  open,
  onClose,
  summary: initialSummary = "",
  documentId,
  activeTags = [],
  onSave,
}) => {
  const [summary, setSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset to empty when modal opens (for writing own summary)
  useEffect(() => {
    if (open) {
      setSummary("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!documentId) {
      notification.error({
        message: "Document ID is required",
      });
      return;
    }

    if (!summary.trim()) {
      notification.warning({
        message: "Please enter a summary",
      });
      return;
    }

    setIsSaving(true);
    getLoaderControl()?.showLoader();

    try {
      const payload = {
        summary: summary.trim(),
        tags: activeTags.filter(Boolean),
        is_self_generated: true,
      };

      await saveDocumentMetadata(documentId, payload);

      notification.success({
        message: "Summary saved successfully",
      });

      // Call the onSave callback if provided
      if (onSave) {
        onSave(summary.trim());
      }

      onClose();
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to save summary",
      });
    } finally {
      setIsSaving(false);
      getLoaderControl()?.hideLoader();
    }
  };

  const handleCancel = () => {
    // Reset to empty when canceling
    setSummary("");
    onClose();
  };

  return (
    <AppModal
      open={open}
      title="Write Your Own Summary"
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
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
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
          placeholder="Write your Summary"
          rows={12}
          disabled={isSaving}
        />
      </div>
    </AppModal>
  );
};

export default WriteownSummary;

