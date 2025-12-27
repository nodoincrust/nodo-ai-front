import { notification } from "antd";

export const useAppNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const notify = {
    success: (title: string, description?: string) =>
      api.success({
        message: title,
        description,
        placement: "topRight",
        showProgress: true,
        pauseOnHover: true,
        style:{
            background:"$success"
        }
      }),

    error: (title: string, description?: string) =>
      api.error({
        message: title,
        description,
        placement: "topRight",
        showProgress: true,
        pauseOnHover: true,
         style:{
            background:"$danger"
        }
      }),

    info: (title: string, description?: string) =>
      api.info({
        message: title,
        description,
        placement: "topRight",
        showProgress: true,
        pauseOnHover: true,
      }),
  };

  return { notify, contextHolder };
};
