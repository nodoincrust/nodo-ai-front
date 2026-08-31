import { useEffect, useState } from "react";

const TextPreview = ({
  fileUrl,
  onLoadError,
}: {
  fileUrl: string;
  onLoadError?: () => void;
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(fileUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load file");
        return r.text();
      })
      .then(setText)
      .catch(() => {
        onLoadError?.();
        setText("Failed to load file");
      });
  }, [fileUrl, onLoadError]);

  return (
    <pre
      style={{
        padding: 16,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "monospace",
        height: "100%",
        overflow: "auto",
        background: "#f8fafc",
      }}
    >
      {text || "Loading..."}
    </pre>
  );
};

export default TextPreview;
