import React, { useMemo } from "react";

import "./pagination.scss";
import arrowLeft from "../../assets/images/arrow_left_.svg";
import arrowRight from "../../assets/images/Arrow right.svg";


 
export type PageItem = number | "...";

 export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}
const Pagination: React.FC<PaginationProps> = ({

  currentPage,

  totalPages,

  hasNextPage,

  hasPrevPage,

  onPageChange,

}) => {

  const pages: PageItem[] = useMemo(() => {

    if (totalPages <= 7) {

      return Array.from({ length: totalPages }, (_, i) => i + 1);

    }
 
    const result: PageItem[] = [1];

    if (currentPage > 4) result.push("...");
 
    let start = Math.max(2, currentPage - 2);

    let end = Math.min(totalPages - 1, currentPage + 2);
 
    if (currentPage < 4) {

      start = 2;

      end = 5;

    } else if (currentPage > totalPages - 3) {

      start = totalPages - 4;

      end = totalPages - 1;

    }
 
    for (let i = start; i <= end; i++) result.push(i);
 
    if (currentPage < totalPages - 3) result.push("...");

    result.push(totalPages);
 
    return result;

  }, [totalPages, currentPage]);
 
  const handleClick = (page: PageItem) => {

    if (typeof page === "number" && page >= 1 && page <= totalPages) {

      onPageChange(page);

    }

  };
 
  return (
<nav className="pagination-container" aria-label="Pagination">
<div className="pagination-wrapper">
<div className="pagination-content">

          {/* Previous */}
<button

            className={`nav-button ${!hasPrevPage ? "disabled" : ""}`}

            disabled={!hasPrevPage}

            onClick={() => handleClick(currentPage - 1)}
>
<img

              src={arrowLeft}

              alt="previous"

            />
<span className="nav-text">Previous</span>
</button>
 
          {/* Page Numbers */}
<div className="page-numbers">

            {pages.map((item, idx) =>

              item === "..." ? (
<span key={`ellipsis-${idx}`} className="ellipsis">

                  ...
</span>

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
 
          {/* Next */}
<button

            className={`nav-button ${!hasNextPage ? "disabled" : ""}`}

            disabled={!hasNextPage}

            onClick={() => handleClick(currentPage + 1)}
>
<span className="nav-text">Next</span>
<img

              src={arrowRight}

              alt="next"

            />
</button>
</div>
</div>
</nav>

  );

};
 
export default Pagination;
 