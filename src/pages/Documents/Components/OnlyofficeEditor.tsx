import { useEffect, useRef } from "react";
import { notification } from "antd";
import { config } from "../../../config";
 
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
 
    let injectedScript: HTMLScriptElement | null = null;
    let destroyed = false;
 
    const candidates = [
      // editor?.documentServerUrl,
      config.docScriptUrl,
      // config.docBaseUrl,
    ].filter(Boolean) as string[];
 
    const loadScriptFrom = (base: string, retries = 2) =>
      new Promise<boolean>((resolve) => {
        const baseUrl = base.replace(/\/$/, "");
        const scriptUrl = `${baseUrl}/web-apps/apps/api/documents/api.js`;
 
        // Already present? consider it success
        if (document.querySelector(`script[src="${scriptUrl}"]`)) {
          console.info(`[OnlyOffice] script already present: ${scriptUrl}`);
          resolve(true);
          return;
        }
 
        let attempt = 0;
 
        const tryAttach = () => {
          if (destroyed) return resolve(false);
 
          if (injectedScript && injectedScript.parentNode) {
            injectedScript.parentNode.removeChild(injectedScript);
            injectedScript = null;
          }
 
          injectedScript = document.createElement("script");
          injectedScript.src = scriptUrl;
          injectedScript.async = true;
 
          injectedScript.onload = () => {
            console.info(`[OnlyOffice] loaded client script from ${scriptUrl}`);
            resolve(true);
          };
 
          injectedScript.onerror = () => {
            console.warn(`[OnlyOffice] failed to load client script from ${scriptUrl} (attempt ${attempt + 1})`);
            attempt += 1;
            if (attempt <= retries) {
              const backoff = attempt === 1 ? 500 : 1500;
              setTimeout(tryAttach, backoff);
            } else {
              // final failure for this candidate
              if (injectedScript && injectedScript.parentNode) injectedScript.parentNode.removeChild(injectedScript);
              injectedScript = null;
              resolve(false);
            }
          };
 
          document.body.appendChild(injectedScript);
        };
 
        tryAttach();
      });
 
    const ensureScript = async () => {
      for (const base of candidates) {
        const ok = await loadScriptFrom(base, 2);
        if (ok) return true;
      }
      return false;
    };
 
    ensureScript().then((ok) => {
      if (!ok) {
        console.error(`[OnlyOffice] all candidate script hosts failed: ${candidates.join(", ")}`);
        notification.error({ message: "OnlyOffice script failed to load", description: "Could not load the editor client script from configured Document Server hosts." });
      }
    });
 
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
      destroyed = true;
      clearInterval(interval);
      if (instanceRef.current) {
        instanceRef.current.destroyEditor();
        instanceRef.current = null;
      }
      if (injectedScript && injectedScript.parentNode) {
        injectedScript.parentNode.removeChild(injectedScript);
        injectedScript = null;
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
 