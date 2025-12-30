import React, { useEffect, useState } from "react";
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

interface SidebarItem {
  id: number | string;
  label: string;
  path: string;
  icon?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* =======================
     READ DATA FROM STORAGE
  ======================= */
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");

  const sidebarItems: SidebarItem[] = authData?.sidebar || [];
  const loggedInUserName = authData?.user_name || "User";

  /* =======================
     SIDEBAR TOGGLE
  ======================= */
  const toggleSidebar = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 300);
    } else {
      setIsOpen(true);
    }
  };

  /* =======================
     RESPONSIVE HANDLING
  ======================= */
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
    document.body.style.overflow = isMobile && isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  /* =======================
     CLEAR SESSION FILTERS
  ======================= */
  const clearFilterSession = () => {
    sessionStorage.removeItem("appliedFilters");
    sessionStorage.removeItem("apiAppliedFilters");
  };

  /* =======================
     LOGOUT
  ======================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      <div className={`sidebar-wrapper ${isOpen ? "open" : "collapsed"}`}>
        {/* LOGO */}
        <div className="fixed-logo">
          <img
            src={logoIcon}
            alt="Logo"
            className={isMobile || isOpen ? "logo-full" : "logo-icon"}
            onClick={() => navigate("/")}
          />

          {isMobile ? (
            <div className="mobile-toggle" onClick={toggleSidebar}>
              <img src={collapseIcon} alt="Menu" />
            </div>
          ) : (
            <div className={`desktop-toggle ${!isOpen ? "absolute-toggle" : ""}`}>
              <img
                src={alignLeftIcon}
                alt="Toggle"
                className="img-toggle"
                onClick={toggleSidebar}
              />
            </div>
          )}
        </div>

        {/* MENU */}
        <div
          className={`sidebar ${isOpen ? "open" : ""} ${isClosing ? "closing" : ""
            }`}
        >
          <nav className="menu-list">
            {sidebarItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

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
                    <img src={item.icon} alt={item.label} />
                  ) : (
                    <span className="menu-dot" />
                  )}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* BOTTOM */}
          <div className="bottom-div">
            <div className="menu-item profile-item">
              <img src={userRoundedIcon} alt="Profile" />
              <span>{loggedInUserName}</span>
            </div>

            <button
              type="button"
              className="logout-div"
              onClick={() => setShowLogoutModal(true)}
            >
              <img src={logoutIcon} alt="Logout" />
              <span>Logout</span>
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