import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { toast } from 'react-toastify';
import List from '../common/List';
import { getJournalBookEntries } from '../../api/journalBookApi';
import '../../css/JournalBook.css';

const formatAmt = (value) =>
  parseFloat(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatJournalDate = (value, type = 'display') => {
  if (!value) return type === 'display' ? '-' : '';
  const parsed = moment(value);
  if (!parsed.isValid()) return type === 'display' ? String(value) : value;
  return type === 'display'
    ? parsed.format('DD MMM YYYY').toUpperCase()
    : parsed.format('YYYY-MM-DD');
};

const getDisplayLines = (row) => {
  if (Array.isArray(row.display_lines) && row.display_lines.length) {
    return row.display_lines;
  }

  const lines = [];
  (row.dr_lines || []).forEach((line) => {
    lines.push({
      side: 'DR',
      acc_id: line.acc_id,
      acc_uuid: line.acc_uuid,
      acc_name: line.acc_name,
      narration: line.narration,
      debit: line.amount,
      credit: 0,
    });
  });
  (row.cr_lines || []).forEach((line) => {
    lines.push({
      side: 'CR',
      acc_id: line.acc_id,
      acc_uuid: line.acc_uuid,
      acc_name: line.acc_name,
      narration: line.narration,
      debit: 0,
      credit: line.amount,
    });
  });
  return lines;
};

const renderLineStack = (lines, renderLine) => {
  if (!lines.length) return '-';
  return lines
    .map((line, idx) => {
      const borderClass = idx < lines.length - 1 ? 'border-bottom pb-1 mb-1' : '';
      return `<div class="${borderClass}">${renderLine(line)}</div>`;
    })
    .join('');
};

const buildNarrationText = (line, voucherNarration) => {
  const accName = escapeHtml(line.acc_name);
  const lineNarration = (line.narration || '').trim();
  const voucherText = (voucherNarration || '').trim();

  if (line.side === 'DR') {
    if (lineNarration) return `${escapeHtml(lineNarration)} — ${accName} A/c Dr`;
    if (voucherText) return `(${escapeHtml(voucherText)}) ${accName} A/c Dr`;
    return `${accName} A/c Dr`;
  }

  if (lineNarration) {
    return `To ${accName} — ${escapeHtml(lineNarration)} A/c Cr`;
  }
  if (voucherText) {
    return `To ${accName} (${escapeHtml(voucherText)}) A/c Cr`;
  }
  return `To ${accName} A/c Cr`;
};

const renderAccountName = (line) => {
  const className = line.side === 'DR' ? 'text-primary fw-semibold' : 'text-success';
  const name = escapeHtml(line.acc_name || '-');
  if (line.acc_uuid) {
    return `<button type="button" class="journal-acc-link btn btn-link p-0 border-0 align-baseline text-decoration-none ${className}" data-acc-uuid="${escapeHtml(line.acc_uuid)}" title="Open ledger">${name}</button>`;
  }
  return `<span class="${className}">${name}</span>`;
};

const BookList = () => {
  const navigate = useNavigate();
  const [journalData, setJournalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectedFirmId } = useSelector((state) => state.firm);
  const isAllFirms = !selectedFirmId || selectedFirmId === 'all';
  const firmFilter = isAllFirms ? 'all' : selectedFirmId;

  const fetchJournalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getJournalBookEntries(firmFilter);
      const data = response?.data || [];
      setJournalData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching journal book:', error);
      setJournalData([]);
      toast.error(error.message || 'Failed to load journal book');
    } finally {
      setLoading(false);
    }
  }, [firmFilter]);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);

  useEffect(() => {
    const handleAccountClick = (event) => {
      const trigger = event.target.closest('.journal-acc-link');
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      const accUuid = trigger.getAttribute('data-acc-uuid');
      if (accUuid) {
        navigate(`/account/details/${accUuid}`);
      }
    };

    const root = document.querySelector('.journal-book-page');
    root?.addEventListener('click', handleAccountClick);
    return () => root?.removeEventListener('click', handleAccountClick);
  }, [navigate]);

  const displayData = useMemo(
    () =>
      journalData.map((row) => ({
        ...row,
        voucher_title:
          isAllFirms && row.firm_name
            ? `${row.firm_name} · ${row.voucher_title}`
            : row.voucher_title,
      })),
    [journalData, isAllFirms]
  );

  const accountColumnMobileRender = useCallback(
    (row) => (
      <div className="d-flex flex-column gap-1 align-items-start">
        {getDisplayLines(row).map((line, idx) =>
          line.acc_uuid ? (
            <button
              key={`${line.acc_uuid}-${idx}`}
              type="button"
              className={`journal-acc-link btn btn-link p-0 text-start text-decoration-none ${line.side === 'DR' ? 'text-primary' : 'text-success'}`}
              data-acc-uuid={line.acc_uuid}
              onClick={() => navigate(`/account/details/${line.acc_uuid}`)}
            >
              {line.acc_name}
            </button>
          ) : (
            <span key={`${line.acc_name}-${idx}`} className={line.side === 'DR' ? 'text-primary' : 'text-success'}>
              {line.acc_name}
            </span>
          )
        )}
      </div>
    ),
    [navigate]
  );

  const columns = useMemo(
    () => [
      ...(isAllFirms
        ? [
            {
              key: 'firm_name',
              title: 'Firm',
              orderable: true,
              searchable: true,
              className: 'text-center align-middle',
              render: (data, type, row) => {
                const firmName = row.firm_name || '-';
                if (type === 'filter' || type === 'sort') return firmName;
                return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${escapeHtml(firmName)}</div>`;
              },
            },
          ]
        : []),
      {
        key: 'row_id',
        title: 'S.No',
        orderable: false,
        searchable: false,
        className: 'text-center align-middle fw-bold text-danger',
        render: (data, type, row, meta) => {
          if (type === 'sort' || type === 'filter') return meta.row + 1;
          return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${meta.row + 1}</div>`;
        },
      },
      {
        key: 'jrtr_date',
        title: 'Date',
        orderable: true,
        searchable: true,
        dateFilter: true,
        className: 'text-center align-middle',
        render: (data, type, row) => {
          if (type === 'sort' || type === 'filter') return formatJournalDate(row.jrtr_date, 'sort');
          return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${formatJournalDate(row.jrtr_date)}</div>`;
        },
      },
      {
        key: 'account_names',
        title: 'Account Name',
        orderable: false,
        searchable: true,
        render: (data, type, row) => {
          const searchText = row.account_names || getDisplayLines(row).map((line) => line.acc_name).join(' ');
          if (type === 'filter' || type === 'sort') return searchText;

          return renderLineStack(getDisplayLines(row), renderAccountName);
        },
        renderMobile: accountColumnMobileRender,
      },
      {
        key: 'jrnl_other_info',
        title: 'Narration',
        orderable: false,
        searchable: true,
        className: 'text-start',
        render: (data, type, row) => {
          const searchText = [
            row.jrnl_other_info,
            row.voucher_title,
            ...getDisplayLines(row).map((line) => line.narration),
          ]
            .filter(Boolean)
            .join(' ');

          if (type === 'filter' || type === 'sort') return searchText;

          return renderLineStack(getDisplayLines(row), (line) =>
            buildNarrationText(line, row.jrnl_other_info)
          );
        },
      },
      {
        key: 'jrtr_dr_amt',
        title: 'Debit',
        orderable: true,
        searchable: false,
        sum: true,
        className: 'text-end',
        render: (data, type, row) => {
          if (type === 'sort' || type === 'filter') return row.total_dr ?? row.jrtr_dr_amt ?? 0;

          return renderLineStack(getDisplayLines(row), (line) => {
            const amount = line.debit > 0 ? formatAmt(line.debit) : '0.00';
            const className = line.debit > 0 ? 'fw-bold' : 'text-muted';
            return `<span class="${className}">${amount}</span>`;
          });
        },
      },
      {
        key: 'jrtr_cr_amt',
        title: 'Credit',
        orderable: true,
        searchable: false,
        sum: true,
        className: 'text-end',
        render: (data, type, row) => {
          if (type === 'sort' || type === 'filter') return row.total_cr ?? row.jrtr_cr_amt ?? 0;

          return renderLineStack(getDisplayLines(row), (line) => {
            const amount = line.credit > 0 ? formatAmt(line.credit) : '0.00';
            const className = line.credit > 0 ? 'fw-bold' : 'text-muted';
            return `<span class="${className}">${amount}</span>`;
          });
        },
      },
      {
        key: 'jrnl_panel',
        title: 'Panel',
        orderable: true,
        searchable: true,
        className: 'text-center align-middle',
        render: (data, type, row) => {
          const panel = row.jrnl_panel || '-';
          if (type === 'filter' || type === 'sort') return panel;
          return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${escapeHtml(panel)}</div>`;
        },
      },
    ],
    [isAllFirms, accountColumnMobileRender]
  );

  return (
    <div className="journal-book-page">
      <List
        data={displayData}
        columns={columns}
        title="Journal Book"
        primaryKey="voucher_title"
        subtitleKey="jrtr_date"
        amountKey="total_dr"
        hasEdit={false}
        hasDelete={false}
        hasPrint={false}
        isLoading={loading}
      />
    </div>
  );
};

export default BookList;
