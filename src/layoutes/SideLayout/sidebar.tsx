import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import "./sidebar.scss";

export interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get user details from localStorage
  const storedUserDetails = JSON.parse(
    localStorage.getItem("userDetails") || "{}"
  );
  const loggedInUserName = (storedUserDetails?.user?.name || "User")
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Get menus from userDetails
  const storedMenus = storedUserDetails?.menus || [];

  // Convert storedMenus to menuItems (excluding Super Admin)
  const menuItems = storedMenus.map((menu: any) => ({
    path: menu.module.url,
    label: menu.module.name,
    iconActive: `data:image/svg+xml;base64,${btoa(menu.module.logo)}`,
    iconInactive: `data:image/svg+xml;base64,${btoa(
      menu.module.nonselectedlogo
    )}`,
  }));

  const disabledLinks = ["/super-admin", "/device-", "/payment"];

  const toggleSidebar = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 300);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 992);
      setIsOpen(width >= 992);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // prevents iOS scroll
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobile, isOpen]);

  const clearFilterSession = () => {
    sessionStorage.removeItem("appliedFilters");
    sessionStorage.removeItem("apiAppliedFilters");
  };

  return (
    <>
      <div className={`sidebar-wrapper ${isOpen ? "open" : "collapsed"}`}>
        {/* Logo + toggle */}
        <div className="fixed-logo">
          <img
            src={
              isMobile || isOpen ? "/assets/Logo.svg" : "/assets/logo-Icon.svg"
            }
            alt="Logo"
            onClick={() => navigate("/")}
            className={isMobile || isOpen ? "logo-full" : "logo-icon"}
          />
          {isMobile ? (
            <div className="mobile-toggle" onClick={toggleSidebar}>
              <img
                src="src/assets/images/collapse.svg"
                alt="Menu"
                className={`icon menu ${isOpen ? "hidden" : "visible"}`}
              />
              <img
                src="src/assets/images/collapse.svg"
                alt="Close"
                className={`icon close ${isOpen ? "visible" : "hidden"}`}
              />
            </div>
          ) : (
            <div className={`desktop-toggle ${!isOpen ? "absolute-toggle" : ""}`}>
            <img
              src={
                isOpen
                  ? "src/assets/images/align-left.svg"
                  : "src/assets/images/align-left.svg"
              }
              alt="Toggle Sidebar"
              className="img-toggle"
              onClick={toggleSidebar}
            />
            </div>
          )}
        </div>

        {/* Sidebar menu */}
        <div
          className={`sidebar ${isOpen ? "open" : ""} ${
            isClosing ? "closing" : ""
          }`}
        >
          <nav className="menu-list flex-column">
            {menuItems.map((item: any) => {
              const isDisabled = disabledLinks.includes(item.path);
              const isActive = location.pathname.startsWith(item.path);

              if (isDisabled) {
                return (
                  <span
                    key={item.path}
                    className="menu-item disabled"
                    onClick={(e) => e.preventDefault()}
                  >
                    <img
                      src={item.iconInactive}
                      alt={item.label}
                      className="disabled-icon"
                    />
                    <span>{item.label}</span>
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`menu-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    clearFilterSession();
                    if (isMobile) toggleSidebar();
                  }}
                >
                  <img
                    src={isActive ? item.iconActive : item.iconInactive}
                    alt={item.label}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom div: Super Admin + Logout */}
          <div className="bottom-div">
            {/* <NavLink
              to="/super-admin"
              className={`menu-item ${location.pathname === "/super-admin" ? "active" : ""} ${disabledLinks.includes("/super-admin") ? "disabled" : ""
                }`}
              onClick={(e) => {
                if (disabledLinks.includes("/super-admin")) {
                  e.preventDefault();
                  return;
                }
                clearFilterSession();
                if (isMobile) toggleSidebar();
              }}
>
<img
                src={
                  location.pathname === "/super-admin"
                    ? "/assets/user-rounded-active.svg"
                    : "/assets/user-rounded.svg"
                }
                alt="Super Admin"
              />
<span>{loggedInUserName}</span>
</NavLink> */}

            {/* User Profile */}
            <div
              className={`menu-item profile-item ${
                showProfileModal ? "modal-open-hover" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                setShowProfileModal(true);
                clearFilterSession();
                if (isMobile) toggleSidebar();
              }}
            >
              <img
                src={
                  showProfileModal
                    ? "src/assets/images/user-rounded.svg"
                    : "src/assets/images/user-rounded.svg"
                }
                alt={loggedInUserName}
              />
              <span>{loggedInUserName || "User"}</span>
            </div>

            <button
              type="button"
              className={`logout-div ${
                showLogoutModal ? "modal-open-hover" : ""
              }`}
              onClick={() => setShowLogoutModal(true)}
            >
              <img src="src/assets/images/logout.svg" alt="Logout" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${isOpen ? "show" : ""}`}
          onClick={toggleSidebar}
        />
      )}

      {/* Profile */}
      {/* <Profile
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      /> */}
      {/* Logout functionality */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px" }}>Log Out</h3>
            <p style={{ marginBottom: "24px", color: "#667085" }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d0d5dd",
                  borderRadius: "6px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Remove any modal overlays that might be persisting
                  const modalOverlays = document.querySelectorAll('.app-modal-overlay');
                  modalOverlays.forEach(overlay => overlay.remove());
                  
                  // Remove any other modal overlays
                  const allOverlays = document.querySelectorAll('[style*="position: fixed"][style*="z-index"]');
                  allOverlays.forEach(overlay => {
                    const style = (overlay as HTMLElement).style;
                    if (style.position === 'fixed' && (style.zIndex === '999' || style.zIndex === '1000')) {
                      overlay.remove();
                    }
                  });
                  
                  // Reset body styles that might have been modified by modals
                  document.body.style.overflow = '';
                  document.body.style.touchAction = '';
                  
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#f04438",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
