import { useMemo } from "react";

export const DAYBOOK_PAGE_LENGTH_ALL = -1;
export const DAYBOOK_PAGE_LENGTH_DEFAULT = 25;

export const DAYBOOK_PAGE_LENGTH_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: DAYBOOK_PAGE_LENGTH_ALL, label: "All" },
];

const rowMatchesSearch = (row, query) => {
  if (!query) return true;
  return Object.values(row).some((value) => {
    if (value == null) return false;
    if (typeof value === "object") {
      try {
        return JSON.stringify(value).toLowerCase().includes(query);
      } catch {
        return false;
      }
    }
    return String(value).toLowerCase().includes(query);
  });
};

/** Search full dataset, then apply row limit (default 25; All = no limit). */
export function useDaybookDisplayRows(data, search, pageLength) {
  return useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = query ? data.filter((row) => rowMatchesSearch(row, query)) : data;
    if (pageLength !== DAYBOOK_PAGE_LENGTH_ALL) {
      rows = rows.slice(0, pageLength);
    }
    return rows;
  }, [data, search, pageLength]);
}
