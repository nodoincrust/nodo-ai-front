import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.scss"
import App from "./App";
import "./utils/Notification/notificationWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
const script = document.createElement("script");
script.src = "http://localhost:8080/web-apps/apps/api/documents/api.js";
script.async = true;
document.body.appendChild(script);