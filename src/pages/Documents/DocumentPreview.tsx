import React from "react";

interface DocumentPreviewProps {
  fileName: string;
  fileUrl: string; // ✅ actual URL to file
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  fileUrl,
}) => {
  const fileType = fileName.split(".").pop()?.toLowerCase();

  /* ================= PDF ================= */
  if (fileType === "pdf") {
    return (
      <iframe
        src={fileUrl}
        title="PDF Preview"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    );
  }

  /* ================= IMAGE ================= */
  if (["png", "jpg", "jpeg", "gif"].includes(fileType || "")) {
    return (
      <img
        src={fileUrl}
        alt={fileName}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          display: "block",
          margin: "0 auto",
        }}
      />
    );
  }

  /* ================= OFFICE DOCS ================= */
  if (["doc", "docx", "xls", "xlsx", "xlsm"].includes(fileType || "")) {
    return (
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`}
        title="Office Preview"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    );
  }

  /* ================= FALLBACK ================= */
  return (
    <div style={{ textAlign: "center", padding: "24px" }}>
      <p>Preview not available for this file type.</p>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        Download file
      </a>
    </div>
  );
};

export default DocumentPreview;
