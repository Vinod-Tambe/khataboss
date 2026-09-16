import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { listAdminSupportTickets, updateAdminSupportTicket } from '../api/supportApi';
import SupportTicketAdminCard from '../components/SupportTicketAdminCard';
import { Link, useSearchParams } from 'react-router-dom';
import SupportTicketAdminDrawer from '../components/SupportTicketAdminDrawer';
import {
  ADMIN_TICKET_STATUSES,
  ADMIN_STATUS_LABELS,
  OWNER_TICKET_STATUSES,
  OWNER_STATUS_LABELS,
} from '../../constants/supportTicket';
import SupportListSearchField from '../../components/support/SupportListSearchField';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import '../../css/Support.css';

const SupportTicketGridPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdatingUuid, setStatusUpdatingUuid] = useState(null);
  const [activeUuid, setActiveUuid] = useState(null);
  const [drawerRefresh, setDrawerRefresh] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const [filters, setFilters] = useState({
    admin_status: '',
    owner_status: '',
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.admin_status) params.admin_status = filters.admin_status;
      if (filters.owner_status) params.owner_status = filters.owner_status;
      const res = await listAdminSupportTickets(params);
      setTickets(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const fromUrl = searchParams.get('ticket');
    setActiveUuid(fromUrl || null);
  }, [searchParams]);

  const openTicket = (uuid) => {
    setActiveUuid(uuid);
    setSearchParams({ ticket: uuid });
  };

  const closeDrawer = () => {
    setActiveUuid(null);
    setSearchParams({});
  };

  const handleTicketUpdated = (updated) => {
    setTickets((prev) =>
      prev.map((t) => (t.st_uuid === updated.st_uuid ? { ...t, ...updated } : t))
    );
    if (activeUuid === updated.st_uuid) {
      setDrawerRefresh((n) => n + 1);
    }
  };

  const handleCardStatusChange = async (ticket, payload) => {
    setStatusUpdatingUuid(ticket.st_uuid);
    try {
      const res = await updateAdminSupportTicket(ticket.st_uuid, payload);
      handleTicketUpdated(res.data);
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setStatusUpdatingUuid(null);
    }
  };

  return (
    <div className="card p-3 pt-2 shadow-sm support-page app-module-panel">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1">Support list</h4>
          <p className="text-muted mb-0 small">Card view — open the board to drag-and-drop and edit tickets.</p>
        </div>
        <Link to="/admin/support" className="btn btn-primary btn-sm">
          <i className="bi bi-kanban me-1" />
          Board view
        </Link>
      </div>

      <div className="mb-3">
        <SupportListSearchField
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput('')}
          placeholder="Search T-1, title, description, or owner…"
          hint={
            debouncedSearch
              ? `Showing results for “${debouncedSearch}”`
              : null
          }
          ariaLabel="Search support tickets in list"
        />
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={filters.admin_status}
            onChange={(e) => setFilters((f) => ({ ...f, admin_status: e.target.value }))}
          >
            <option value="">All admin statuses</option>
            {ADMIN_TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>{ADMIN_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filters.owner_status}
            onChange={(e) => setFilters((f) => ({ ...f, owner_status: e.target.value }))}
          >
            <option value="">All owner statuses</option>
            {OWNER_TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>{OWNER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center text-muted py-5">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Loading…
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="support-empty text-center text-muted py-5">No support tickets found.</div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="row g-3">
          {tickets.map((ticket) => (
            <div key={ticket.st_uuid} className="col-12 col-sm-6 col-xl-4 d-flex">
              <SupportTicketAdminCard
                ticket={ticket}
                variant="list"
                statusUpdating={statusUpdatingUuid === ticket.st_uuid}
                onOpen={() => openTicket(ticket.st_uuid)}
                onStatusChange={handleCardStatusChange}
              />
            </div>
          ))}
        </div>
      )}

      <SupportTicketAdminDrawer
        ticketUuid={activeUuid}
        show={Boolean(activeUuid)}
        refreshToken={drawerRefresh}
        onHide={closeDrawer}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default SupportTicketGridPage;
