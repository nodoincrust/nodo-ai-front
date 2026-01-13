import React, { useState } from "react";
import { Input, Dropdown, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import "./Styles/Header.scss";
import { statusItems, StatusType, type HeaderProps } from "../../types/common";
import { getRoleFromToken } from "../../utils/jwt";
import { getIsDepartmentHeadFromToken } from "../../utils/utilFunctions";

const Header: React.FC<HeaderProps> = ({
  title,
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
  status = "all",
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

  const menu: MenuProps["items"] = statusItems.map((item) => ({
    key: item.key,
    label: item.label,
  }));

  const documentFilterOptions: MenuProps["items"] = [
    { key: "MY_DOCUMENTS", label: "Documents" },
    { key: "AWAITING", label: "Awaiting Approval" },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onStatusChange && onStatusChange(key as StatusType);
  };

  const handleDocumentFilterClick: MenuProps["onClick"] = ({ key }) => {
    onDocumentFilterChange && onDocumentFilterChange(key as "MY_DOCUMENTS" | "AWAITING");
  };
  return (
    <div className="language-header">
      {/* TOP ROW */}
      <div className="language-header-top">
        <div className="language-title-count">
          <h2 className="language-title">{title}</h2>
          {count !== undefined && (
            <span className="language-count">{count}</span>
          )}
        </div>

        {onAddClick && addButtonText && (
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
              menu={{ items: documentFilterOptions, selectable: true, onClick: handleDocumentFilterClick }}
              trigger={["click"]}
              open={documentDropdownOpen}
              onOpenChange={setDocumentDropdownOpen}
            >
              <div
                className={`status-dropdown ${documentFilterValue ? "status-dropdown--selected" : ""
                  }`}
              >
                <span className="status-title">
                  {documentFilterValue === "MY_DOCUMENTS" ? "Documents" : "Awaiting Approval"}
                </span>
                <img
                  src="/assets/chevron-down.svg"
                  alt="arrow"
                  style={{
                    width: 24,
                    height: 24,
                    transition: "transform 0.2s ease",
                    transform: documentDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </div>
            </Dropdown>
          )}

          {/* EXISTING STATUS DROPDOWN */}
          {showDropdown && onStatusChange && (
            <Dropdown
              menu={{ items: menu, selectable: true, selectedKeys: [status], onClick: handleMenuClick }}
              trigger={["click"]}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <div
                className={`status-dropdown ${status !== "all" ? "status-dropdown--selected" : ""
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
                className={`${categoryButtonClassName || "status-dropdown"} ${categoryMenu.selectedKeys &&
                  categoryMenu.selectedKeys[0] !== "ALL"
                  ? "status-dropdown--selected"
                  : ""
                  }`}
              >
                <span className={categoryButtonTextClassName || "status-title"}>
                  {categoryButtonText}
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