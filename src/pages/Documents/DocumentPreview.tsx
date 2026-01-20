import PdfViewer from "./Components/Document Preview Components/PdfViewer";
import DocxViewer from "./Components/Document Preview Components/DocxViewer";
import ExcelViewer from "./Components/Document Preview Components/ExcelViewer";
import ImageViewer from "./Components/Document Preview Components/ImageViewer";
import TextPreview from "./Components/Document Preview Components/TextPreview";
import PptViewer from "./Components/Document Preview Components/pptViwer";

const DocumentPreview = ({ fileName, fileUrl }: any) => {
  const fileType = fileName?.split(".").pop()?.toLowerCase();

  // Extra safety: for PDFs, ensure we only pass a non-empty string URL
  if (fileType === "pdf") {
    if (!fileUrl || typeof fileUrl !== "string") {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          PDF preview not available.
        </div>
      );
    }
    return <PdfViewer fileUrl={fileUrl} />;
  }

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(fileType || "")) {
    return <ImageViewer fileUrl={fileUrl} fileName={fileName} />;
  }

  if (["doc", "docx"].includes(fileType || "")) {
    return <DocxViewer fileUrl={fileUrl} />;
  }

  if (["xls", "xlsx"].includes(fileType || "")) {
    return <ExcelViewer fileUrl={fileUrl} />;
  }

  if (fileType === "txt") {
    return <TextPreview fileUrl={fileUrl} />;
  }
 if (fileType === "ppt" || fileType === "pptx") {
    return <PptViewer fileUrl={fileUrl} />;
  }
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      Preview not available.  
      <br />
    
    </div>
  );
};

export default DocumentPreview;
