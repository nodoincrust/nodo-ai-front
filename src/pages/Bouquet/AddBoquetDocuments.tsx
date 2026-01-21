import React, { useState, useEffect } from "react";
import { notification } from "antd";
import AppModal from "../../components/common/AppModal";
import AppButton from "../../components/common/AppButton";
import { getApprovedDocuments } from "../../services/bouquets.services";
import { addDocumentsToBouquet } from "../../services/bouquets.services";
import { getLoaderControl } from "../../CommonComponents/Loader/loader";
import { useDebounce } from "../../hooks/useDebounce";
import { Document } from "../../types/common";
import "./Components/Styles/AddBoquetDocuments.scss";
import PrimaryButton from "../../CommonComponents/Buttons/PrimaryButton";
import SecondaryButton from "../../CommonComponents/Buttons/SecondaryButton";

interface AddBoquetDocumentsProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  bouquetId: string | number;
}

const AddBoquetDocuments: React.FC<AddBoquetDocumentsProps> = ({
  open,
  onClose,
  onSuccess,
  bouquetId,
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 900);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get file type icon path
  const getFileTypeIcon = (fileName: string): string => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (!ext) return "/assets/doc_icon.svg";
    if (ext === "pdf") return "/assets/pdf_icon.svg";
    if (ext === "docx" || ext === "doc") return "/assets/doc_icon.svg";
    if (ext === "xlsm" || ext === "xlsx" || ext === "xls" || ext === "xlc")
      return "/assets/xlc_icon.svg";
    if (ext === "pptx" || ext === "ppt") return "/assets/ppt_icon.svg";
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif")
      return "/assets/imag.svg";
    if (ext === "txt") return "/assets/doc icons.svg";
    return "/assets/doc_icon.svg";
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await getApprovedDocuments({
        search: debouncedSearch || undefined,
        page: 1,
        pagelimit: 100,
        bouquetId: Number(bouquetId),
      });

      if (Array.isArray(res?.data)) {
        const normalizedDocuments: Document[] = res.data
          // Remove already selected documents
          .filter((doc: any) => doc.is_selected_doc !== true)
          // Normalize for UI
          .map((doc: any) => ({
            document_id: doc.document_id,
            name: doc.file_name ?? "Unknown Document",
            status: "APPROVED",
            tags: Array.isArray(doc.tags) ? doc.tags : [],
            current_version: doc.version_number ?? 1,
            size: 0,
            file_type: doc.file_name?.split(".").pop()?.toLowerCase() ?? "doc",
          }));

        setDocuments(normalizedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (error: any) {
      setDocuments([]);
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to load documents",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDocuments();
      setSelectedDocuments([]);
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch]);

  const handleToggleDocument = (documentId: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleAddDocuments = async () => {
    if (selectedDocuments.length === 0) {
      notification.warning({
        message: "Please select at least one document",
      });
      return;
    }

    setIsSubmitting(true);
    getLoaderControl()?.showLoader();

    try {
      await addDocumentsToBouquet(bouquetId, {
        documentIds: selectedDocuments,
      });

      notification.success({
        message: "Documents added to bouquet successfully",
      });

      onSuccess?.();
      onClose();
      setSelectedDocuments([]);
    } catch (error: any) {
      notification.error({
        message:
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Failed to add documents to bouquet",
      });
    } finally {
      setIsSubmitting(false);
      getLoaderControl()?.hideLoader();
    }
  };

  return (
    <AppModal
      open={open}
      title="Add Documents"
      onClose={onClose}
      footer={
        <div className="submit-document-footer">
          <SecondaryButton text="Cancel" onClick={onClose} />
          <PrimaryButton
            text="Add Documents"
            onClick={handleAddDocuments}
            disabled={selectedDocuments.length === 0}
            className="submit-btn"
          />
        </div>
      }
      width="412px"
    >
      <div className="add-bouquet-documents">
        <div className="select-documents-section">
          <label className="select-documents-label">Select Documents</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="- Search Document -"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img
              src="/assets/search.svg"
              alt="Search"
              className="search-icon"
            />
          </div>
        </div>

        <div className="documents-list-container">
          <p className="instruction-text">You can select multiple documents</p>
          {isLoading ? (
            <div className="loading-state">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <img
                src="/assets/table-fallback.svg"
                alt="No documents found"
                className="empty-state-image"
              />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div
                  key={doc.document_id}
                  className="document-item"
                  onClick={() => handleToggleDocument(doc.document_id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.document_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleDocument(doc.document_id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="document-checkbox"
                  />
                  <div className="document-icon">
                    <img
                      src={getFileTypeIcon(doc.name)}
                      alt={doc.file_type?.toUpperCase()}
                      className="file-type-icon"
                    />
                  </div>
                  <span className="document-name">{doc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default AddBoquetDocuments;
