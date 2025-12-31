// loader.tsx
import React, { createContext, useState, useContext } from "react";
import { Spin } from "antd";

const LoaderContext = createContext({
  loading: false,
  showLoader: () => { },
  hideLoader: () => { },
});

let loaderControl: { showLoader: () => void; hideLoader: () => void } | null =
  null;
export const getLoaderControl = () => loaderControl;

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  loaderControl = { showLoader, hideLoader };

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {loading && <LoaderOverlay />} {/* auto render overlay */}
      {children}
    </LoaderContext.Provider>
  );
};

export const LoaderOverlay = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(255,255,255,0.5)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Spin />
  </div>
);

export const useLoader = () => useContext(LoaderContext);