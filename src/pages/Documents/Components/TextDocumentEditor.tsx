import React from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}

const TextDocumentEditor: React.FC<Props> = ({
  value,
  onChange,
  onCancel,
  onSave,
  disabled,
}) => {
  return (
    <div className="text-editor-wrapper">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={25}
        disabled={disabled}
        style={{
          width: "100%",
          fontFamily: "monospace",
          padding: "12px",
          fontSize: "14px",
          resize: "vertical",
        }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={onSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default TextDocumentEditor;
