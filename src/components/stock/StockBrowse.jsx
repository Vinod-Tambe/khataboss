import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getStockLedger } from '../../api/stockApi';
import { stockDetailsPath } from '../../utils/stockFormatters';
import useOpenLoanDetails from '../../hooks/useOpenLoanDetails';
import { setSelectedFirmId } from '../../store/slices/firmSlice';
import StockGridContent from './StockGridContent';
import StockListContent from './StockListContent';
import StockPagination from './StockPagination';
import {
  KEYBOARD_SHORTCUT_EVENTS,
  STOCK_SEARCH_INPUT_ID,
} from '../../config/keyboardShortcuts';
import '../../css/Stock.css';

const PAGE_SIZE = 16;

const StockFilterSelect = ({
  icon,
  ariaLabel,
  value,
  onChange,
  wrapClassName = '',
  children,
}) => (
  <div className={`stock-browse-filter-wrap ${wrapClassName}`.trim()}>
    <span className="stock-browse-filter-icon" aria-hidden="true">
      <i className={`bi ${icon}`} />
    </span>
    <select
      className="form-select form-select-sm stock-browse-filter"
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
    >
      {children}
    </select>
  </div>
);

const StockBrowse = ({ initialView = 'grid' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openLoanDetails = useOpenLoanDetails();
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const [viewMode, setViewMode] = useState(initialView);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loanStatus, setLoanStatus] = useState('ACTIVE');
  const [metalType, setMetalType] = useState('ALL');
  const [itemStatus, setItemStatus] = useState('ALL');
  const [firmFilter, setFirmFilter] = useState(selectedFirmId || 'all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const stockSearchRef = useRef(null);

  useEffect(() => {
    const focusStockSearch = () => {
      stockSearchRef.current?.focus();
      stockSearchRef.current?.select?.();
    };
    const onPagePrev = () => {
      setPage((p) => Math.max(1, p - 1));
    };
    const onPageNext = () => {
      setPage((p) => (totalPages > 0 ? Math.min(totalPages, p + 1) : p));
    };

    window.addEventListener(
      KEYBOARD_SHORTCUT_EVENTS.FOCUS_STOCK_SEARCH,
      focusStockSearch
    );
    window.addEventListener(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_PREV, onPagePrev);
    window.addEventListener(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_NEXT, onPageNext);
    return () => {
      window.removeEventListener(
        KEYBOARD_SHORTCUT_EVENTS.FOCUS_STOCK_SEARCH,
        focusStockSearch
      );
      window.removeEventListener(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_PREV, onPagePrev);
      window.removeEventListener(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_NEXT, onPageNext);
    };
  }, [totalPages]);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  useEffect(() => {
    setFirmFilter(selectedFirmId || 'all');
  }, [selectedFirmId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, loanStatus, metalType, itemStatus, firmFilter]);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        loanStatus,
        metalType,
        itemStatus,
        page,
        limit: PAGE_SIZE,
      };
      if (firmFilter && firmFilter !== 'all') {
        params.firmId = firmFilter;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      const response = await getStockLedger(params);
      setRows(response.data || []);
      setTotal(response.total ?? 0);
      setTotalPages(response.totalPages ?? 0);
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotal(0);
      setTotalPages(0);
      setError(err?.error || err?.message || 'Failed to load stock');
      toast.error('Failed to load stock list');
    } finally {
      setLoading(false);
    }
  }, [
    firmFilter,
    loanStatus,
    metalType,
    itemStatus,
    debouncedSearch,
    page,
  ]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const firmOptions = useMemo(() => {
    const list = Array.isArray(firms) ? firms : [];
    return list.map((f) => ({
      id: String(f.firm_id ?? f.id ?? ''),
      name: f.firm_name || f.name || `Firm ${f.firm_id ?? f.id}`,
    }));
  }, [firms]);

  const openStockDetails = (row) => {
    const path = stockDetailsPath(row);
    if (!path) {
      toast.error('Stock reference not found');
      return;
    }
    navigate(path, { state: { stockPreview: row } });
  };

  const switchView = (next) => {
    setViewMode(next);
    navigate(next === 'list' ? '/stock/list' : '/stock/grid', { replace: true });
  };

  const handleFirmChange = (value) => {
    setFirmFilter(value);
    dispatch(setSelectedFirmId(value));
  };

  return (
    <div className="card p-3 pt-2 app-module-panel stock-module">
      <div className="stock-browse-toolbar border-bottom border-secondary-subtle mb-3">
        <h4 className="stock-browse-title fw-bold text-brown mb-0">
          <i className="bi bi-box-seam me-2" />
          Stock Inventory
        </h4>
        <div className="stock-browse-filters">
          <StockFilterSelect
            icon="bi-grid-3x3-gap"
            ariaLabel="Stock view"
            value={viewMode}
            onChange={(e) => switchView(e.target.value)}
          >
            <option value="grid">Grid list</option>
            <option value="list">Normal list</option>
          </StockFilterSelect>
          <StockFilterSelect
            icon="bi-file-earmark-text"
            ariaLabel="Loan status"
            value={loanStatus}
            onChange={(e) => setLoanStatus(e.target.value)}
          >
            <option value="ALL">All loans</option>
            <option value="ACTIVE">Active loan</option>
            <option value="RELEASED">Released</option>
            <option value="AUCTION">Auction</option>
            <option value="CLOSED">Closed</option>
          </StockFilterSelect>
          <StockFilterSelect
            icon="bi-gem"
            ariaLabel="Metal type"
            value={metalType}
            onChange={(e) => setMetalType(e.target.value)}
          >
            <option value="ALL">All metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </StockFilterSelect>
          <StockFilterSelect
            icon="bi-box-seam"
            ariaLabel="Item status"
            value={itemStatus}
            onChange={(e) => setItemStatus(e.target.value)}
          >
            <option value="ALL">All item status</option>
            <option value="active">Active</option>
            <option value="released">Released</option>
          </StockFilterSelect>
          <StockFilterSelect
            icon="bi-building"
            ariaLabel="Firm"
            wrapClassName="stock-browse-filter-wrap--firm"
            value={firmFilter}
            onChange={(e) => handleFirmChange(e.target.value)}
          >
            <option value="all">All firms</option>
            {firmOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </StockFilterSelect>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <input
              ref={stockSearchRef}
              id={STOCK_SEARCH_INPUT_ID}
              type="search"
              className="form-control border-secondary"
              placeholder="Search item, loan no, customer, mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text border-secondary">
              <i className="bi bi-search" />
            </span>
          </div>
        </div>
        <div className="col-12 col-md-4 text-md-end text-muted small d-flex align-items-center justify-content-md-end">
          {loading ? 'Loading…' : `${total} item(s)`}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <StockGridContent
          rows={rows}
          loading={loading}
          onSelect={openStockDetails}
        />
      ) : (
        <StockListContent
          rows={rows}
          loading={loading}
          errorMessage={error}
          onOpenStockDetails={openStockDetails}
          onOpenLoanDetails={openLoanDetails}
        />
      )}

      <StockPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={PAGE_SIZE}
        disabled={loading}
        onPageChange={setPage}
      />
    </div>
  );
};

export default StockBrowse;
