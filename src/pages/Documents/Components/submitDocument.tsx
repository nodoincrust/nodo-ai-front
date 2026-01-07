import React, { useState, useEffect } from "react";
import { notification, Spin } from "antd";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { getInitials } from "../../../utils/utilFunctions";
import "./Styles/SubmitDocument.scss";

interface Reviewer {
  id: number;
  name: string;
  role: string;
}

interface SubmitDocumentProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (selectedReviewers: number[]) => void;
  reviewers: Reviewer[];
  loading?: boolean;
}

const SubmitDocument: React.FC<SubmitDocumentProps> = ({
  open,
  onClose,
  onSubmit,
  reviewers,
  loading = false,
}) => {
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setSelectedReviewers([]);
    }
  }, [open]);

  const handleToggleReviewer = (clickedIndex: number) => {
    const idsUpToIndex = reviewers.slice(0, clickedIndex + 1).map((r) => r.id);

    const isSameSelection =
      idsUpToIndex.length === selectedReviewers.length &&
      idsUpToIndex.every((id) => selectedReviewers.includes(id));

    setSelectedReviewers(isSameSelection ? [] : idsUpToIndex);
  };

  const handleSubmit = () => {
    if (selectedReviewers.length === 0) {
      notification.warning({
        message: "No reviewer selected",
        description: "Please select at least one reviewer.",
      });
      return;
    }

    onSubmit?.(selectedReviewers);
    onClose();
  };

  const getAvatarColor = (index: number): string => {
    const colors = ["#8B5CF6", "#3B82F6", "#1E40AF", "#10B981", "#F59E0B"];
    return colors[index % colors.length];
  };

  return (
    <AppModal
      open={open}
      width="412px"
      title="Submit Document"
      onClose={onClose}
      footer={
        <div className="submit-document-footer">
          <AppButton variant="outline" label="Cancel" onClick={onClose} />
          <AppButton
            variant="primary"
            label="Submit"
            onClick={handleSubmit}
            disabled={selectedReviewers.length === 0}
          />
        </div>
      }
    >
      <div className="submit-document-content">
        <div className="submit-section">
          <label className="submit-label">Submit To</label>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : reviewers.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              No employees found
            </div>
          ) : (
            <div className="reviewers-list">
              {reviewers.map((reviewer, index) => {
                const isSelected = selectedReviewers.includes(reviewer.id);
                const avatarColor = getAvatarColor(index);
                const initials = getInitials(reviewer.name);

                return (
                  <div
                    key={reviewer.id}
                    className={`reviewer-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleReviewer(index)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="reviewer-checkbox"
                    />

                    <div
                      className="reviewer-avatar"
                      style={{
                        backgroundColor: `${avatarColor}20`,
                        color: avatarColor,
                      }}
                    >
                      {initials}
                    </div>

                    <div className="reviewer-info">
                      <div className="reviewer-name">{reviewer.name}</div>
                      <div className="reviewer-role">{reviewer.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default SubmitDocument;
