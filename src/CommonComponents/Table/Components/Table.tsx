import React, { useEffect, useState } from "react";
import SecondaryButton from "../../Buttons/SecondaryButton";
import "./Styles/Table.scss"
import type { TableProps } from "../../../types/common";
import { Select } from "antd";
const { Option } = Select;

const Table = <T,>({
    data,
    columns,
    actions,
    actionsTitle,
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 10,
    totalRecords = 0,
    onPageSizeChange,
    emptyText,
    rowClassName,
}: TableProps<T>) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const showArrows = windowWidth <= 991;
    const isEmpty = data.length === 0;
    const pageSizeOptions = [10, 25, 50, 75, 100].map((size, index, arr) => {
        const prevSize = index === 0 ? 0 : arr[index - 1];
        return (
            <Option key={size} value={size} disabled={totalRecords <= prevSize}>
                {size}
            </Option>
        );
    });

    return (
        <div className="language-table-container">
            <div className={`language-table ${data.length === 0 ? "empty" : ""}`}>
                <div className="table-wrapper">
                    <table>
                        {!isEmpty && (
                            <thead>
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={col.className || ""}>
                                            {col.title}
                                            {/* {col.title === "Status" && (
                                                <img
                                                    src="/assets/arrow-down.svg"
                                                    alt="Sort"
                                                    className="status-arrow"
                                                />
                                            )} */}
                                        </th>
                                    ))}
                                    {actions && <th className="language-actions">{actionsTitle || "Actions"}</th>}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {isEmpty ? (
                                <tr className="empty-state-row">
                                    <td colSpan={columns.length + (actions ? 1 : 0)}>
                                        <div className="empty-state-wrapper">
                                            <div className="empty-state">
                                                <img src="/assets/table-fallback.svg" alt="" />
                                                {emptyText || "No data found"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => {
                                    const className = rowClassName ? rowClassName(row) : "";
                                    return (
                                        <tr key={idx} className={className}>
                                            {columns.map((col, cIdx) => (
                                                <td key={cIdx} className={col.className || ""}>
                                                    {col.render(row, idx)}
                                                </td>
                                            ))}
                                            {actions && <td
                                                className={`language-actions ${rowClassName ? rowClassName(row) : ""} ${(row as any).isreported ? "reported-td" : ""
                                                    }`}
                                            >{actions(row)}</td>}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {data.length > 0 && (
                    <div className="language-table-footer">
                        {/* LEFT */}
                        <div className="rows-per-page">
                            <span>Rows per page:</span>

                            <div className="select-wrapper">
                                <Select
                                    value={pageSize}
                                    onChange={(value) => onPageSizeChange?.(value)}
                                    className="rows-select"
                                    dropdownClassName="rows-select-dropdown"
                                    suffixIcon={
                                        <img
                                            src="/assets/pagination-chevron-down.svg"
                                            alt=""
                                            className="select-arrow"
                                        />
                                    }
                                >
                                    {pageSizeOptions}
                                </Select>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="footer-right">
                            <span className="page-info">
                                {(currentPage - 1) * (pageSize || 10) + 1}–
                                {Math.min(
                                    currentPage * (pageSize || 10),
                                    totalRecords || 0
                                )}{" "}
                                of {totalRecords}
                            </span>

                            <button
                                className="nav-btn"
                                disabled={currentPage === 1}
                                onClick={() => onPageChange(currentPage - 1)}
                            >
                                <img src="/assets/chevron-left.svg" alt="" />
                            </button>

                            <button
                                className="nav-btn"
                                disabled={currentPage === totalPages}
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                <img src="/assets/chevron-right.svg" alt="" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Table;