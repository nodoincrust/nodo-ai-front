import { MESSAGES } from "./Messages";

// --- Scroll to Top ---
export const scrollLayoutToTop = () => {
  const layoutMain = document.querySelector<HTMLElement>(".layout-main");
  layoutMain?.scrollTo({ top: 0, behavior: "smooth" });
};

export const scrollLayoutToBottom = () => {
  const chatMessages = document.querySelector<HTMLElement>(".chat-messages");

  if (!chatMessages) return;

  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
};

// --- Password Validator ---
// export const validatePassword = (value: string): string => {
//   if (!value) return MESSAGES.ERRORS.PASSWORD_REQUIRED;
//   if (value.length < 8) return MESSAGES.ERRORS.PASSWORD_MIN_LENGTH.replace("{min}", "8");
//   if (/\s/.test(value)) return MESSAGES.ERRORS.PASSWORD_NO_SPACES;
//   if (!/(?=.*[a-z])/.test(value) ||
//     !/(?=.*[A-Z])/.test(value) ||
//     !/(?=.*\d)/.test(value) ||
//     !/(?=.*[@$!%*?&^#()_+=[\]{}|\\:;\"'<>,.?/~`-])/.test(value))
//     return MESSAGES.ERRORS.PASSWORD_COMPLEXITY;
//   return "";
// };

// --- Email Validator ---
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

// Format error
export const formatError = (msg: string) => {
  if (!msg) return msg;
  return msg.charAt(0).toUpperCase() + msg.slice(1).toLowerCase();
};

// Get initials from full name
export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Get avatar color
export const getAvatarColorIndex = (seed: string | number) => {
  const str = String(seed);
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return (Math.abs(hash) % 4) + 1;
};

export const getIsDepartmentHeadFromToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Boolean(payload?.is_department_head);
  } catch {
    return false;
  }
};

export const getStatusClassFromText = (displayStatus?: string, status?: string) => {
  const text = (displayStatus || "").toLowerCase();

  // First, try direct matching with displayStatus text
  if (text.includes("reject")) return "rejected";
  if (text.includes("approve")) return "approved";
  if (text.includes("draft")) return "draft";
  if (text.includes("submit")) return "submitted";
  if (text.includes("pending")) return "pending";
  if (text.includes("await")) return "pending"; // for 'awaiting approval'
  if (text.includes("review")) return "in-review";

  // fallback to enum status (always uppercase)
  switch (status) {
    case "APPROVED": return "approved";
    case "REJECTED": return "rejected";
    case "DRAFT": return "draft";
    case "SUBMITTED": return "submitted";
    case "IN_REVIEW": return "in-review"; // this covers pending drafts
    case "PENDING": return "pending";     // explicitly cover PENDING
    default: return "pending";
  }
};

export const getDisplayStatus = (value?: string) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
};

