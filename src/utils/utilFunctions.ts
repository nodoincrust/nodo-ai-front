export const scrollLayoutToTop = () => {
  const layoutMain = document.querySelector<HTMLElement>(".layout-main");
  layoutMain?.scrollTo({ top: 0, behavior: "smooth" });
};
// --- File: src/utils/formUtils.ts ---
import dayjs, { Dayjs } from "dayjs";
import { ApiFilters, Filters } from "../types/common";
import { MESSAGES } from "./Messages";

// --- Filters ---
// --- Field Validators ---

// Get initials from full name
export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAvatarColorClass = (value: string, totalColors = 4) => {
  if (!value) return "color-1";

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % totalColors;
  return `color-${colorIndex + 1}`;
};

// --- Compare Filters (for equality) ---
export const filtersAreEqual = (a: Filters, b: Filters): boolean => {
  const keys: (keyof Filters)[] = [
    "Category",
    "Status",
    "Order Status",
    "University Name",
    "Rating",
    "Featured",
    "Date",
  ];

  return keys.every((key) => {
    if (key === "Date") {
      const dateA = a.Date || [];
      const dateB = b.Date || [];
      return (dateA[0] || "") === (dateB[0] || "") && (dateA[1] || "") === (dateB[1] || "");
    } else {
      const arrA = a[key] || [];
      const arrB = b[key] || [];
      if (arrA.length !== arrB.length) return false;
      return arrA.every((val, i) => val === arrB[i]);
    }
  });
};

// --- Clear a Specific Filter Tab ---
export const clearFilterTab = (
  tab: keyof Filters,
  setSelectedFilters: React.Dispatch<React.SetStateAction<Filters>>
) => {
  setSelectedFilters((prev) => ({ ...prev, [tab]: [] }));
};

// --- Build API Payload Filters (final payload.filters) ---
export const buildFiltersPayload = (filters: Filters): Record<string, any> => {
  const payload: Record<string, any> = {};

  for (const key in filters) {
    const value = filters[key];
    if (!value) continue;

    // --- Status ---
    if (key === "Status" && Array.isArray(value)) {
      const statusArray = value as string[];
      payload["status"] =
        statusArray.length === 0
          ? null
          : statusArray.includes("Active") && !statusArray.includes("Inactive")
            ? true
            : !statusArray.includes("Active") && statusArray.includes("Inactive")
              ? false
              : null;
    }

    else if (key === "Worker Category" && Array.isArray(value)) {
      payload.worker_category = (value as any[]).map(v => v.value);
    }

    // --- Project Name, Role Name, Role Permissions, Vendor ---
    else if (
      (key === "Project Name" ||
        key === "Role Name" ||
        key === "Role Permissions" ||
        key === "Vendor Name" ||
        key === "Device List") &&
      Array.isArray(value)
    ) {
      payload[
        key === "Project Name"
          ? "locations"
          : key === "Role Name"
            ? "role_id"
            : key === "Role Permissions"
              ? "modules"
              : key === "Vendor Name"
                ? "vendor_id"
                : "device_id"
      ] = value.map((v: any) => {
        if (typeof v === "object" && v !== null && "id" in v) return Number(v.id);
        if (typeof v === "string") return Number(v);
        return v;
      });
    }

    // --- Date ---
    else if (key === "Date" && Array.isArray(value)) {
      // If value is an array of 2 strings
      if (
        value.length === 2 &&
        typeof value[0] === "string" &&
        typeof value[1] === "string"
      ) {
        payload["Date"] = [
          {
            from_date: value[0],
            to_date: value[1],
          },
        ];
      }
      // If value is already in object format [{ from_date, to_date }]
      else if (
        value.length === 1 &&
        typeof value[0] === "object" &&
        "from_date" in value[0] &&
        "to_date" in value[0]
      ) {
        payload["Date"] = [
          {
            from_date: value[0].from_date,
            to_date: value[0].to_date,
          },
        ];
      }
    }
  }

  return payload;
};

// --- File: src/pages/Auth/Components/Login.tsx ---
// --- Password Validator ---
export const validatePassword = (value: string): string => {
  if (!value) return MESSAGES.ERRORS.PASSWORD_REQUIRED;
  if (value.length < 8) return MESSAGES.ERRORS.PASSWORD_MIN_LENGTH.replace("{min}", "8");
  if (/\s/.test(value)) return MESSAGES.ERRORS.PASSWORD_NO_SPACES;
  if (!/(?=.*[a-z])/.test(value) ||
    !/(?=.*[A-Z])/.test(value) ||
    !/(?=.*\d)/.test(value) ||
    !/(?=.*[@$!%*?&^#()_+=[\]{}|\\:;\"'<>,.?/~`-])/.test(value))
    return MESSAGES.ERRORS.PASSWORD_COMPLEXITY;
  return "";
};

export const validateEmail = (value: string) => {
  if (!value) return MESSAGES.ERRORS.EMAIL_REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return MESSAGES.ERRORS.INVALID_EMAIL;
  return "";
};

export const allowOnlyNumbersInput = (value: any) => {
  return value.replace(/[^0-9]/g, "");
};
// Allow only A-Z (no numbers, no special chars)
export const validateOnlyChars = (value: string) => {
  if (!value) return true;
  const regex = /^[A-Za-z]+$/;
  return regex.test(value);
};

// Allow only 0-9 digits
export const validateOnlyNumbers = (value: string) => {
  if (!value) return true;
  const regex = /^[0-9]+$/;
  return regex.test(value);
};

export const formatError = (msg: string) => {
  if (!msg) return msg;
  return msg.charAt(0).toUpperCase() + msg.slice(1).toLowerCase();
};

export const formatAmount = (value: any) => {
  if (value === null || value === undefined || value === "") return "-";

  const num = Number(value);
  if (isNaN(num)) return "-";

  // Format normally with comma + 2 decimals
  let formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // If ends with .00 → remove decimals completely
  if (formatted.endsWith(".00")) {
    formatted = formatted.replace(".00", "");
  }

  return `₹ ${formatted}`;
};


//Preview Form Number 11 and Undertaking of Worker
export const fixBase64 = (base64: string) => {
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
};

export const base64ToBlob = (base64: string, contentType: string) => {
  const byteCharacters = atob(fixBase64(base64));
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);

    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};