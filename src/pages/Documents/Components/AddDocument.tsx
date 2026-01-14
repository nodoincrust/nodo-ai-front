import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Spin } from "antd";
import AppModal from "../../../components/common/AppModal";
import AppButton from "../../../components/common/AppButton";
import { addDocument, startSummary } from "../../../services/documents.service";
import "./Styles/AddDocument.scss";

interface AddDocumentProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddDocument: React.FC<AddDocumentProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [".pdf", ".docx", ".png", ".xls", ".xlsx",".txt"];
  const acceptedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const validateFile = (file: File): boolean => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      acceptedFileTypes.includes(fileExtension) ||
      acceptedMimeTypes.includes(file.type);

    if (!isValidType) {
      notification.error({
        message: "Invalid file type",
        description:
          "Please upload a file with one of these formats: .pdf, .docx, .png, .xls, .xlsx, .txt",
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      notification.warning({
        message: "No file selected",
        description: "Please select a file to upload",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await addDocument(formData);

      notification.success({
        message: "Document uploaded successfully",
      });

      // Reset state
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.();
      onClose();

      // Navigate to document detail page
      // Upload API response example:
      // {
      //   status: "success",
      //   documentId: 32,
      //   filepath: "storage\\companies\\8\\documents\\32\\v1_file.xlsx",
      //   ...
      // }
      const documentId = (response as any)?.documentId;

      if (documentId) {
        navigate(`/documents/${documentId}`);
        startSummary(documentId,1);

        notification.info({
          message: "Generating AI Summary",
          description: "AI is analyzing the document in background...",
        });
      } else {
        console.warn("upload: no documentId in response", response);
      }
    } catch (error: any) {
      notification.error({
        message: "Upload failed",
        description:
          error?.response?.data?.message || error?.response?.data?.detail,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <AppModal
      open={open}
      width="750px"
      title="Add Document"
      onClose={handleClose}
      footer={
        <div className="add-document-footer">
          <AppButton
            variant="primary"
            label="Upload"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="upload-btn"
          />
        </div>
      }
    >
      <div className="add-document-content" style={{ position: "relative" }}>
        {isUploading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: "8px",
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <div
          className={`file-upload-area ${isDragging ? "dragging" : ""} ${
            selectedFile ? "has-file" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(",")}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />

          {!selectedFile ? (
            <>
              <div className="upload-icon">
                <img
                  src="/assets/Upload.svg"
                  alt="Upload"
                  width={48}
                  height={48}
                />
              </div>
              <p className="upload-text">Drag & drop your files here </p>

              <button type="button" className="browse-link">
                <span className="upload-or">or</span> click to browse files
              </button>
              <p className="supported-formats">
                Supports .pdf, .docx, .png, .jpeg, .xls, .xlsx, .txt
              </p>
            </>
          ) : (
            <div className="selected-file">
              <div className="file-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="#4F4FFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="#4F4FFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="file-info">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default AddDocument;
