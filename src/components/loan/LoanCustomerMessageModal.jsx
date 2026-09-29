import React, { useMemo, useState } from 'react';
import CommonModal from '../common/CommonModal';
import { toast } from 'react-toastify';
import {
  dispatchLoanCustomerMessage,
  LOAN_ALERT_TEMPLATE,
  LOAN_NOTICE_TEMPLATE,
  getLoanDispatchContext,
  buildLoanReminderVars,
} from '../../utils/dispatchWhatsAppReceipt';

const KIND_META = {
  alert: {
    title: 'Send payment reminder (Alert)',
    templateKey: LOAN_ALERT_TEMPLATE,
    description:
      'Sends the loan due reminder template with amount due and due date on WhatsApp, email, and SMS.',
  },
  notice: {
    title: 'Send loan notice',
    templateKey: LOAN_NOTICE_TEMPLATE,
    description:
      'Sends the official loan notice template with outstanding balance. Attach invoice PDF when available.',
  },
};

const LoanCustomerMessageModal = ({
  show,
  onHide,
  kind = 'alert',
  customer,
  loanDetails,
  amountDue = 0,
  dueDate,
}) => {
  const [sending, setSending] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);

  const meta = KIND_META[kind] || KIND_META.alert;

  const ctx = useMemo(
    () => (loanDetails ? getLoanDispatchContext(customer, loanDetails) : null),
    [customer, loanDetails]
  );

  const previewVars = useMemo(() => {
    if (!ctx) return null;
    return buildLoanReminderVars(ctx, amountDue, dueDate);
  }, [ctx, amountDue, dueDate]);

  const handleSend = async () => {
    if (!loanDetails || sending) return;

    setSending(true);
    try {
      const { message } = await dispatchLoanCustomerMessage({
        kind,
        customer,
        loanDetails,
        amountDue,
        dueDate,
        channels: { whatsapp, email, sms },
      });
      toast.success(message);
      onHide();
    } catch (err) {
      console.error('Loan message dispatch failed:', err);
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const hasPhone = Boolean(ctx?.toPhone);
  const hasEmail = Boolean(ctx?.toEmail);

  return (
    <CommonModal show={show} onHide={onHide} title={meta.title} size="md">
      <div className="p-3">
        <p className="text-muted small mb-3">{meta.description}</p>
        <p className="small mb-2">
          Template: <code>{meta.templateKey}</code>
        </p>

        {previewVars && (
          <div className="border rounded p-2 mb-3 bg-light small">
            <div>
              <strong>Customer:</strong> {previewVars[1]}
            </div>
            <div>
              <strong>Loan:</strong> {previewVars[2]}
            </div>
            <div>
              <strong>{kind === 'notice' ? 'Outstanding' : 'Amount due'}:</strong> {previewVars[3]}
            </div>
            <div>
              <strong>{kind === 'notice' ? 'Notice date' : 'Due date'}:</strong> {previewVars[4]}
            </div>
          </div>
        )}

        <fieldset className="mb-3">
          <legend className="form-label fw-semibold mb-2">Channels</legend>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="loan-msg-wa"
              checked={whatsapp}
              disabled={!hasPhone}
              onChange={(e) => setWhatsapp(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="loan-msg-wa">
              WhatsApp {hasPhone ? `(${ctx.toPhone})` : '(no mobile on customer)'}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="loan-msg-email"
              checked={email}
              disabled={!hasEmail}
              onChange={(e) => setEmail(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="loan-msg-email">
              Email {hasEmail ? `(${ctx.toEmail})` : '(no email on customer)'}
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="loan-msg-sms"
              checked={sms}
              disabled={!hasPhone}
              onChange={(e) => setSms(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="loan-msg-sms">
              Text / SMS (opens your SMS app with the template message)
            </label>
          </div>
        </fieldset>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onHide} disabled={sending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSend}
            disabled={sending || (!whatsapp && !email && !sms)}
          >
            {sending ? 'Sending…' : 'Send reminder'}
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default LoanCustomerMessageModal;
