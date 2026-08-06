import React from 'react';
import List from '../common/List';
import { LOGS_STATIC_DATA } from './logsData';
import '../../css/Logs.css';

const columns = [
  { key: 'sno', title: 'S NO.', orderable: true, searchable: true },
  {
    key: 'log_date',
    title: 'DATE',
    orderable: true,
    searchable: true,
    dateFilter: true,
    render: (val, type, row) => row.date || val,
  },
  { key: 'login_id', title: 'LOGIN ID', orderable: true, searchable: true },
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

const LogsList = () => {
  return (
    <div className="logs-list-wrapper">
      <List
        data={LOGS_STATIC_DATA}
        columns={columns}
        title="All Logs List"
        primaryKey="subject"
        subtitleKey="log_date"
        showFooter={false}
      />
    </div>
  );
};

export default LogsList;
