import { renderAsync } from "docx-preview";
import { useEffect, useRef } from "react";

const DocxViewer = ({ fileUrl }: { fileUrl: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (containerRef.current) {
          renderAsync(buffer, containerRef.current);
        }
      });
  }, [fileUrl]);

  return <div ref={containerRef} style={{ padding: "16px" }} />;
};

export default DocxViewer;
