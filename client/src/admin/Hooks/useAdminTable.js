import { useMemo, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export function useAdminTable({ rows, searchKeys, pageSize = 8, initialSort }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const debouncedSearch = useDebouncedValue(search);

  const filteredRows = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    let nextRows = rows;

    if (normalizedSearch) {
      nextRows = rows.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(normalizedSearch)),
      );
    }

    if (sort?.key) {
      nextRows = [...nextRows].sort((left, right) => {
        const leftValue = left[sort.key];
        const rightValue = right[sort.key];

        if (leftValue === rightValue) {
          return 0;
        }

        const direction = sort.direction === "desc" ? -1 : 1;
        return leftValue > rightValue ? direction : -direction;
      });
    }

    return nextRows;
  }, [debouncedSearch, rows, searchKeys, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    pageSize,
    pagedRows,
    search,
    setSearch,
    sort,
    setSort,
    totalPages,
    totalRows: filteredRows.length,
    setPage,
  };
}
