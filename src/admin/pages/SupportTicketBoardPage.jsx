import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { listAdminSupportTickets, updateAdminSupportTicket } from '../api/supportApi';
import SupportTicketAdminDrawer from '../components/SupportTicketAdminDrawer';
import SupportTicketAdminCard from '../components/SupportTicketAdminCard';
import {
  ADMIN_TICKET_STATUSES,
  ADMIN_STATUS_LABELS,
} from '../../constants/supportTicket';
import SupportListSearchField from '../../components/support/SupportListSearchField';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import '../../css/Support.css';

const SupportTicketBoardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const [activeUuid, setActiveUuid] = useState(null);
  const [movingUuid, setMovingUuid] = useState(null);
  const [statusUpdatingUuid, setStatusUpdatingUuid] = useState(null);
  const [drawerRefresh, setDrawerRefresh] = useState(0);
  const didDragRef = useRef(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const res = await listAdminSupportTickets(params);
      setTickets(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const fromUrl = searchParams.get('ticket');
    if (fromUrl) setActiveUuid(fromUrl);
  }, [searchParams]);

  const ticketsByColumn = useMemo(() => {
    const map = {};
    ADMIN_TICKET_STATUSES.forEach((status) => {
      map[status] = [];
    });
    tickets.forEach((ticket) => {
      const key = ADMIN_TICKET_STATUSES.includes(ticket.st_admin_status)
        ? ticket.st_admin_status
        : 'Todo';
      map[key].push(ticket);
    });
    return map;
  }, [tickets]);

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

  const handleCardStatusChange = async (ticket, payload) => {
    setStatusUpdatingUuid(ticket.st_uuid);
    try {
      const res = await updateAdminSupportTicket(ticket.st_uuid, payload);
      handleTicketUpdated(res.data);
      if (activeUuid === ticket.st_uuid) {
        setDrawerRefresh((n) => n + 1);
      }
      if (payload.st_admin_status) {
        toast.success(`Admin: ${ADMIN_STATUS_LABELS[payload.st_admin_status]}`);
      } else if (payload.st_owner_status) {
        toast.success('Owner status updated');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setStatusUpdatingUuid(null);
    }
  };

  const handleDragStart = (e, ticket) => {
    didDragRef.current = true;
    e.dataTransfer.setData('text/plain', ticket.st_uuid);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('application/x-support-ticket', ticket.st_uuid);
    } catch {
      /* some browsers only allow text/plain */
    }
  };

  const readDraggedTicketUuid = (e) => {
    const fromText = e.dataTransfer.getData('text/plain');
    if (fromText) return fromText;
    try {
      return e.dataTransfer.getData('application/x-support-ticket');
    } catch {
      return '';
    }
  };

  const handleDragEnd = () => {
    setDragOverColumn(null);
  };

  const handleDropOnColumn = async (e, adminStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    const uuid = readDraggedTicketUuid(e);
    if (!uuid) return;

    const ticket = tickets.find((t) => t.st_uuid === uuid);
    if (!ticket || ticket.st_admin_status === adminStatus) return;

    setMovingUuid(uuid);
    try {
      const res = await updateAdminSupportTicket(uuid, { st_admin_status: adminStatus });
      handleTicketUpdated(res.data);
      if (activeUuid === uuid) {
        setDrawerRefresh((n) => n + 1);
      }
      toast.success(`Moved to ${ADMIN_STATUS_LABELS[adminStatus]}`);
    } catch (error) {
      toast.error(error.message || 'Failed to move ticket');
    } finally {
      setMovingUuid(null);
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="card p-3 pt-2 shadow-sm support-page support-board-page app-module-panel">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1">Support board</h4>
          <p className="text-muted mb-0 small">
            Drag cards between columns or open a card to edit title, description, status, and comments.
          </p>
        </div>
        <Link to="/admin/support/list" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-grid-3x3-gap me-1" />
          Card list
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
          ariaLabel="Search support tickets on board"
        />
      </div>

      {loading && (
        <div className="text-center text-muted py-5">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Loading board…
        </div>
      )}

      {!loading && (
        <div className="support-board">
          {ADMIN_TICKET_STATUSES.map((status) => (
            <div
              key={status}
              className={`support-board__column${
                dragOverColumn === status ? ' support-board__column--drag-over' : ''
              }`}
              onDragEnter={() => setDragOverColumn(status)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDragOverColumn((current) => (current === status ? null : current));
                }
              }}
              onDragOverCapture={allowDrop}
              onDropCapture={(e) => handleDropOnColumn(e, status)}
            >
              <div className="support-board__column-head">
                <span className="support-board__column-title">{ADMIN_STATUS_LABELS[status]}</span>
                <span className="support-board__column-count">{ticketsByColumn[status].length}</span>
              </div>
              <div className="support-board__column-body">
                <div
                  className={`support-board__drop-zone ${
                    ticketsByColumn[status].length === 0 ? 'support-board__drop-zone--empty' : ''
                  }`}
                  onDragOver={allowDrop}
                  onDrop={(e) => handleDropOnColumn(e, status)}
                >
                  {ticketsByColumn[status].length === 0 && (
                    <p className="support-board__empty small text-muted mb-0">Drop tickets here</p>
                  )}
                  {ticketsByColumn[status].map((ticket) => (
                    <SupportTicketAdminCard
                      key={ticket.st_uuid}
                      ticket={ticket}
                      variant="board"
                      isMoving={movingUuid === ticket.st_uuid}
                      statusUpdating={statusUpdatingUuid === ticket.st_uuid}
                      onDragStart={(e) => handleDragStart(e, ticket)}
                      onDragEnd={handleDragEnd}
                      onOpen={() => {
                        if (didDragRef.current) {
                          didDragRef.current = false;
                          return;
                        }
                        openTicket(ticket.st_uuid);
                      }}
                      onStatusChange={handleCardStatusChange}
                    />
                  ))}
                </div>
              </div>
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

export default SupportTicketBoardPage;
