import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createSupportTicket, listSupportTickets } from '../../api/supportApi';
import CreateSupportTicketModal from '../../components/support/CreateSupportTicketModal';
import SupportTicketCard from '../../components/support/SupportTicketCard';
import SupportTicketOwnerDrawer from '../../components/support/SupportTicketOwnerDrawer';
import {
  getOwnerStatusSlug,
  OWNER_STATUS_LABELS,
  OWNER_TICKET_STATUSES,
} from '../../constants/supportTicket';
import SupportOwnerStatusStepper from '../../components/support/SupportOwnerStatusStepper';
import '../../css/Support.css';

const SupportTicketListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [activeUuid, setActiveUuid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await listSupportTickets(params);
      setTickets(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load support tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const fromUrl = searchParams.get('ticket');
    if (fromUrl) setActiveUuid(fromUrl);
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
  };

  const applySearch = (value) => {
    setSearchQuery(String(value || '').trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets;
    return tickets.filter((t) => t.st_owner_status === statusFilter);
  }, [tickets, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { ALL: tickets.length };
    OWNER_TICKET_STATUSES.forEach((status) => {
      counts[status] = tickets.filter((t) => t.st_owner_status === status).length;
    });
    return counts;
  }, [tickets]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      await createSupportTicket(payload);
      toast.success('Ticket submitted to support team');
      setShowCreate(false);
      await loadTickets();
    } catch (error) {
      toast.error(error.message || 'Failed to create ticket');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-3 pt-2 shadow-sm position-relative support-page app-module-panel">
      <div className="support-page-header d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3 pt-1">
        <h2 className="support-page-title mb-0">Support</h2>
        <button
          type="button"
          className="btn btn-primary fw-bold px-3 align-self-start align-self-md-center"
          onClick={() => setShowCreate(true)}
        >
          <i className="bi bi-plus-lg me-1" />
          New ticket
        </button>
      </div>

      <div className="support-list-search mb-3">
        <div className="support-list-search__field">
          <i className="bi bi-search support-list-search__icon" aria-hidden="true" />
          <input
            type="search"
            className="support-list-search__input"
            placeholder="Search ticket (T-1), title, or description — press Enter"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applySearch(searchInput);
              }
            }}
            aria-label="Search support tickets"
          />
          {(searchInput || searchQuery) ? (
            <button
              type="button"
              className="support-list-search__clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {searchQuery ? (
          <p className="support-list-search__hint mb-0 mt-2">
            Showing results for &ldquo;{searchQuery}&rdquo;
          </p>
        ) : null}
      </div>

      <div className="support-status-filters mb-3">
        <SupportOwnerStatusStepper
          statusFilter={statusFilter}
          statusCounts={statusCounts}
          onFilterChange={setStatusFilter}
        />
      </div>

      <div className="app-module-panel__grow">
      {loading && (
        <div className="d-flex justify-content-center py-5 flex-grow-1">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {!loading && tickets.length === 0 && !searchQuery && statusFilter === 'ALL' && (
        <div className="support-page__empty text-center text-muted py-5 px-3">
          <i className="bi bi-life-preserver display-6 d-block mb-2" />
          No tickets yet. Create one when you need help.
        </div>
      )}

      {!loading && tickets.length === 0 && (searchQuery || statusFilter !== 'ALL') && (
        <div className="support-page__empty text-center text-muted py-5 px-3">
          No tickets match your filters.
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              type="button"
              className="btn btn-link btn-sm mt-2"
              onClick={() => {
                clearSearch();
                setStatusFilter('ALL');
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {!loading && tickets.length > 0 && filteredTickets.length === 0 && (
        <div
          className={`support-page__empty text-center text-muted py-5 px-3 support-list-empty ${
            statusFilter !== 'ALL'
              ? `support-list-empty--status-${getOwnerStatusSlug(statusFilter)}`
              : ''
          }`}
        >
          No tickets with status &ldquo;{OWNER_STATUS_LABELS[statusFilter] || statusFilter}&rdquo;.
          <button
            type="button"
            className="btn btn-link btn-sm mt-2"
            onClick={() => setStatusFilter('ALL')}
          >
            Show all tickets
          </button>
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <div className="row g-3">
          {filteredTickets.map((ticket) => (
            <div key={ticket.st_uuid} className="col-12 col-sm-6 col-xl-4 d-flex">
              <SupportTicketCard ticket={ticket} onOpen={() => openTicket(ticket.st_uuid)} />
            </div>
          ))}
        </div>
      )}
      </div>

      <CreateSupportTicketModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        saving={saving}
      />

      <SupportTicketOwnerDrawer
        ticketUuid={activeUuid}
        show={Boolean(activeUuid)}
        onHide={closeDrawer}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default SupportTicketListPage;
