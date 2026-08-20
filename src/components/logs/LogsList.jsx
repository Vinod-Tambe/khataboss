import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import List from '../common/List';
import { getActivityLogs } from '../../api/logsApi';
import '../../css/Logs.css';

const baseColumns = [
  { key: 'sno', title: 'S NO.', orderable: true, searchable: true },
  {
    key: 'log_date',
    title: 'DATE & TIME',
    orderable: true,
    searchable: true,
    dateFilter: true,
    render: (val, type, row) => row.date || val,
  },
  { key: 'login_user', title: 'LOGIN USER', orderable: true, searchable: true },
  {
    key: 'subject',
    title: 'SUBJECT',
    orderable: true,
    searchable: true,
    render: (val) => `<span class="text-brown fw-bold">${val || ''}</span>`,
  },
  {
    key: 'description',
    title: 'DESCRIPTION',
    orderable: false,
    searchable: true,
    className: 'logs-description-col',
  },
];

const firmColumn = {
  key: 'firm_name',
  title: 'FIRM',
  orderable: true,
  searchable: true,
  render: (val) => `<span class="text-primary fw-semibold">${val || '—'}</span>`,
};

const LogsList = ({
  entityType = null,
  entityId = null,
  title = 'All Logs List',
  firmId: firmIdProp = null,
}) => {
  const { selectedFirmId } = useSelector((state) => state.firm);
  const { user } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const resolvedFirmId = useMemo(() => {
    if (firmIdProp) return String(firmIdProp);
    if (selectedFirmId && selectedFirmId !== 'all') return String(selectedFirmId);
    return 'all';
  }, [firmIdProp, selectedFirmId]);

  const showFirmColumn = resolvedFirmId === 'all' && !entityType;

  const columns = useMemo(() => {
    if (!showFirmColumn) return baseColumns;
    return [
      baseColumns[0],
      firmColumn,
      ...baseColumns.slice(1),
    ];
  }, [showFirmColumn]);

  const isStaffUser = user?.role === 'STAFF';
  const isEntityScope = Boolean(entityType && entityId);

  const listTitle = useMemo(() => {
    if (isStaffUser && !isEntityScope) {
      if (resolvedFirmId === 'all' && !firmIdProp) return 'My Activity Logs';
      return `${title} — My Activity`;
    }
    if (resolvedFirmId === 'all' && !firmIdProp) return 'All Firms — Logs List';
    return title;
  }, [resolvedFirmId, firmIdProp, title, isStaffUser, isEntityScope]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        firmId: resolvedFirmId,
        limit: 500,
      };
      if (entityType && entityId) {
        params.entityType = entityType;
        params.entityId = entityId;
      }
      const response = await getActivityLogs(params);
      setLogs(response?.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedFirmId, entityType, entityId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="logs-list-wrapper">
      <List
        data={logs}
        columns={columns}
        title={listTitle}
        primaryKey="subject"
        subtitleKey="log_date"
        showFooter={false}
        isLoading={loading}
      />
    </div>
  );
};

export default LogsList;
