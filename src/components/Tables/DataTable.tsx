import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./DataTable.scss";
import Pagination from "../common/Pagination";

type Column<T> = {
  title: string;
  className?: string;
  render: (row: T, index: number) => ReactNode;
};

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
  actionsTitle?: string;
  emptyText?: string;
  totalRecords?: number;
}


const DataTable = <T,>({
  data,
  columns,
  actions,
  actionsTitle,
  emptyText,
}: TableProps<T>) => {
  const [, setWindowWidth] = useState<number>(window.innerWidth);

  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isEmpty = data.length === 0;

  return (
    <div className="table-container">
      <div className={`table ${data.length === 0 ? "empty" : ""}`}>
        <div className="table-wrapper">
          <div className="table-scroll-wrapper">
            <table>
              {!isEmpty && (
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className={col.className || ""}>
                        {col.title}
                        {/* {col.title === "Status" && (
                          // <img
                          //   src="/assets/arrow-down.svg"
                          //   alt="Sort"
                          //   className="status-arrow"
                          // />
                        )} */}
                      </th>
                    ))}
                    {actions && (
                      <th className="table-actions">
                        {actionsTitle || "Actions"}
                      </th>
                    )}
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
                  data.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col, cIdx) => (
                        <td key={cIdx} className={col.className || ""}>
                          {col.render(row, idx)}
                        </td>
                      ))}
                      {actions && (
                        <td className="table-actions fixed-right">
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default DataTable;
