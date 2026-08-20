import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getGirvis } from "../api/girviApi";
import { getFinances } from "../api/financeApi";

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  return response?.data || [];
};

/**
 * Prev/next navigation among a customer's non-deleted loans or finance records.
 * Uses the same ALL-status list API as customer loan/finance lists (newest first).
 */
const useUserRecordNavigation = ({
  type,
  currentId,
  userId,
  firmId = null,
  loanPath = "/user/home/loan-info",
  financePath = "/user/home/finance",
}) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const idKey = type === "loan" ? "girv_id" : "fin_id";

  useEffect(() => {
    if (!userId || !currentId) {
      setRecords([]);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const filters = { userId, status: "ALL" };
        if (firmId) filters.firmId = firmId;

        const response =
          type === "loan" ? await getGirvis(filters) : await getFinances(filters);

        if (!cancelled) setRecords(normalizeList(response));
      } catch {
        if (!cancelled) setRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [type, userId, firmId, currentId]);

  const currentIndex = useMemo(() => {
    if (!currentId || !records.length) return -1;
    return records.findIndex((row) => String(row[idKey]) === String(currentId));
  }, [records, currentId, idKey]);

  const prevRecord = currentIndex > 0 ? records[currentIndex - 1] : null;
  const nextRecord =
    currentIndex >= 0 && currentIndex < records.length - 1
      ? records[currentIndex + 1]
      : null;

  const goToRecord = useCallback(
    (record) => {
      if (!record) return;
      if (type === "loan") {
        navigate(loanPath, { state: { loan: record }, replace: true });
      } else {
        navigate(financePath, { state: { finance: record }, replace: true });
      }
    },
    [navigate, type, loanPath, financePath]
  );

  const goPrev = useCallback(() => goToRecord(prevRecord), [goToRecord, prevRecord]);
  const goNext = useCallback(() => goToRecord(nextRecord), [goToRecord, nextRecord]);

  return {
    loading,
    total: records.length,
    currentIndex,
    positionLabel:
      currentIndex >= 0 && records.length > 0
        ? `${currentIndex + 1} / ${records.length}`
        : null,
    hasPrev: Boolean(prevRecord),
    hasNext: Boolean(nextRecord),
    goPrev,
    goNext,
  };
};

export default useUserRecordNavigation;
