import { useEffect, useState } from "react";

const TextPreview = ({ fileUrl }: { fileUrl: string }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(fileUrl)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText("Failed to load file"));
  }, [fileUrl]);

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
