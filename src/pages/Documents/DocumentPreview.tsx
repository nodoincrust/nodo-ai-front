import React, { useMemo } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

interface DocumentPreviewProps {
  fileName: string;
  fileUrl: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileName,
  fileUrl,
}) => {
  const fileType = fileName.split(".").pop()?.toLowerCase();

  // Memoize docs to avoid reloading
  const docs = useMemo(
    () => [
      {
        uri: fileUrl,
        fileName,
      },
    ],
    [fileUrl, fileName]
  );

  // ⚡ FAST PDF PREVIEW (no external service)
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

  // ⚡ FAST IMAGE PREVIEW
  if (["png", "jpg", "jpeg", "gif"].includes(fileType || "")) {
    return (
      <img
        src={fileUrl}
        alt={fileName}
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    );
  }

  // 🐢 Office + Others → react-doc-viewer
  return (
    <DocViewer
      documents={docs}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: {
          disableHeader: true,
          disableFileName: true,
        },
      }}
      style={{  width:"100%", height: "100%" }}
    />
  );
};

export default DocumentPreview;
