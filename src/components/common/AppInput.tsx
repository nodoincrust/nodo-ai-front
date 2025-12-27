import type { InputHTMLAttributes } from "react";
import "./AppInput.scss";

interface AppInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
}

const AppInput = ({
  label,
  error,
  touched,
  className = "",
  id,
  ...rest
}: AppInputProps) => {
  const showError = touched && !!error;

  return (
    <div className="app-input-wrapper">
      {label && (
        <label htmlFor={id} className="app-input-label">
          {label}
        </label>
      )}

      <input
        id={id}
        className={`form-control app-input ${
          showError ? "is-invalid" : ""
        } ${className}`}
        {...rest}
      />

      {showError && <div className="app-input-error">{error}</div>}
    </div>
  );
};

export default AppInput;
