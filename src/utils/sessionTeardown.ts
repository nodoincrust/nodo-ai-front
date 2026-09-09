import { notification } from "antd";
import { getLoaderControl } from "../CommonComponents/Loader/loader";

const cleanupFns = new Set<() => void>();

let abortController = new AbortController();
let notificationsMuted = false;
let handlingUnauthorized = false;

export function getSessionAbortSignal(): AbortSignal {
  return abortController.signal;
}

/** Register a cancel fn for logout / 401 / page leave. Returns unregister. */
export function registerSessionCleanup(fn: () => void): () => void {
  cleanupFns.add(fn);
  return () => {
    cleanupFns.delete(fn);
  };
}

export function areSessionNotificationsMuted(): boolean {
  return notificationsMuted;
}

export function unmuteSessionNotifications(): void {
  notificationsMuted = false;
  handlingUnauthorized = false;
}

export function isUserAuthenticated(): boolean {
  try {
    const authDataRaw = localStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;
    if (authData?.token) return true;
  } catch {
    // ignore parse errors
  }
  return !!localStorage.getItem("accessToken");
}

export function isRequestAborted(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; name?: string };
  return (
    err.code === "ERR_CANCELED" ||
    err.name === "CanceledError" ||
    err.name === "AbortError"
  );
}

export type TeardownSessionOptions = {
  clearStorage?: boolean;
  showSessionExpiredToast?: boolean;
};

/**
 * Stops in-flight APIs, background timers, and toasts.
 * Used by manual logout and axios 401 handling.
 */
export function teardownSession(options: TeardownSessionOptions = {}): void {
  const { clearStorage = true, showSessionExpiredToast = false } = options;

  if (showSessionExpiredToast && handlingUnauthorized) {
    return;
  }
  if (showSessionExpiredToast) {
    handlingUnauthorized = true;
  }

  notificationsMuted = true;

  // 1) Abort pending axios requests, then allow future (login) calls
  abortController.abort();
  abortController = new AbortController();

  // 2) Cancel registered background timers / editors
  const pendingCleanups = [...cleanupFns];
  cleanupFns.clear();
  pendingCleanups.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore cleanup errors
    }
  });

  // 3) Clear all toasts
  notification.destroy();

  // 4) Clear storage
  if (clearStorage) {
    localStorage.clear();
    sessionStorage.clear();
  }

  getLoaderControl()?.hideLoader();

  // 5) Session-expired toast (after destroy; briefly unmute so wrapper allows it)
  if (showSessionExpiredToast) {
    notificationsMuted = false;
    notification.error({
      message: "Your session has expired. Please login again.",
      duration: 2,
    });
    notificationsMuted = true;
  }
}
