import React, { useState } from "react";
import { Input, Dropdown, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import "./Styles/Header.scss";
import { statusItems, StatusType, type HeaderProps } from "../../types/common";
import { getRoleFromToken } from "../../utils/jwt";
import { getIsDepartmentHeadFromToken } from "../../utils/utilFunctions";

const Header: React.FC<HeaderProps> = ({
  title,
breadcrumb,
  count,
  searchValue,
  onSearchChange,
  onAddClick,
  addButtonText,
  categoryMenu,
  categoryButtonText,
  categoryButtonClassName,
  categoryButtonTextClassName,
  searchPlaceholder,
  showDropdown = false,
  status = "ALL",
  onStatusChange,
  documentFilterValue,
  onDocumentFilterChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [documentDropdownOpen, setDocumentDropdownOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = token ? getRoleFromToken(token) : null;
  const isCOMPANYADMIN = role === "COMPANY_ADMIN";
  const isDepartmentHead = token ? getIsDepartmentHeadFromToken(token) : false;

  const shouldShowDocumentFilter = isCOMPANYADMIN || isDepartmentHead;
  const navigate = useNavigate();

  const menu: MenuProps["items"] = statusItems.map((item) => ({
    key: item.key,
    label: item.label,
  }));

  const documentFilterOptions: MenuProps["items"] = [
    { key: "MY_DOCUMENTS", label: "My Documents" },
    { key: "AWAITING", label: "Awaiting Approval" },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onStatusChange && onStatusChange(key as StatusType);
  };

  const handleDocumentFilterClick: MenuProps["onClick"] = ({ key }) => {
    onDocumentFilterChange &&
      onDocumentFilterChange(key as "MY_DOCUMENTS" | "AWAITING");
  };
  return (
    <div className="language-header">
      {/* TOP ROW */}
      <div className="language-header-top">
        <div className="language-title-count">
          {/* <h2 className="language-title">{title}</h2> */}
          <div className="language-title-wrapper">
            {breadcrumb ? (
              <div className="breadcrumb-title">
                <span
                  className={`breadcrumb-link ${
                    breadcrumb.parentPath ? "clickable" : ""
                  }`}
                  onClick={() =>
                    breadcrumb.parentPath && navigate(breadcrumb.parentPath, {
                      state: breadcrumb.parentState,
                    })
                  }
                >
                  {breadcrumb.parent}
                </span>

                {breadcrumb.current && (
                  <>
                    <span className="breadcrumb-separator"> / </span>
                    <span className="breadcrumb-current">
                      {breadcrumb.current}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <h2 className="language-title">{title}</h2>
            )}
          </div>

          {count !== undefined && (
            <span className="language-count">{count}</span>
          )}
        </div>

        {onAddClick && addButtonText &&  documentFilterValue !== "AWAITING"  && (
          <PrimaryButton
            text={addButtonText}
            imgSrc="/assets/plus-02.svg"
            onClick={onAddClick}
            className="primary-btn"
          />
        )}
      </div>

      {/* ACTION ROW */}
      <div className="language-header-actions">
        {/* SEARCH on the LEFT */}
        {onSearchChange && (
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || "Search"}
            prefix={<img src="/assets/search.svg" alt="Search" />}
            className="search-input"
          />
        )}

        {/* DROPDOWNS on the RIGHT */}
        <div className="dropdowns-wrapper">
          {/* NEW DOCUMENT FILTER DROPDOWN */}
          {onDocumentFilterChange && shouldShowDocumentFilter && (
            <Dropdown
              menu={{
                items: documentFilterOptions,
                selectable: true,
                selectedKeys: [documentFilterValue || "MY_DOCUMENTS"],
                onClick: handleDocumentFilterClick,
              }}
              trigger={["click"]}
              open={documentDropdownOpen}
              onOpenChange={setDocumentDropdownOpen}
            >
              <div
                className={`status-dropdown ${
                  documentFilterValue === "MY_DOCUMENTS" ||
                  documentFilterValue === "AWAITING"
                    ? "status-dropdown--selected"
                    : ""
                }`}
              >
                <span className="status-title">
                  {documentFilterValue === "AWAITING"
                    ? "Awaiting Approval"
                    : "My Documents"}
                </span>
                <img
                  src="/assets/chevron-down.svg"
                  alt="arrow"
                  style={{
                    width: 24,
                    height: 24,
                    transition: "transform 0.2s ease",
                    transform: documentDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>
            </Dropdown>
          )}

          {/* EXISTING STATUS DROPDOWN */}
          {showDropdown && onStatusChange && (
            <Dropdown
              menu={{
                items: menu,
                selectable: true,
                selectedKeys: [status.toUpperCase() || "all"],
                onClick: handleMenuClick,
              }}
              trigger={["click"]}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <div
                className={`status-dropdown ${
                  status !== "all" ? "status-dropdown--selected" : ""
                }`}
              >
                <span className="status-title">
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <img
                  src="/assets/chevron-down.svg"
                  alt="arrow"
                  style={{
                    width: 24,
                    height: 24,
                    transition: "transform 0.2s ease",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>
            </Dropdown>
          )}

          {categoryMenu && !showDropdown && (
            <Dropdown
              menu={categoryMenu}
              trigger={["click"]}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <div
                className={`${categoryButtonClassName || "status-dropdown"} ${
                  categoryMenu.selectedKeys &&
                  categoryMenu.selectedKeys.length > 0 &&
                  categoryMenu.selectedKeys[0].toUpperCase() !== "ALL"
                    ? "status-dropdown--selected"
                    : ""
                }`}
              >
                <span className={categoryButtonTextClassName || "status-title"}>
                  {categoryButtonText
                    ?.replace("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>

                <img
                  src="/assets/chevron-down.svg"
                  alt="arrow"
                  style={{
                    width: 24,
                    height: 24,
                    transition: "transform 0.2s ease",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
