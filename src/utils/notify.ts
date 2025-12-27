import { notification } from "antd";

export const notifySuccess = (message: string, description?: string) => {
  notification.success({
    message,
    description,
    placement: "topRight",
  });
};

export const notifyError = (message: string, description?: string) => {
  notification.error({
    message,
    description,
    placement: "topRight",
  });
};

export const notifyInfo = (message: string, description?: string) => {
  notification.info({
    message,
    description,
    placement: "topRight",
  });
};

export const notifyWarning = (message: string, description?: string) => {
  notification.warning({
    message,
    description,
    placement: "topRight",
  });
};
