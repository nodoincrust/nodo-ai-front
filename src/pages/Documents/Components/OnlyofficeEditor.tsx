import { useEffect, useRef } from "react";
 
declare global {
  interface Window {
    DocsAPI: any;
  }
}
 
interface OnlyOfficeEditorProps {
  editor: {
    documentServerUrl?: string;
    document: any;
    editorConfig: any;
    token: string;
  };
  canEdit: boolean;
}
 
const OnlyOfficeEditor: React.FC<OnlyOfficeEditorProps> = ({ editor }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
 
  useEffect(() => {
    const container = editorRef.current;
    if (!container) return;
 
    const interval = setInterval(() => {
      if (window.DocsAPI?.DocEditor) {
        clearInterval(interval);
 
        // cleanup old instance
        if (instanceRef.current) {
          instanceRef.current.destroyEditor();
          instanceRef.current = null;
        }
 
        // ONLYOFFICE FINAL CONFIG (DO NOT MUTATE BACKEND DATA)
        instanceRef.current = new window.DocsAPI.DocEditor(container.id, {
          type: "desktop", // REQUIRED FOR FULL TOOLBAR
 
          width: "100%",
          height: "100%",
 
          document: editor.document,        // from backend (signed)
          editorConfig: editor.editorConfig, // from backend (signed)
          token: editor.token,              // JWT from backend
        });
      }
    }, 100);
 
    return () => {
      clearInterval(interval);
      if (instanceRef.current) {
        instanceRef.current.destroyEditor();
        instanceRef.current = null;
      }
    };
  }, [editor]);
 
  return (
<div
      id="onlyoffice-editor"
      ref={editorRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#f5f5f5",
      }}
    />
  );
};
 
export default OnlyOfficeEditor;