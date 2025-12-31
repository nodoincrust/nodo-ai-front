import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { ApiFilters, DEFAULT_FILTERS, Filters, UseFiltersProps } from "../types/common";

export const useFilters = ({
    initialFilters = { ...DEFAULT_FILTERS },
    onApply,
}: UseFiltersProps & { apiData?: Record<string, any>; customRange?: [Dayjs | null, Dayjs | null] } = {}) => {
    // restore saved filters when hook initializes
    const savedFilters = sessionStorage.getItem("appliedFilters");
    const savedApiFilters = sessionStorage.getItem("apiAppliedFilters");

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<Filters>(
        savedFilters ? JSON.parse(savedFilters) : { ...initialFilters }
    );
    const [apiAppliedFilters, setApiAppliedFilters] = useState<ApiFilters>(
        savedApiFilters ? JSON.parse(savedApiFilters) : {}
    );

    const handleOpenFilter = () => setIsFilterOpen(true);
    const handleCloseFilter = () => setIsFilterOpen(false);

    const handleApplyFilters = (filters: Filters, apiFilters: ApiFilters) => {
        const start = apiFilters.date?.start;
        const end = apiFilters.date?.end || (start ? dayjs().format("DD-MM-YYYY") : undefined);

        const updatedFilters: Filters = { ...filters, Date: start ? [start, end!] : [] };
        const updatedApiFilters: ApiFilters = { ...apiFilters };
        if (!start && !end) delete updatedApiFilters.date;

        setAppliedFilters(updatedFilters);
        setApiAppliedFilters(updatedApiFilters);
        // save filters so they don't clear on navigation
        sessionStorage.setItem("appliedFilters", JSON.stringify(updatedFilters));
        sessionStorage.setItem("apiAppliedFilters", JSON.stringify(updatedApiFilters));
        handleCloseFilter();
        onApply?.(updatedFilters, updatedApiFilters);
    };

    const handleClearFilters = () => {
        setAppliedFilters({ ...DEFAULT_FILTERS });
        setApiAppliedFilters({});
        sessionStorage.removeItem("appliedFilters");
        sessionStorage.removeItem("apiAppliedFilters");
        onApply?.({ ...DEFAULT_FILTERS }, {});
    };

    useEffect(() => {
        const clearSession = () => {
            sessionStorage.removeItem("appliedFilters");
            sessionStorage.removeItem("apiAppliedFilters");
        };

        window.addEventListener("beforeunload", clearSession);

        return () => {
            window.removeEventListener("beforeunload", clearSession);
        };
    }, []);

    return {
        isFilterOpen,
        appliedFilters,
        apiAppliedFilters,
        handleOpenFilter,
        handleCloseFilter,
        handleApplyFilters,
        handleClearFilters,
        setAppliedFilters,
        setApiAppliedFilters,
    };
};
