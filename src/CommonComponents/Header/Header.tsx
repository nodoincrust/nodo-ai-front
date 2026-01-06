import React from "react";
import { Input, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import PrimaryButton from "../Buttons/PrimaryButton";
import "./Styles/Header.scss";
import type { HeaderProps } from "../../types/common";

const Header: React.FC<HeaderProps> = ({
  title,
  count,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onAddClick,
  addButtonText,
  categoryMenu,
  categoryButtonText,
  categoryButtonClassName,
  categoryButtonTextClassName,
  searchPlaceholder,
}) => {
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

        {categoryMenu && categoryButtonText && (
          <Dropdown
            menu={categoryMenu}
            trigger={["click"]}
          >
            <div className={categoryButtonClassName}>
              <span className={categoryButtonTextClassName}>
                {categoryButtonText}
              </span>
              <DownOutlined />
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Header;