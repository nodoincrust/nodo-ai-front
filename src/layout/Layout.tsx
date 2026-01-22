import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import './Styles/Layout.scss'
import { LoaderOverlay } from "../CommonComponents/Loader/loader";
import Sidebar from "../CommonComponents/Sidebar/Sidebar";

const Layout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 992);
  const location = useLocation();

  // Hide sidebar for detail pages
  const isDetailPage =
    /^\/documents\/\d+$/.test(location.pathname) ||
    /^\/awaitingApproval\/\d+$/.test(location.pathname)||
  /^\/bouquet\/documents\/\d+$/.test(location.pathname)||
    /^\/sharedworkspace\/documents\/\d+$/.test(location.pathname);

  const shouldShowSidebar = !isDetailPage;

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
        {shouldShowSidebar && (
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        )}
        <main className={`flex-grow-1 overflow-auto layout-main ${shouldShowSidebar ? (isOpen ? "sidebar-open" : "sidebar-collapsed") : "no-sidebar"}`}>
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