import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import './Styles/Layout.scss'
import { LoaderOverlay } from "../CommonComponents/Loader/loader";
import Sidebar from "../CommonComponents/Sidebar/Sidebar";

const Layout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    setLoading(false);
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <LoaderOverlay />;
  }

  return (
    <div className="d-flex flex-column layout-container">
      {/* <Header /> */}
      <div className="d-flex flex-grow-1">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className={`flex-grow-1 overflow-auto layout-main ${isOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
          <Container fluid className="p-0 content-container">
            <Outlet />
          </Container>
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;