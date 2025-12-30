import type { ReactNode } from "react";
import "./AuthLayout.scss";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-text">
            <h2 >NODO AI</h2>
            <h2 className="first-h2">Bring structure to complex documents</h2>
            <p>
              Upload reports, contracts, or spreadsheets and let NODO AI extract
              insights, summaries, and answers instantly.
            </p>
          </div>

          <div className="auth-illustration">
            <img
              src="/assets/hero.svg"
              alt="Auth"
            />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box-right">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
