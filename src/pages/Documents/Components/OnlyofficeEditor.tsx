import { useEffect, useId, useRef } from "react";
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
  const containerId = `onlyoffice-editor-${useId().replace(/:/g, "")}`;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const unmountedRef = useRef(false);
  const cleanupStartedRef = useRef(false);

  const destroyEditorInstance = () => {
    if (cleanupStartedRef.current) return;
    cleanupStartedRef.current = true;

    try {
      if (instanceRef.current) {
        instanceRef.current.destroyEditor();
        instanceRef.current = null;
      }
    } catch (err) {
      console.warn("[OnlyOffice] destroyEditor failed:", err);
    }
  };

  useEffect(() => {
    unmountedRef.current = false;
    cleanupStartedRef.current = false;

    const container = editorRef.current;
    if (!container) return;

    const candidates = [config.docScriptUrl].filter(Boolean) as string[];

    const loadScriptFrom = (base: string, retries = 2) =>
      new Promise<boolean>((resolve) => {
        const baseUrl = base.replace(/\/$/, "");
        const scriptUrl = `${baseUrl}/web-apps/apps/api/documents/api.js`;

        if (document.querySelector(`script[src="${scriptUrl}"]`)) {
          resolve(true);
          return;
        }

        let attempt = 0;

        const tryAttach = () => {
          if (unmountedRef.current) {
            resolve(false);
            return;
          }

          const script = document.createElement("script");
          script.src = scriptUrl;
          script.async = true;

          script.onload = () => resolve(true);

          script.onerror = () => {
            attempt += 1;
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
            if (attempt <= retries) {
              const backoff = attempt === 1 ? 500 : 1500;
              setTimeout(tryAttach, backoff);
            } else {
              resolve(false);
            }
          };

          document.body.appendChild(script);
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

    void ensureScript().then((ok) => {
      if (!ok && !unmountedRef.current) {
        notification.error({
          message: "OnlyOffice script failed to load",
          description:
            "Could not load the editor client script from configured Document Server hosts.",
        });
      }
    });

    const interval = setInterval(() => {
      if (unmountedRef.current) {
        clearInterval(interval);
        return;
      }

      if (window.DocsAPI?.DocEditor) {
        clearInterval(interval);

        if (unmountedRef.current || cleanupStartedRef.current) return;

        instanceRef.current = new window.DocsAPI.DocEditor(container.id, {
          type: "desktop",
          width: "100%",
          height: "100%",
          document: editor.document,
          editorConfig: editor.editorConfig,
          token: editor.token,
        });
      }
    }, 100);

    return () => {
      unmountedRef.current = true;
      clearInterval(interval);
      destroyEditorInstance();
    };
  }, [editor]);

  return (
    <div
      id={containerId}
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
