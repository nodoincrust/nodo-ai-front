import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../../assets/images/logo.svg";
import collapseIcon from "../../assets/images/collapse.svg";
import alignLeftIcon from "../../assets/images/align-left.svg";
import userRoundedIcon from "../../assets/images/user-rounded.svg";
import logoutIcon from "../../assets/images/logout.svg";
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

  // Company Dashboard sub-menus
  const isCompanyDashboard = location.pathname.startsWith("/comapnyDashboard");
  const companyDashboardMenus = [
    {
      path: "/comapnyDashboard/departments",
      label: "Departments",
      iconActive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M9 22V12H15V22' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
      iconInactive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M9 22V12H15V22' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
    },
    {
      path: "/comapnyDashboard/users",
      label: "Users",
      iconActive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
      iconInactive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
    },
    {
      path: "/comapnyDashboard/projects",
      label: "Projects",
      iconActive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 2L2 7L12 12L22 7L12 2Z' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 17L12 22L22 17' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 12L12 17L22 12' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
      iconInactive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 2L2 7L12 12L22 7L12 2Z' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 17L12 22L22 17' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 12L12 17L22 12' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
    },
    {
      path: "/comapnyDashboard/tasks",
      label: "Tasks",
      iconActive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M9 11L12 14L22 4' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16' stroke='%23437EF7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
      iconInactive: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M9 11L12 14L22 4' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
    },
  ];

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
            src={logoIcon}
            alt="Logo"
            onClick={() => navigate("/")}
            className={isMobile || isOpen ? "logo-full" : "logo-icon"}
          />
       
          {isMobile ? (
            <div className="mobile-toggle" onClick={toggleSidebar}>
              <img
                src={collapseIcon}
                alt="Menu"
                className={`icon menu ${isOpen ? "hidden" : "visible"}`}
              />
              <img
                src={collapseIcon}
                alt="Close"
                className={`icon close ${isOpen ? "visible" : "hidden"}`}
              />
            </div>
          ) : (
            <div className={`desktop-toggle ${!isOpen ? "absolute-toggle" : ""}`}>
            <img
              src={alignLeftIcon}
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

            {/* Company Dashboard Sub-menus */}
            {isCompanyDashboard &&
              companyDashboardMenus.map((item: any) => {
                const isActive = location.pathname === item.path;
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
                src={userRoundedIcon}
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
              <img src={logoutIcon} alt="Logout" />
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
