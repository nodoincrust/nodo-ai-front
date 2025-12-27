import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./AppButton.scss";

type Variant = "primary" | "secondary" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const AppButton = ({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  children,
  ...rest
}: AppButtonProps) => {
  return (
    <button
      className={`btn app-btn app-btn--${variant} app-btn--${size} ${className}`}
      disabled={loading || disabled}
      {...rest}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" />
      )}
      {!loading && leftIcon}
      {/* Prefer explicit children, fall back to label prop for backwards compatibility */}
      {children ?? label}
      {!loading && rightIcon}
    </button>
  );
};

export default AppButton;
