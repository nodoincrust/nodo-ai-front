import React, { useMemo, useState, useEffect } from "react";
import { Select } from "antd";
import "./Styles/Pagination.scss";
import { PaginationProps, PageItem } from "../../../types/common";

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  pageSize = 10,
  onPageSizeChange = () => { },
  totalRecords = 0,
}) => {
  const [jumpValue, setJumpValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const safeTotalPages = Number(totalPages) || 1;

  const pages: PageItem[] = useMemo(() => {
    const tp = safeTotalPages;
    const cp = Number(currentPage);

    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

    const result: PageItem[] = [1];
    if (cp > 4) result.push("...");

    let start = Math.max(2, cp - 2);
    let end = Math.min(tp - 1, cp + 2);

    if (cp < 4) start = 2, end = 5;
    else if (cp > tp - 3) start = tp - 4, end = tp - 1;

    for (let i = start; i <= end; i++) result.push(i);

    if (cp < tp - 3) result.push("...");
    result.push(tp);

    return result;
  }, [safeTotalPages, currentPage]);

  const handleClick = (page: PageItem) => {
    if (typeof page === "number" && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageSizeOptions = [10, 25, 50, 75, 100].map((size, index, arr) => {
    const prevSize = index === 0 ? 0 : arr[index - 1];
    return {
      label: `${size} records per page`,
      value: size,
      disabled: totalRecords <= prevSize,
    };
  });
  useEffect(() => {
    if (jumpValue === "") return;
    const numVal = Number(jumpValue);
    if (isNaN(numVal)) return;

    const validVal = Math.min(Math.max(numVal, 1), totalPages);

    const handler = setTimeout(() => {
      onPageChange(validVal);
    }, 500);

    return () => clearTimeout(handler);
  }, [jumpValue, totalPages, onPageChange]);

  return (
    <nav className="pagination-container" aria-label="Pagination">
      <div className="pagination-wrapper">
        <div className="pagination-content">
          {/* Records Per Page Dropdown */}
          <div className="page-dropdown">
            <Select
              value={pageSize}
              onChange={(val) => onPageSizeChange(val)}
              options={pageSizeOptions}
              className="page-select"
              classNames={{
                popup: {
                  root: "page-select-popup"
                }
              }}
              suffixIcon={<img src="/assets/down-arrow.png" alt="dropdown" />}
            />
          </div>

          {/* Prev + Numbers + Next */}
          <div className="pagination-center">
            <button
              className={`nav-button ${!hasPrevPage ? "disabled" : ""}`}
              disabled={!hasPrevPage}
              onClick={() => handleClick(currentPage - 1)}
            >
              <img
                src="/assets/arrow-left.svg"
                alt="prev"
                className={!hasPrevPage ? "icon-disabled" : ""}
              />
              <span className="nav-text">Previous</span>
            </button>

            <div className="page-numbers">
              {pages.map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="ellipsis">...</span>
                ) : (
                  <button
                    key={item}
                    className={`page-button ${currentPage === item ? "active" : ""}`}
                    onClick={() => handleClick(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              className={`nav-button ${!hasNextPage ? "disabled" : ""}`}
              disabled={!hasNextPage}
              onClick={() => handleClick(currentPage + 1)}
            >
              <span className="nav-text">Next</span>
              <img
                src="/assets/arrow-right.svg"
                alt="next"
                className={!hasNextPage ? "icon-disabled" : ""}
              />
            </button>
          </div>

          {/* Page Jump */}
          <div className="page-jump">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              placeholder={!isFocused && jumpValue === "" ? currentPage.toString() : ""}
              value={jumpValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, ""); // numeric only
                if (val === "") {
                  setJumpValue("");
                  return;
                }
                let numVal = Number(val);
                // clamp immediately
                if (numVal < 1) numVal = 1;
                if (numVal > totalPages) numVal = totalPages;
                setJumpValue(numVal.toString());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && jumpValue !== "") {
                  let numVal = Number(jumpValue);
                  if (isNaN(numVal) || numVal < 1) numVal = 1;
                  if (numVal > totalPages) numVal = totalPages;
                  onPageChange(numVal);
                }
              }}
              className="page-jump-input"
            />
            <span>of {totalPages}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;