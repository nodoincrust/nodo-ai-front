import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { useEffect } from "react";
import renderToolbar from "./renderToolbar";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PdfViewerProps {
  fileUrl?: string;
  onLoadError?: () => void;
}

// renderError runs during render, so the callback is deferred to an effect.
const PdfLoadError = ({ onLoadError }: { onLoadError?: () => void }) => {
  useEffect(() => {
    onLoadError?.();
  }, [onLoadError]);

  return (
    <div className="pdf-error">
      <p>PDF preview not available</p>
    </div>
  );
};

const PdfViewer = ({ fileUrl, onLoadError }: PdfViewerProps) => {
  // 🚨 Guard: invalid or empty URL
  if (!fileUrl || typeof fileUrl !== "string") {
    return (
      <div className="pdf-error">
        <p>PDF preview not available</p>
      </div>
    );
  }

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],
  });

  return (
    <div style={{ height: "100vh" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          renderError={() => <PdfLoadError onLoadError={onLoadError} />}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;
