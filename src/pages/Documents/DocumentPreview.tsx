import { useCallback, useRef } from "react";
import PdfViewer from "./Components/Document Preview Components/PdfViewer";
import DocxViewer from "./Components/Document Preview Components/DocxViewer";
import ExcelViewer from "./Components/Document Preview Components/ExcelViewer";
import ImageViewer from "./Components/Document Preview Components/ImageViewer";
import TextPreview from "./Components/Document Preview Components/TextPreview";
import PptViewer from "./Components/Document Preview Components/pptViwer";

const DocumentPreview = ({ fileName, fileUrl, onFileUrlExpired }: any) => {
  const fileType = fileName?.split(".").pop()?.toLowerCase();

  // Presigned S3 URLs expire, so a failed load is retried once against a
  // freshly fetched URL before falling back to the error state.
  const retriedUrlRef = useRef<string | null>(null);
  const handleLoadError = useCallback(() => {
    if (!fileUrl || !onFileUrlExpired) return;
    if (retriedUrlRef.current === fileUrl) return;
    retriedUrlRef.current = fileUrl;
    onFileUrlExpired();
  }, [fileUrl, onFileUrlExpired]);

  if (!fileUrl || typeof fileUrl !== "string") {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        File is currently unavailable.
      </div>
    );
  }

  if (fileType === "pdf") {
    return <PdfViewer fileUrl={fileUrl} onLoadError={handleLoadError} />;
  }

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(fileType || "")) {
    return (
      <ImageViewer
        fileUrl={fileUrl}
        fileName={fileName}
        onLoadError={handleLoadError}
      />
    );
  }

  if (["doc", "docx"].includes(fileType || "")) {
    return <DocxViewer fileUrl={fileUrl} onLoadError={handleLoadError} />;
  }

  if (["xls", "xlsx"].includes(fileType || "")) {
    return <ExcelViewer fileUrl={fileUrl} onLoadError={handleLoadError} />;
  }

  if (fileType === "txt") {
    return <TextPreview fileUrl={fileUrl} onLoadError={handleLoadError} />;
  }

  if (fileType === "ppt" || fileType === "pptx") {
    return <PptViewer fileUrl={fileUrl} onLoadError={handleLoadError} />;
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      Preview not available.
    </div>
  );
};

export default DocumentPreview;
