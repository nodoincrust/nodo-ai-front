import { renderAsync } from "docx-preview";
import { useEffect, useRef } from "react";

const DocxViewer = ({
  fileUrl,
  onLoadError,
}: {
  fileUrl: string;
  onLoadError?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(fileUrl)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load document");
        return res.arrayBuffer();
      })
      .then(buffer => {
        if (containerRef.current) {
          renderAsync(buffer, containerRef.current);
        }
      })
      .catch(() => onLoadError?.());
  }, [fileUrl, onLoadError]);

  return <div ref={containerRef} style={{ padding: "16px" }} />;
};

export default DocxViewer;
