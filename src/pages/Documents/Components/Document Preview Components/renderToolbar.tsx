import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import type { ToolbarProps } from "@react-pdf-viewer/toolbar";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Flex } from "antd";

const renderToolbar = (Toolbar: (props: ToolbarProps) => React.ReactElement) => (
  <Toolbar>
    {(slots) => {
      const {
        CurrentPageInput,
        NumberOfPages,
        ZoomIn,
        ZoomOut,
  
        GoToNextPage,
        GoToPreviousPage,
      } = slots;

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 8px",
          }}
        >
          <GoToPreviousPage />
          <CurrentPageInput />
          <span>/</span>
          <NumberOfPages />
          <GoToNextPage />

          <div style={{ display:"flex", marginLeft: "auto" }}>
            <ZoomOut />

            <ZoomIn />
          </div>
        </div>
      );
    }}
  </Toolbar>
);
export default renderToolbar