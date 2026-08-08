import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import List from '../common/List';
import { getJournalBookEntries } from '../../api/journalBookApi';

const BookList = () => {
  const [journalData, setJournalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedFirm = useSelector((state) => state.firm.selectedFirm);

  const fetchJournalData = useCallback(async () => {
    if (!selectedFirm?.firm_id) return;
    try {
      setLoading(true);
      const response = await getJournalBookEntries(selectedFirm.firm_id);
      const data = response.data || [];
      setJournalData(data);
    } catch (error) {
      console.error("Error fetching journal book:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFirm?.firm_id]);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);

  const columns = [
    {
      key: "jrtr_id", // Using ID for S.No so it maps to a real key
      title: "S.No",
      orderable: false,
      searchable: false,
      className: "text-center align-middle fw-bold text-danger",
      render: (data, type, row, meta) => {
        return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${meta.row + 1}</div>`;
      }
    },
    {
      key: "jrtr_date",
      title: "Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      className: "text-center align-middle",
      render: (data, type, row) => {
        if (type === 'sort' || type === 'filter') return row.jrtr_date;
        const formattedDate = moment(row.jrtr_date).format('DD MMM YYYY').toUpperCase();
        return `<div class="d-flex align-items-center justify-content-center h-100" style="min-height: 54px;">${formattedDate}</div>`;
      }
    },
    {
      key: "dr_acc_name", // We can use one of the keys for ordering/searching
      title: "Account Name",
      orderable: false,
      searchable: true,
      render: (data, type, row) => {
        if (type === 'filter' || type === 'sort') {
           return `${row.dr_acc_name} ${row.cr_acc_name}`;
        }
        return `
          <div class="border-bottom pb-1 mb-1 text-primary">${row.dr_acc_name}</div>
          <div class="pt-1">${row.cr_acc_name}</div>
        `;
      }
    },
    {
      key: "jrtr_other_info",
      title: "Narration",
      orderable: false,
      searchable: true,
      className: "text-end",
      render: (data, type, row) => {
        if (type === 'filter' || type === 'sort') {
           return row.jrtr_other_info || '';
        }
        const narration = row.jrtr_other_info ? '(' + row.jrtr_other_info + ')' : '';
        return `
          <div class="border-bottom pb-1 mb-1">${narration} A/c Dr</div>
          <div class="pt-1">A/c Cr</div>
        `;
      }
    },
    {
      key: "jrtr_dr_amt",
      title: "Debit",
      orderable: true,
      searchable: false,
      sum: true,
      className: "text-end",
      render: (data, type, row) => {
        if (type === 'sort' || type === 'filter') return row.jrtr_dr_amt;
        const drAmt = parseFloat(row.jrtr_dr_amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `
          <div class="border-bottom pb-1 mb-1 fw-bold">${drAmt}</div>
          <div class="pt-1">0.00</div>
        `;
      }
    },
    {
      key: "jrtr_cr_amt",
      title: "Credit",
      orderable: true,
      searchable: false,
      sum: true,
      className: "text-end",
      render: (data, type, row) => {
        if (type === 'sort' || type === 'filter') return row.jrtr_cr_amt;
        const crAmt = parseFloat(row.jrtr_cr_amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `
          <div class="border-bottom pb-1 mb-1">0.00</div>
          <div class="pt-1 fw-bold">${crAmt}</div>
        `;
      }
    }
  ];

  return (
    <div>
      <List
        data={journalData}
        columns={columns}
        title="Journal Book"
        primaryKey="jrtr_id"
        subtitleKey="jrtr_date"
        hasEdit={false}
        hasDelete={false} 
        hasPrint={false}
        isLoading={loading}
      />
    </div>
  );
}

export default BookList;
