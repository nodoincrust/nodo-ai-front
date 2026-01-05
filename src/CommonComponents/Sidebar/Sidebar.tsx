import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Styles/sidebar.scss";
import { AuthData, SidebarItem, SidebarProps } from "../../types/common";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const disabledLinks = ["/dashboard"];
  // =======================
  // READ AUTH DATA
  // =======================
  const authData: AuthData = JSON.parse(localStorage.getItem("authData") || "{}");
  const sidebarItems: SidebarItem[] = authData.sidebar || [];


  const loggedInUserEmail = authData.user?.email;
  const loggedInUserName = authData.user?.name
    ? authData.user.name
      .split(" ")
      .map((w: any) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
    : "User";
  const userInitials = authData.user?.name
    ? authData.user.name
      .split(" ")
      .slice(0, 2) // first two words
      .map((word: any) => word.charAt(0).toUpperCase())
      .join("")
    : "";


  // =======================
  // TOGGLE SIDEBAR
  // =======================
  const toggleSidebar = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 300);
    } else {
      setIsOpen(true);
    }
  };

  // =======================
  // RESPONSIVE HANDLING
  // =======================
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
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobile, isOpen]);

  // =======================
  // CLEAR FILTER SESSION
  // =======================
  const clearFilterSession = () => {
    sessionStorage.removeItem("appliedFilters");
    sessionStorage.removeItem("apiAppliedFilters");
  };

  // =======================
  // LOGOUT
  // =======================
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authData");
    localStorage.removeItem("token");
    localStorage.removeItem("userDetails");
    
    // Clear session storage
    sessionStorage.clear();
    
    // Close modal
    setShowLogoutModal(false);
    
    // Navigate to login
    navigate("/", { replace: true });
  };


  return (
    <>
      <div className={`sidebar-wrapper ${isOpen ? "open" : "collapsed"}`}>
        {/* LOGO + TOGGLE */}
        <div className="fixed-logo">
          <img
            src={isMobile || isOpen ? "/assets/logo-full.svg" : "/assets/Main-Logo.svg"}
            alt="Logo"
            className={isMobile || isOpen ? "logo-full" : "logo-icon"}
            onClick={() => navigate("/")}
          />

          {isMobile ? (
            <div className="mobile-toggle" onClick={toggleSidebar}>
              <img
                src="/assets/menu-01.svg"
                alt="Menu"
                className={`icon menu ${isOpen ? "hidden" : "visible"}`}
              />
              <img
                src="/assets/x-02.svg"
                alt="Close"
                className={`icon close ${isOpen ? "visible" : "hidden"}`}
              />
            </div>
          ) : (
            <img
              src="/assets/Icon-collapse.svg"
              alt="Toggle Sidebar"
              className={`desktop-toggle ${!isOpen ? "absolute-toggle" : ""}`}
              onClick={toggleSidebar}
            />
          )}
        </div>

        {/* SIDEBAR */}
        <div className={`sidebar ${isOpen ? "open" : ""} ${isClosing ? "closing" : ""}`}>
          <nav className="menu-list flex-column">
            {sidebarItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const isDisabled = disabledLinks.includes(item.path);

              if (isDisabled) {
                return (
                  <span
                    key={item.id}
                    className="menu-item disabled"
                    onClick={(e) => e.preventDefault()} // prevent navigation
                  >
                    {item.icon ? (
                      <span
                        className="menu-icon disabled-icon"
                        dangerouslySetInnerHTML={{ __html: item.icon }}
                      />
                    ) : (
                      <span className="menu-dot" />
                    )}
                    <span className="menu-label">{item.label}</span>
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`menu-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    clearFilterSession();
                    if (isMobile) toggleSidebar();
                  }}
                >
                  {item.icon ? (
                    <span
                      className="menu-icon"
                      dangerouslySetInnerHTML={{
                        __html: isActive && item.icon_active ? item.icon_active : item.icon,
                      }}
                    />
                  ) : (
                    <span className="menu-dot" />
                  )}
                  <span className="menu-label">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* BOTTOM */}
          <div className="bottom-div">
            <div className="menu-item profile-item">
              {/* <img src={userRoundedIcon} alt="Profile" /> */}
              <div className="profile-avatar">
                {userInitials}
              </div>
              <div className="profile-text">
                <span className="profile-name">{loggedInUserName}</span>
                <span className="profile-email">{loggedInUserEmail}</span>
              </div>
            </div>

            <button
              type="button"
              className={`logout-div ${showLogoutModal ? "modal-open-hover" : ""}`}
              onClick={() => setShowLogoutModal(true)}
            >
              <img src="/assets/logout.svg" alt="Logout" />
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${isOpen ? "show" : ""}`}
          onClick={toggleSidebar}
        />
      )}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>

            <div className="actions">
              <button onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="danger" onClick={handleLogout}>
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