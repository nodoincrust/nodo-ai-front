import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "../SideLayout/sidebar";
import "./DashboardLayout.scss";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex flex-column layout-container">
      <div className="d-flex flex-grow-1">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`flex-grow-1 overflow-auto layout-main ${
            isOpen ? "sidebar-open" : "sidebar-collapsed"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

