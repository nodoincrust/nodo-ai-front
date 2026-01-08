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