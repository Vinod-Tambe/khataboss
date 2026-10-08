import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import { FiPlusCircle } from 'react-icons/fi';
import List from '../common/List';
import usePermissions from '../../hooks/usePermissions';
import { deleteMoneyTransaction, getMoneyTransactions } from '../../api/moneyTransactionApi';
import {
  PERSONAL_EXPENSE_FORM_TITLE,
  PERSONAL_EXPENSE_LIST_TITLE,
} from '../../constants/personalExpense';
import { getExpenseTypeLabel } from '../../constants/expenseTypes';
import { formatTransferDirectionLabel } from '../../utils/transferDirection';

const formatAmt = (value) =>
  parseFloat(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const modeLabel = (mode) => (mode === 'ONE_TO_MANY' ? 'One to many' : 'One to one');

const directionLabel = (direction) => formatTransferDirectionLabel(direction);

const InterAccountTransferList = () => {
  const { canAny } = usePermissions();
  const canTransfer = canAny(['expense.create', 'account.transfer']);
  const { selectedFirmId } = useSelector((state) => state.firm);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const firmFilter = selectedFirmId === 'all' ? null : selectedFirmId;
      const res = await getMoneyTransactions({ firmId: firmFilter });
      setRows(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load personal expenses');
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleDelete = async (row) => {
    if (!canTransfer) {
      toast.error('You do not have permission to delete personal expenses.');
      return;
    }
    try {
      await deleteMoneyTransaction(row.mtf_id);
      toast.success('Personal expense deleted.');
      fetchRows();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const tableData = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        mtf_trans_date_display: row.mtf_trans_date
          ? moment(row.mtf_trans_date).format('DD MMM YYYY').toUpperCase()
          : '-',
        firm_name: row.firm?.firm_name || '-',
        from_name: row.from_label || row.from_account?.acc_name || '-',
        to_names: row.destination_label || '-',
        expense_type_label: getExpenseTypeLabel(row.expense_type_label || row.mtf_panel),
        mode_label: modeLabel(row.mtf_mode),
        direction_label: directionLabel(row.mtf_direction),
        amount_display: formatAmt(row.mtf_total_amt),
        to_count: (row.to_rows || []).length,
      })),
    [rows]
  );

  const columns = useMemo(
    () => [
      { key: 'mtf_id', title: 'ID', orderable: true, searchable: true },
      { key: 'mtf_trans_date_display', title: 'Date', orderable: true, searchable: true },
      { key: 'firm_name', title: 'Firm', orderable: true, searchable: true },
      { key: 'expense_type_label', title: 'Expense type', orderable: true, searchable: true },
      { key: 'mode_label', title: 'Split', orderable: true, searchable: true },
      { key: 'direction_label', title: 'Entry', orderable: true, searchable: true },
      { key: 'from_name', title: 'From accounts', orderable: true, searchable: true },
      { key: 'to_names', title: 'To accounts', orderable: true, searchable: true },
      {
        key: 'amount_display',
        title: 'Amount (₹)',
        orderable: true,
        searchable: true,
        className: 'text-end fw-semibold text-brown',
      },
      { key: 'mtf_narration', title: 'Narration', orderable: true, searchable: true },
    ],
    []
  );

  return (
    <div className="card p-3 pt-2 shadow-sm app-module-panel">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="fw-bold text-brown mb-0">{PERSONAL_EXPENSE_LIST_TITLE}</h4>
          <p className="text-muted small mb-0">
            Personal expenses recorded between ledger accounts (journal linked).
          </p>
        </div>
        {canTransfer && (
          <Link to="/account/transfer/add" className="btn btn-primary">
            <FiPlusCircle className="me-1" /> {PERSONAL_EXPENSE_FORM_TITLE}
          </Link>
        )}
      </div>

      <List
        data={tableData}
        columns={columns}
        title={PERSONAL_EXPENSE_LIST_TITLE}
        isLoading={loading}
        hasDelete={canTransfer}
        onDelete={handleDelete}
        deleteConfirmMessage="Delete this personal expense? The linked journal entry will also be removed."
        showFooter={false}
        primaryKey="mtf_id"
        subtitleKey="from_name"
        amountKey="amount_display"
      />
    </div>
  );
};

export default InterAccountTransferList;
