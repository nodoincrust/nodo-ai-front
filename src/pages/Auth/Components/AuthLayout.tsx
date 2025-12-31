import React from "react";
import { Outlet } from "react-router-dom";
import "./Styles/AuthLayout.scss";

const AuthLayout: React.FC = () => {
    return (
        <div className="auth-layout">
            {/* LEFT SIDE */}
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-left-text">
                        <h2>NODO AI</h2>
                        <h2 className="first-h2">Bring structure to complex documents</h2>
                        <p>
                            Upload reports, contracts, or spreadsheets and let NODO AI extract
                            insights, summaries, and answers instantly.
                        </p>
                    </div>

                    <div className="auth-illustration">
                        <img src="/assets/hero.svg" alt="Auth Illustration" />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="auth-right">
                <div className="auth-box-right">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;