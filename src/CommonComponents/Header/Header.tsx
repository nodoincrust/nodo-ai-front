import React, { useState } from "react";
import { Input, Dropdown, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import "./Styles/Header.scss";
import { statusItems, StatusType, type HeaderProps } from "../../types/common";

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
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menu: MenuProps["items"] = statusItems.map((item) => ({
    key: item.key,
    label: item.label,
  }));
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onStatusChange && onStatusChange(key as StatusType);
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
        {onSearchChange && (
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || "Search"}
            prefix={<img src="/assets/search.svg" alt="Search" />}
            className="search-input"
          />
        )}

        {showDropdown && onStatusChange && (
          <Dropdown
            menu={{ items: menu, selectedKeys: [status], onClick: handleMenuClick }}
            trigger={["click"]}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
          >
            <div className="status-dropdown">
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
      </div>
    </div>
  );
};

export default Header;