import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { notification } from "antd";
import { config } from "../../../config";

declare global {
  interface Window {
    DocsAPI: any;
  }
}

export interface OnlyOfficeEditorHandle {
  destroy: () => void;
}

interface OnlyOfficeEditorProps {
  editor: {
    documentServerUrl?: string;
    document: any;
    editorConfig: any;
    token: string;
  };
  canEdit: boolean;
  /** When false, skips DocEditor init so the host can stay mounted but hidden. */
  isActive?: boolean;
}

const DOCS_API_POLL_MS = 100;
const DOCS_API_MAX_ATTEMPTS = 50;

const OnlyOfficeEditor = forwardRef<OnlyOfficeEditorHandle, OnlyOfficeEditorProps>(
  ({ editor, isActive = true }, ref) => {
    const containerId = `onlyoffice-editor-${useId().replace(/:/g, "")}`;
    const editorRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const unmountedRef = useRef(false);
    const destroyedRef = useRef(false);
    const cleanupStartedRef = useRef(false);

    const clearEditorInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

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

    const waitForDocsApi = () =>
      new Promise<boolean>((resolve) => {
        if (window.DocsAPI?.DocEditor) {
          resolve(true);
          return;
        }

        let attempts = 0;
        const poll = setInterval(() => {
          if (unmountedRef.current || destroyedRef.current) {
            clearInterval(poll);
            resolve(false);
            return;
          }

          if (window.DocsAPI?.DocEditor) {
            clearInterval(poll);
            resolve(true);
            return;
          }

          attempts += 1;
          if (attempts >= DOCS_API_MAX_ATTEMPTS) {
            clearInterval(poll);
            resolve(false);
          }
        }, DOCS_API_POLL_MS);
      });

    const loadScriptFrom = (base: string, retries = 2) =>
      new Promise<boolean>((resolve) => {
        const baseUrl = base.replace(/\/$/, "");
        const scriptUrl = `${baseUrl}/web-apps/apps/api/documents/api.js`;

        const waitAndResolve = async () => {
          const ready = await waitForDocsApi();
          resolve(ready);
        };

        if (document.querySelector(`script[src="${scriptUrl}"]`)) {
          void waitAndResolve();
          return;
        }

        let attempt = 0;

        const tryAttach = () => {
          if (unmountedRef.current || destroyedRef.current) {
            resolve(false);
            return;
          }

          const script = document.createElement("script");
          script.src = scriptUrl;
          script.async = true;

          script.onload = () => {
            void waitAndResolve();
          };

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

    useImperativeHandle(ref, () => ({
      destroy: () => {
        if (destroyedRef.current) return;
        destroyedRef.current = true;
        clearEditorInterval();
        destroyEditorInstance();
      },
    }));

    useEffect(() => {
      return () => {
        unmountedRef.current = true;
      };
    }, []);

    useEffect(() => {
      if (!isActive) {
        return;
      }

      unmountedRef.current = false;
      destroyedRef.current = false;
      cleanupStartedRef.current = false;

      const container = editorRef.current;
      if (!container) return;

      const candidates = [config.docScriptUrl].filter(Boolean) as string[];

      const ensureScript = async () => {
        for (const base of candidates) {
          const ok = await loadScriptFrom(base, 2);
          if (ok) return true;
        }
        return false;
      };

      void ensureScript().then((ok) => {
        if (!ok && !unmountedRef.current && !destroyedRef.current) {
          notification.error({
            message: "OnlyOffice script failed to load",
            description:
              "Could not load the editor client script from configured Document Server hosts.",
          });
        }
      });

      intervalRef.current = setInterval(() => {
        if (unmountedRef.current || destroyedRef.current) {
          clearEditorInterval();
          return;
        }

        if (!window.DocsAPI?.DocEditor) return;

        clearEditorInterval();

        if (
          unmountedRef.current ||
          destroyedRef.current ||
          cleanupStartedRef.current
        ) {
          return;
        }

        instanceRef.current = new window.DocsAPI.DocEditor(container.id, {
          type: "desktop",
          width: "100%",
          height: "100%",
          document: editor.document,
          editorConfig: editor.editorConfig,
          token: editor.token,
        });
      }, DOCS_API_POLL_MS);

      return () => {
        clearEditorInterval();
        destroyEditorInstance();
      };
    }, [editor, isActive]);

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
  },
);

OnlyOfficeEditor.displayName = "OnlyOfficeEditor";

export default OnlyOfficeEditor;
