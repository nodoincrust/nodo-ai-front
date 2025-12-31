import { notification } from "antd";
import './css/notificationWrapper.scss'
import type { ArgsProps } from "antd/es/notification";

// Default config
notification.config({
    placement: "top",
    duration: 3,
});

// Helper: apply progress duration CSS variable
const withProgressDuration = (config: ArgsProps) => {
    const duration = (config.duration ?? 3) + "s";
    return {
        ...config,
        className: `custom-notification ${config.className || ""}`,
        style: {
            ...(config.style || {}),
            ["--progress-duration" as string]: duration,
        },
        onClose: () => {
            // Trigger slide up animation when closing
            const notices = document.querySelectorAll('.custom-notification');
            notices.forEach(n => {
                n.classList.add('slide-up');
            });
        }
    };
};

// Preserve originals
const originalSuccess = notification.success;
const originalError = notification.error;
const originalInfo = notification.info;
const originalWarning = notification.warning;

notification.success = (config) => {
    notification.destroy();
    return originalSuccess(withProgressDuration({ ...config, className: "success" }));
};
notification.error = (config) => {
    notification.destroy();
    return originalError(withProgressDuration({ ...config, className: "error" }));
};
notification.info = (config) => {
    notification.destroy();
    return originalInfo(withProgressDuration({ ...config, className: "info" }));
};
notification.warning = (config) => {
    notification.destroy();
    return originalWarning(withProgressDuration({ ...config, className: "warning" }));
};

export default notification;
