import PdfViewer from "./Components/Document Preview Components/PdfViewer";
import DocxViewer from "./Components/Document Preview Components/DocxViewer";
import ExcelViewer from "./Components/Document Preview Components/ExcelViewer";
import ImageViewer from "./Components/Document Preview Components/ImageViewer";
import TextPreview from "./Components/Document Preview Components/TextPreview";

const DocumentPreview = ({ fileName, fileUrl }: any) => {
  const fileType = fileName.split(".").pop()?.toLowerCase();

  if (fileType === "pdf") {
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

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      Preview not available.  
      <br />
    
    </div>
  );
};

export default DocumentPreview;
