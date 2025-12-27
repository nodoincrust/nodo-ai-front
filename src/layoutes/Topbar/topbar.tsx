import { Link, useNavigate } from "react-router-dom";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import "./topbar.scss";
import searchIcon from "../../assets/images/search-normal.svg";
import addIcon from "../../assets/images/add.svg";

interface HeaderProps {
  title: string;
  secondaryButtonText?: string;
  secondaryButtonIcon?: string;
  onSecondaryButtonClick?: () => void;
  primaryButtonText?: string;
  primaryButtonIcon?: string;
  onPrimaryButtonClick?: () => void;
  syncButtonText?: string;
  syncButtonIcon?: string;
  onSyncClick?: () => void;
  breadcrumbLink?: string;
  breadcrumbIcon?: string;
  showBackArrow?: boolean;
  breadcrumbArrowIcon?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  count?: number;
  filterCount?: number;
}

const Header = ({
  title,
  secondaryButtonText,
  secondaryButtonIcon,
  onSecondaryButtonClick,
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryButtonClick,
  syncButtonText,
  syncButtonIcon,
  onSyncClick,
  breadcrumbLink = "#",
  breadcrumbIcon,
  showBackArrow = false,
  breadcrumbArrowIcon,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  count,
  filterCount,
}: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="header">
      <div className="header-content">
        <div className="breadcrumb">
          <div className="breadcrumb-left">
            {/* Back arrow */}
            {showBackArrow && (
              <div className="back-btn-container" onClick={() => navigate(-1)}>
                <img
                  src="/assets/chevron-left.svg"
                  alt="back-arrow"
                  className="breadcrumb-back-arrow"
                />
              </div>
            )}
            {breadcrumbIcon && (
              <img
                src={breadcrumbIcon}
                alt="breadcrumb-icon"
                className="breadcrumb-icon"
              />
            )}

            <Link to={breadcrumbLink ?? "#"} className="breadcrumb-title">
              <h2>{title}</h2>
              {typeof count === "number" && (
                <span className="count-badge">{count}</span>
              )}
            </Link>
          </div>

          {breadcrumbArrowIcon && (
            <img
              src={breadcrumbArrowIcon}
              alt="breadcrumb-arrow"
              className="breadcrumb-arrow"
            />
          )}
        </div>

        {/* Right actions: Search + Secondary + Primary */}
        <div className="header-actions">
          {onSearchChange && (
            <div className="header-search-input">
              <img
                src={searchIcon}
                alt="search"
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              <AppInput
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || "Search..."}
                maxLength={50}
                className="search-input-field"
              />
            </div>
          )}

          {/* {secondaryButtonText && (
            <button
              type="button"
              className="add-worker-btn"
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonIcon && (
                <img src={secondaryButtonIcon} alt="secondary-icon" />
              )}
              <span className="secondaryButtonText">
                {secondaryButtonText}
              </span>
              {/* Filter count badge */}
              {/* {filterCount !== undefined && filterCount > 0 && (
                <span className="filter-count-badge">{filterCount}</span>
              )}
            </button> */}
          

          {primaryButtonText && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            
              <AppButton
                className="right-btn"
                onClick={onPrimaryButtonClick}
                leftIcon={
                  primaryButtonIcon ? (
                    <img src={primaryButtonIcon === "/assets/add.svg" ? addIcon : primaryButtonIcon} alt="primary-icon" />
                  ) : undefined
                }
              >
                {primaryButtonText}
              </AppButton>
            </div>
          )}

          {/* Sync Button */}
          {syncButtonText && (
            <AppButton
              className="right-btn sync-btn"
              onClick={onSyncClick}
              leftIcon={
                syncButtonIcon ? (
                  <img src={syncButtonIcon} alt="sync-icon" />
                ) : undefined
              }
            >
              {syncButtonText}
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default Header;