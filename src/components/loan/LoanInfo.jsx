import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/ActiveLoanPanel.css';
import DepositModal from './modal/DepositModal';
import TransactionModal from './modal/TransactionModal';
import LoanRecordReceiptModal from './LoanRecordReceiptModal';
import { downloadLoanInvoicePdf } from './invoice/downloadLoanInvoicePdf';
import { getGirviById } from '../../api/girviApi';
import moment from 'moment';
import { toast } from 'react-toastify';
import { formatTimePeriod } from '../../utils/formatTimePeriod';
import { getStatusBadgeMeta } from '../../utils/listFormatters';
import {
  calculateInterest,
  getLoanInterestSummary,
  getTenureMonths,
} from '../../utils/loanInterest';
import ImageModal from '../common/ImageModal';
import '../../css/DataTable.css';

const formatAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const statusBadgeClass = (status = '', solid = false) => {
  const s = String(status).toUpperCase();

  if (solid) {
    if (s === 'RELEASED' || s === 'CLOSED') return 'bg-danger text-white fw-bold';
    if (s === 'AUCTION') return 'bg-warning text-dark fw-bold';
    if (s === 'TRANSFERRED') return 'bg-info text-white fw-bold';
    if (s === 'ADDED') return 'bg-primary text-white fw-bold';
    if (s === 'RECEIVED' || s === 'ACTIVE' || s === 'PAID' || s === 'COMPLETED') return 'bg-success text-white fw-bold';
    return 'bg-secondary text-white fw-bold';
  }

  if (s === 'RELEASED' || s === 'CLOSED') return 'bg-danger-subtle text-danger border border-danger fw-bold';
  if (s === 'AUCTION') return 'bg-warning-subtle text-dark border border-warning fw-bold';
  if (s === 'RECEIVED' || s === 'ACTIVE' || s === 'PAID' || s === 'COMPLETED') return 'bg-success-subtle text-success border border-success fw-bold';
  if (s === 'ADDED') return 'bg-primary-subtle text-primary border border-primary fw-bold';
  if (s === 'TRANSFERRED') return 'bg-info-subtle text-info border border-info fw-bold';
  return 'bg-secondary-subtle text-secondary border border-secondary fw-bold';
};

/** Resolve items from common API response shapes */
const getLoanItems = (loan) => {
  if (!loan) return [];
  const candidates = [
    loan.items,
    loan.stocks,
    loan.stock_items,
    loan.Items,
    loan.girviItems,
  ];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length > 0) return list;
  }
  return Array.isArray(loan.items) ? loan.items : [];
};

const getItemValuation = (item = {}) =>
  item.st_final_valuation ?? item.st_valuation ?? item.valuation ?? 0;

// Interest Calculation Helper
// Reusable Components
const LoanInformation = ({ data }) => (
  <div className="panel-section">
    <div className="row g-3">
      <div className="col-md-3">
        <label className="form-label">Principal Amount</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_prin_amt || ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Loan Start Date</label>
        <input type="date" className="form-control border-dark" readOnly value={data?.girv_start_date ? moment(data.girv_start_date).format('YYYY-MM-DD') : ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Interest Method</label>
        <input
          type="text"
          className="form-control border-dark"
          readOnly
          value={data?.girv_interest_method ?
            (data.girv_interest_method.toUpperCase() + (data.girv_interest_method === 'compound' && data.girv_compound_freq ? ` (${data.girv_compound_freq.toUpperCase()})` : ''))
            : 'SIMPLE'}
        />
      </div>
      <div className="col-md-3">
        <label className="form-label">Firm Name</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.firm?.firm_name || ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Packet No</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_packet_no || '-'} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Loan Locker No</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_locker_no || '-'} />
      </div>

      <div className="col-md-6 d-flex gap-3 align-items-end">
        <div className="flex-grow-1">
          <label className="form-label">Processing Amount</label>
          <div className="input-group">
            <input type="text" className="form-control border-dark" readOnly value={data?.girv_process_per || 0} />
            <span className="input-group-text border-dark">%</span>
            <input type="text" className="form-control border-dark" readOnly value={data?.girv_process_amt || 0} />
          </div>
        </div>
        <div className="flex-grow-1">
          <label className="form-label">Charge Amount</label>
          <div className="input-group">
            <input type="text" className="form-control border-dark" readOnly value={data?.girv_charge_per || 0} />
            <span className="input-group-text border-dark">%</span>
            <input type="text" className="form-control border-dark" readOnly value={data?.girv_charge_amt || 0} />
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <label className="form-label">Rate of Interest</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_roi || 0} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Interest Option</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_roi_type ? data.girv_roi_type.toUpperCase() : ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Payable Amount</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.payableAmount || 0} />
      </div>
      <div className="col-md-3 d-flex align-items-center mt-4 pt-2">
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="firstMonthInt" disabled checked={data?.girv_first_int === 'Y'} />
          <label className="form-check-label fw-bold text-primary" style={{ fontSize: '0.8rem' }} htmlFor="firstMonthInt">
            FIRST MONTH INT
            {data?.girv_first_int === 'Y' && data?.firstMonthInterest > 0
              ? ` (₹${formatAmt(data.firstMonthInterest)})`
              : ''}
          </label>
        </div>
      </div>
    </div>
  </div>
);

const backendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9000/' : 'https://khataboss.in/';
const resolveItemImage = (imgData) => {
  if (!imgData || imgData === '-') return null;
  if (typeof imgData === 'string' && imgData.startsWith('blob:')) return imgData;
  if (imgData.itemImage) return URL.createObjectURL(imgData.itemImage);

  let path = null;
  if (typeof imgData === 'string') {
    if (imgData.startsWith('{')) {
      try { path = JSON.parse(imgData).path; } catch (e) { }
    } else {
      path = imgData;
    }
  } else if (typeof imgData === 'object') {
    if (typeof imgData.st_image === 'string' && imgData.st_image.startsWith('{')) {
      try { path = JSON.parse(imgData.st_image).path; } catch (e) { }
    } else if (typeof imgData.st_image === 'string') {
      path = imgData.st_image;
    } else {
      path = imgData.st_image?.path || imgData.path || imgData.url;
    }
    path = path || imgData.st_image_url || imgData.image_url || imgData.user_image || imgData.ur_image;
  }

  if (!path) return null;
  if (path.startsWith('http')) return path;

  const cleanPath = String(path).replace(/\\/g, '/').replace(/^\/+/, '');
  return `${backendUrl}${cleanPath}`;
};

const ItemTable = ({ data, onImageClick }) => (
  <div className="panel-section mt-2">
    <div className="section-header mb-2">Item Information</div>
    <div className="table-responsive">
      <table className="table table-hover table-bordered table-striped text-center m-0">
        <thead>
          <tr>
            <th className='bg-pink border border-dark'>Metal Type</th>
            <th className='bg-pink border border-dark'>Item Name</th>
            <th className='bg-pink border border-dark'>Qty</th>
            <th className='bg-pink border border-dark'>GS WT</th>
            <th className='bg-pink border border-dark'>GS Type</th>
            <th className='bg-pink border border-dark'>NT WT</th>
            <th className='bg-pink border border-dark'>NT Type</th>
            <th className='bg-pink border border-dark'>Purity/Tunch</th>
            <th className='bg-pink border border-dark'>FN WT</th>
            <th className='bg-pink border border-dark'>Valuation</th>
            <th className='bg-pink border border-dark'>Image</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((item, idx) => {
            const resolvedImg = resolveItemImage(item);
            return (
              <tr key={item.st_id || item.id || idx} className="align-middle">
                <td>{String(item.st_metal_type || '-').toUpperCase()}</td>
                <td>{item.st_item_name || '-'}</td>
                <td>{item.st_quantity ?? '-'}</td>
                <td>{item.st_gs_weight ?? '-'}</td>
                <td>{item.st_gs_type || '-'}</td>
                <td>{item.st_nt_weight ?? '-'}</td>
                <td>{item.st_nt_type || '-'}</td>
                <td>{item.st_purity ?? '-'}</td>
                <td>{item.st_fine_weight ?? '-'}</td>
                <td>{getItemValuation(item)}</td>
                <td>
                  {resolvedImg ? (
                    <img
                      src={resolvedImg}
                      alt="Item"
                      style={{ width: '25px', height: '25px', objectFit: 'cover', cursor: 'pointer' }}
                      className="rounded shadow-sm border border-secondary"
                      onClick={() => onImageClick && onImageClick(resolvedImg)}
                    />
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            );
          }) : <tr><td colSpan="11">No items found</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const PrincipalInfoTable = ({ data, isUnsecured, onShare, onImageClick }) => (
  <div className="panel-section mt-2">
    <div className="section-header mb-2">Principal Information</div>
    <div className="table-responsive">
      <table className="table table-bordered text-center m-0">
        <thead>
          <tr>
            <th className='bg-blue text-brown border border-dark'>Status</th>
            <th className='bg-blue text-brown border border-dark'>Principal</th>
            <th className='bg-blue text-brown border border-dark'>ROI</th>
            <th className='bg-blue text-brown border border-dark'>Interest</th>
            <th className='bg-blue text-brown border border-dark'>Disc Amt</th>
            <th className='bg-blue text-brown border border-dark'>Extra Amt</th>
            <th className='bg-blue text-brown border border-dark'>Total</th>
            <th className='bg-blue text-brown border border-dark'>Start Date</th>
            <th className='bg-blue text-brown border border-dark'>End Date</th>
            <th className='bg-blue text-brown border border-dark'>T.Period</th>
            {!isUnsecured && <th className='bg-blue text-brown border border-dark'>Valuation</th>}
            {!isUnsecured && <th className='bg-blue text-brown border border-dark'>Profit/Loss</th>}
            <th className='bg-blue text-brown border border-dark'>User Image</th>
            <th className='bg-blue text-brown border border-dark'>Share</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((row, idx) => (
            <tr key={idx} className="align-middle">
              <td>{row.status}</td>
              <td>{Number(row.principal || 0).toFixed(2)}</td>
              <td>{row.roi}</td>
              <td>{Number(row.sInterest || 0).toFixed(2)}</td>
              <td>{Number(row.discount || 0).toFixed(2)}</td>
              <td>{Number(row.extraAmt || 0).toFixed(2)}</td>
              <td>{Number(row.total || 0).toFixed(2)}</td>
              <td>{row.startDate}</td>
              <td>{row.endDate}</td>
              <td>{row.timePeriod}</td>
              {!isUnsecured && <td>{row.valuation}</td>}
              {!isUnsecured && (
                row.profitLoss !== '-' ? (
                  <td className={row.profitLoss >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                    {row.profitLoss >= 0 ? `+${row.profitLoss}` : row.profitLoss}
                  </td>
                ) : (
                  <td>-</td>
                )
              )}
              <td>
                {row.userImg && row.userImg !== '-' ? (
                  <img
                    src={row.userImg}
                    alt="User"
                    style={{ width: '25px', height: '25px', objectFit: 'cover', cursor: 'pointer' }}
                    className="rounded shadow-sm border border-secondary"
                    onClick={() => onImageClick && onImageClick(row.userImg)}
                  />
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-warning p-0"
                  title="Share Receipt"
                  onClick={() => onShare?.(row)}
                >
                  <i className="bi bi-share-fill fs-6"></i>
                </button>
              </td>
            </tr>
          )) : <tr><td colSpan={isUnsecured ? "13" : "15"}>No data available</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const DepositInfoTable = ({ data, onShare }) => (
  data && data.length > 0 ? (
    <div className="panel-section mt-2">
      <div className="section-header mb-2">Deposit Information</div>
      <div className="table-responsive">
        <table className="table table-bordered text-center m-0">
          <thead>
            <tr>
              <th className='table-success text-brown border border-dark'>Status</th>
              <th className='table-success text-brown border border-dark'>Deposit Date</th>
              <th className='table-success text-brown border border-dark'>Principal Received</th>
              <th className='table-success text-brown border border-dark'>Interest Received</th>
              <th className='table-success text-brown border border-dark'>Discount Amount</th>
              <th className='table-success text-brown border border-dark'>Extra Amount</th>
              <th className='table-success text-brown border border-dark'>Total Received</th>
              <th className='table-success text-brown border border-dark'>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.status}</td>
                <td>{row.date}</td>
                <td className="text-success fw-bold">{Number(row.principal || 0).toFixed(2)}</td>
                <td className="text-success fw-bold">{Number(row.sInterest || 0).toFixed(2)}</td>
                <td className="text-success fw-bold">{Number(row.discount || 0).toFixed(2)}</td>
                <td className="text-success fw-bold">{Number(row.extraAmt || 0).toFixed(2)}</td>
                <td className="text-success fw-bold">{Number(row.total || 0).toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-warning p-0"
                    title="Share Receipt"
                    onClick={() => onShare?.(row)}
                  >
                    <i className="bi bi-share-fill fs-6"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null
);

const ReleaseInfoTable = ({ data }) => (
  data && data.length > 0 ? (
    <div className="panel-section mt-2">
      <div className="section-header mb-2 text-dark">Release Information</div>
      <div className="table-responsive">
        <table className="table table-bordered text-center m-0">
          <thead>
            <tr>
              <th className='table-danger text-brown border border-dark'>Status</th>
              <th className='table-danger text-brown border border-dark'>Release Date</th>
              <th className='table-danger text-brown border border-dark'>Principal Received</th>
              <th className='table-danger text-brown border border-dark'>Interest Received</th>
              <th className='table-danger text-brown border border-dark'>Discount Amount</th>
              <th className='table-danger text-brown border border-dark'>Extra Amount</th>
              <th className='table-danger text-brown border border-dark'>Total Received</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.status}</td>
                <td>{row.date}</td>
                <td className="text-danger fw-bold">{Number(row.principal || 0).toFixed(2)}</td>
                <td className="text-danger fw-bold">{Number(row.sInterest || 0).toFixed(2)}</td>
                <td className="text-danger fw-bold">{Number(row.discount || 0).toFixed(2)}</td>
                <td className="text-danger fw-bold">{Number(row.extraAmt || 0).toFixed(2)}</td>
                <td className="text-danger fw-bold">{Number(row.total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null
);


const ActionFooter = ({ onUpdateClick, onDepositClick, onTransactionClick, onInvoiceClick, isReleased, isAuction, isUpdateAllowed, isInvoiceDownloading }) => (
  <div className="action-footer mt-4">
    <div className="d-flex flex-wrap gap-2 justify-content-center">
      <button className="btn btn-sm text-nowrap blue-btn" onClick={onDepositClick}>
        <i className="bi bi-file-text text-primary me-1"></i> FORM 8
      </button>
      {isUpdateAllowed && !isAuction && (
        <button className="btn btn-sm text-nowrap blue-btn" onClick={onUpdateClick}>
          <i className="bi bi-pencil text-info me-1"></i> Update
        </button>
      )}
      {!isReleased && !isAuction && (
        <>
          <button className="btn btn-sm text-nowrap blue-btn" onClick={onDepositClick}>
            <i className="bi bi-box-arrow-in-down text-success me-1"></i> Deposit
          </button>
          <button className="btn btn-sm text-nowrap blue-btn fw-bold" onClick={onTransactionClick}>
            <i className="bi bi-currency-exchange text-warning me-1"></i> Make Transaction
          </button>
        </>
      )}
      <button className="btn btn-sm text-nowrap blue-btn">
        <i className="bi bi-journal-text text-info me-1"></i> Logs
      </button>
      <button className="btn btn-sm text-nowrap blue-btn">
        <i className="bi bi-envelope-open text-warning me-1"></i> Notice
      </button>
      <button
        className="btn btn-sm text-nowrap blue-btn"
        onClick={onInvoiceClick}
        disabled={isInvoiceDownloading}
      >
        <i className={`bi ${isInvoiceDownloading ? 'bi-hourglass-split' : 'bi-file-earmark-arrow-down'} text-primary me-1`}></i>
        {isInvoiceDownloading ? 'Downloading...' : 'Invoice'}
      </button>
      <button className="btn btn-sm text-nowrap blue-btn">
        <i className="bi bi-envelope text-warning me-1"></i> Alert
      </button>
      <button className="btn btn-sm text-nowrap blue-btn">
        <i className="bi bi-trash text-danger me-1"></i> Delete
      </button>
    </div>
  </div>
);

/** Clean label/value rows inside accordion expand */
const LoanMobileDetailRows = ({ rows = [], title }) => (
  <div className="loan-mobile-detail">
    {title ? <div className="loan-mobile-detail__heading">{title}</div> : null}
    <div className="loan-mobile-detail__list">
      {rows.map((row) => (
        <div key={row.label} className="loan-mobile-detail__row">
          <span className="loan-mobile-detail__label">{row.label}</span>
          <span className={`loan-mobile-detail__value ${row.className || ''}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/** Per-record accordion — collapse each record, not the section */
const LoanMobileAccordionItem = ({
  title,
  subtitle,
  badge,
  badgeClassName = '',
  defaultOpen = false,
  onShare,
  imageUrl,
  onImageClick,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={`loan-mobile-card loan-mobile-accordion ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="loan-mobile-accordion__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="loan-mobile-accordion__main d-flex align-items-center gap-2">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Thumbnail"
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              onClick={(e) => {
                e.stopPropagation();
                if (onImageClick) onImageClick(imageUrl);
              }}
            />
          )}
          <div>
            <p className="loan-mobile-card__title text-start">{title}</p>
            {subtitle ? <p className="loan-mobile-card__subtitle text-start">{subtitle}</p> : null}
          </div>
        </div>
        <div className="loan-mobile-accordion__meta">
          {badge ? (
            <span className={`badge rounded-pill loan-mobile-card__badge ${badgeClassName}`}>
              {badge}
            </span>
          ) : null}
          <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true"></i>
        </div>
      </button>
      {open && (
        <div className="loan-mobile-accordion__content">
          {children}
          {onShare && (
            <div className="loan-mobile-card__share">
              <button
                type="button"
                className="btn btn-outline-warning btn-sm loan-mobile-card__share-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <i className="bi bi-share-fill me-1"></i>
                Share
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const LoanMobileView = ({
  loanDetails,
  loanInfoData,
  loanItems = [],
  showItems = true,
  principalDataRows,
  depositDataRows,
  releaseDataRows,
  totalInterest,
  payableAmount,
  totalValuation,
  profitLoss,
  currentTotalPrincipal,
  originalPrincipal,
  totalAdditionalPrincipal,
  isUnsecured,
  isReleased,
  isAuction,
  isUpdateAllowed,
  isInvoiceDownloading,
  customerName = '',
  onBack,
  onUpdateClick,
  onDepositClick,
  onTransactionClick,
  onInvoiceClick,
  onSharePrincipal,
  onShareDeposit,
  onShareRelease,
  onImageClick,
}) => {
  const interestMethodLabel = loanInfoData?.girv_interest_method
    ? (
      loanInfoData.girv_interest_method.toUpperCase() +
      (loanInfoData.girv_interest_method === 'compound' && loanInfoData.girv_compound_freq
        ? ` (${loanInfoData.girv_compound_freq.toUpperCase()})`
        : '')
    )
    : 'SIMPLE';

  const displayPrincipal = loanDetails.girv_status === 'RELEASED'
    ? originalPrincipal + totalAdditionalPrincipal
    : currentTotalPrincipal;

  const overviewCards = [
    { label: 'Firm', value: loanInfoData?.firm?.firm_name || '-' },
    { label: 'Loan Code', value: loanInfoData?.girv_unique_code || loanInfoData?.girv_loan_no || loanInfoData?.girv_id || '-' },
    { label: 'Packet No', value: loanInfoData?.girv_packet_no || '-' },
    { label: 'Locker No', value: loanInfoData?.girv_locker_no || '-' },
    {
      label: 'Start Date',
      value: loanInfoData?.girv_start_date
        ? moment(loanInfoData.girv_start_date).format('DD-MM-YYYY')
        : '-',
    },
    { label: 'Method', value: interestMethodLabel },
    {
      label: 'ROI',
      value: `${loanInfoData?.girv_roi || 0}% ${loanInfoData?.girv_roi_type ? `(${String(loanInfoData.girv_roi_type).toUpperCase()})` : ''}`,
    },
    {
      label: 'Processing',
      value: `${loanInfoData?.girv_process_per || 0}% · ${formatAmt(loanInfoData?.girv_process_amt)}`,
    },
    {
      label: 'Charge',
      value: `${loanInfoData?.girv_charge_per || 0}% · ${formatAmt(loanInfoData?.girv_charge_amt)}`,
    },
    {
      label: 'First Month Int',
      value:
        loanInfoData?.girv_first_int === 'Y'
          ? `Yes${loanInfoData?.firstMonthInterest > 0 ? ` (₹${formatAmt(loanInfoData.firstMonthInterest)})` : ''}`
          : 'No',
    },
  ];

  return (
    <div className="d-md-none loan-mobile">
      <div className="loan-mobile-header">
        <div>
          <h5 className="loan-mobile-header__title d-flex align-items-center gap-2">
            Loan Information
            <span className="badge bg-primary-subtle border border-primary text-primary fw-bold fs-6 px-2 py-1">
              {loanInfoData?.girv_unique_code || loanInfoData?.girv_loan_no || (loanInfoData?.girv_id ? `LN-${loanInfoData.girv_id}` : '')}
            </span>
          </h5>
          <p className="loan-mobile-header__sub">
            {customerName ? <span className="d-block fw-semibold">{customerName}</span> : null}
            {loanInfoData?.girv_unique_code || (loanInfoData?.girv_packet_no ? `Packet #${loanInfoData.girv_packet_no}` : `Loan #${loanInfoData?.girv_id || '-'}`)}
            {loanInfoData?.firm?.firm_name ? ` · ${loanInfoData.firm.firm_name}` : ''}
          </p>
        </div>
        <div className="loan-mobile-header__actions">
          {(() => {
            const { label, icon, className } = getStatusBadgeMeta(loanDetails.girv_status);
            return (
              <span className={`${className} loan-info-header-badge loan-mobile-header__badge d-inline-flex align-items-center`}>
                <i className={`bi ${icon} me-2 fs-6`}></i>
                <h6 className="mb-0 fw-bold fs-6">{label}</h6>
              </span>
            );
          })()}
          <button type="button" className="btn btn-outline-secondary" onClick={onBack} aria-label="Back">
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>
      </div>

      <div className="loan-mobile-hero">
        <div className="loan-mobile-hero__tile is-principal">
          <span className="loan-mobile-hero__label">Principal</span>
          <span className="loan-mobile-hero__value">{formatAmt(displayPrincipal)}</span>
        </div>
        <div className="loan-mobile-hero__tile is-payable">
          <span className="loan-mobile-hero__label">Payable</span>
          <span className="loan-mobile-hero__value">{formatAmt(payableAmount)}</span>
        </div>
      </div>

      <div className="loan-mobile-stats">
        <div className="loan-mobile-stat">
          <span className="loan-mobile-stat__label">Interest</span>
          <span className="loan-mobile-stat__value">{formatAmt(totalInterest)}</span>
        </div>
        <div className="loan-mobile-stat">
          <span className="loan-mobile-stat__label">ROI</span>
          <span className="loan-mobile-stat__value">{loanInfoData?.girv_roi || 0}%</span>
        </div>
        {!isUnsecured && (
          <>
            <div className="loan-mobile-stat">
              <span className="loan-mobile-stat__label">Valuation</span>
              <span className="loan-mobile-stat__value">{formatAmt(totalValuation)}</span>
            </div>
            <div className="loan-mobile-stat">
              <span className="loan-mobile-stat__label">Profit / Loss</span>
              <span className={`loan-mobile-stat__value ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {profitLoss >= 0 ? `+${formatAmt(profitLoss)}` : formatAmt(profitLoss)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="loan-mobile-section-title">Loan Overview</div>
      <div className="loan-mobile-overview">
        {overviewCards.map((row) => (
          <div key={row.label} className="loan-mobile-overview__item">
            <span className="loan-mobile-overview__label">{row.label}</span>
            <span className="loan-mobile-overview__value">{row.value}</span>
          </div>
        ))}
      </div>

      {showItems && (
        <>
          <div className="loan-mobile-section-title">Item Information</div>
          <div className="loan-mobile-list">
            {loanItems.length > 0 ? (
              loanItems.map((item, idx) => (
                <LoanMobileAccordionItem
                  key={item.st_id || item.id || idx}
                  title={item.st_item_name || '-'}
                  subtitle={`${String(item.st_metal_type || '-').toUpperCase()} · Qty ${item.st_quantity ?? 0}`}
                  badge={formatAmt(getItemValuation(item))}
                  badgeClassName="loan-mobile-card__amount"
                  defaultOpen={loanItems.length === 1 || idx === 0}
                  imageUrl={resolveItemImage(item)}
                  onImageClick={onImageClick}
                >
                  <div className="loan-mobile-card__grid is-3">
                    <div>
                      <span className="loan-mobile-card__cell-label">GS WT</span>
                      <span className="loan-mobile-card__cell-value">{item.st_gs_weight ?? 0} {item.st_gs_type || ''}</span>
                    </div>
                    <div>
                      <span className="loan-mobile-card__cell-label">NT WT</span>
                      <span className="loan-mobile-card__cell-value">{item.st_nt_weight ?? 0} {item.st_nt_type || ''}</span>
                    </div>
                    <div>
                      <span className="loan-mobile-card__cell-label">Fine / Purity</span>
                      <span className="loan-mobile-card__cell-value">{item.st_fine_weight ?? 0} / {item.st_purity || '-'}</span>
                    </div>
                  </div>
                </LoanMobileAccordionItem>
              ))
            ) : (
              <div className="loan-mobile-empty">No items found</div>
            )}
          </div>
        </>
      )}

      <div className="loan-mobile-section-title">Principal Information</div>
      <div className="loan-mobile-list">
        {principalDataRows.length > 0 ? (
          principalDataRows.map((row, idx) => (
            <LoanMobileAccordionItem
              key={idx}
              title={`Principal · ${formatAmt(row.principal)}`}
              subtitle={`${row.startDate} → ${row.endDate}`}
              badge={row.status}
              badgeClassName={statusBadgeClass(row.status)}
              defaultOpen={false}
              onShare={() => onSharePrincipal?.(row)}
            >
              <LoanMobileDetailRows
                title="Loan Amount"
                rows={[
                  { label: 'Principal', value: formatAmt(row.principal) },
                  { label: 'ROI', value: `${row.roi}%` },
                  { label: 'Interest', value: formatAmt(row.sInterest) },
                  { label: 'Discount', value: formatAmt(row.discount) },
                  { label: 'Extra', value: formatAmt(row.extraAmt) },
                  { label: 'Total', value: formatAmt(row.total) },
                  { label: 'Period', value: row.timePeriod || '-' },
                ]}
              />
              <LoanMobileDetailRows
                title="Payment Mode"
                rows={[
                  { label: 'Trans Amt', value: formatAmt(row.transAmt ?? row.total) },
                  { label: 'Cash', value: formatAmt(row.cashAmt), className: 'text-success' },
                  { label: 'Bank', value: formatAmt(row.bankAmt), className: 'text-info' },
                  { label: 'Online', value: formatAmt(row.onlineAmt) },
                  { label: 'Card', value: formatAmt(row.cardAmt), className: 'text-warning' },
                ]}
              />
              {!isUnsecured && row.profitLoss !== '-' && (
                <LoanMobileDetailRows
                  title="Valuation"
                  rows={[
                    {
                      label: 'Valuation',
                      value: row.valuation === '-' ? '-' : formatAmt(row.valuation),
                    },
                    {
                      label: 'Profit / Loss',
                      value:
                        Number(row.profitLoss) >= 0
                          ? `+${formatAmt(row.profitLoss)}`
                          : formatAmt(row.profitLoss),
                      className: Number(row.profitLoss) >= 0 ? 'text-success' : 'text-danger',
                    },
                  ]}
                />
              )}
            </LoanMobileAccordionItem>
          ))
        ) : (
          <div className="loan-mobile-empty">No principal data</div>
        )}
      </div>

      {depositDataRows.length > 0 && (
        <>
          <div className="loan-mobile-section-title">Deposit Information</div>
          <div className="loan-mobile-list">
            {depositDataRows.map((row, idx) => (
              <LoanMobileAccordionItem
                key={idx}
                title={`Deposit · ${formatAmt(row.total)}`}
                subtitle={row.date}
                badge={row.status}
                badgeClassName={statusBadgeClass(row.status)}
                defaultOpen={false}
                onShare={() => onShareDeposit?.(row)}
              >
                <LoanMobileDetailRows
                  title="Deposit Amount"
                  rows={[
                    { label: 'Principal', value: formatAmt(row.principal), className: 'text-success' },
                    { label: 'Interest', value: formatAmt(row.sInterest), className: 'text-success' },
                    { label: 'Discount', value: formatAmt(row.discount), className: 'text-success' },
                    { label: 'Extra', value: formatAmt(row.extraAmt), className: 'text-success' },
                    { label: 'Total Received', value: formatAmt(row.total), className: 'text-success' },
                  ]}
                />
                <LoanMobileDetailRows
                  title="Payment Mode"
                  rows={[
                    { label: 'Trans Amt', value: formatAmt(row.transAmt ?? row.total) },
                    { label: 'Cash', value: formatAmt(row.cashAmt), className: 'text-success' },
                    { label: 'Bank', value: formatAmt(row.bankAmt), className: 'text-info' },
                    { label: 'Online', value: formatAmt(row.onlineAmt) },
                    { label: 'Card', value: formatAmt(row.cardAmt), className: 'text-warning' },
                  ]}
                />
              </LoanMobileAccordionItem>
            ))}
          </div>
        </>
      )}

      {releaseDataRows.length > 0 && (
        <>
          <div className="loan-mobile-section-title">Release Information</div>
          <div className="loan-mobile-list">
            {releaseDataRows.map((row, idx) => (
              <LoanMobileAccordionItem
                key={idx}
                title={`Release · ${formatAmt(row.total)}`}
                subtitle={row.date}
                badge={row.status}
                badgeClassName={statusBadgeClass(row.status)}
                defaultOpen={false}
                onShare={() => onShareRelease?.(row)}
              >
                <LoanMobileDetailRows
                  title="Release Amount"
                  rows={[
                    { label: 'Principal', value: formatAmt(row.principal), className: 'text-danger' },
                    { label: 'Interest', value: formatAmt(row.sInterest), className: 'text-danger' },
                    { label: 'Discount', value: formatAmt(row.discount), className: 'text-danger' },
                    { label: 'Extra', value: formatAmt(row.extraAmt), className: 'text-danger' },
                    { label: 'Total Received', value: formatAmt(row.total), className: 'text-danger' },
                  ]}
                />
                <LoanMobileDetailRows
                  title="Payment Mode"
                  rows={[
                    { label: 'Trans Amt', value: formatAmt(row.transAmt ?? row.total) },
                    { label: 'Cash', value: formatAmt(row.cashAmt), className: 'text-danger' },
                    { label: 'Bank', value: formatAmt(row.bankAmt), className: 'text-danger' },
                    { label: 'Online', value: formatAmt(row.onlineAmt), className: 'text-danger' },
                    { label: 'Card', value: formatAmt(row.cardAmt), className: 'text-danger' },
                  ]}
                />
              </LoanMobileAccordionItem>
            ))}
          </div>
        </>
      )}

      <div className="loan-mobile-section-title">
        {isUnsecured ? 'Total Summary' : 'Final Valuation'}
      </div>

      {loanDetails.girv_status === 'TRANSFERRED' && (
        <div className="alert alert-secondary loan-mobile-alert mb-3">
          <strong>Loan Transferred</strong>
          <div className="mt-1">
            {loanDetails.girv_other_info ||
              (loanDetails.girv_transfer_ml_id
                ? 'This loan has been transferred to a money lender.'
                : 'This loan has been transferred to another firm.')}
          </div>
        </div>
      )}

      <div className="loan-mobile-summary">
        <div className="loan-mobile-summary__tile">
          <span className="loan-mobile-summary__label">Total Principal</span>
          <span className="loan-mobile-summary__value">{formatAmt(displayPrincipal)}</span>
        </div>
        <div className="loan-mobile-summary__tile">
          <span className="loan-mobile-summary__label">Total Interest</span>
          <span className="loan-mobile-summary__value">{formatAmt(totalInterest)}</span>
        </div>
        <div className="loan-mobile-summary__tile">
          <span className="loan-mobile-summary__label">Total Amount</span>
          <span className="loan-mobile-summary__value">{formatAmt(payableAmount)}</span>
        </div>
        {!isUnsecured && (
          <>
            <div className="loan-mobile-summary__tile">
              <span className="loan-mobile-summary__label">Valuation</span>
              <span className="loan-mobile-summary__value">{formatAmt(totalValuation)}</span>
            </div>
            <div className="loan-mobile-summary__tile" style={{ gridColumn: '1 / -1' }}>
              <span className="loan-mobile-summary__label">Profit / Loss</span>
              <span className={`loan-mobile-summary__value ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                {profitLoss >= 0 ? `+${formatAmt(profitLoss)}` : formatAmt(profitLoss)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="loan-mobile-actions loan-mobile-actions--footer">
        <button type="button" className="btn loan-mobile-action-btn" onClick={onDepositClick}>
          <i className="bi bi-file-text text-primary"></i> Form 8
        </button>
        {isUpdateAllowed && !isAuction && (
          <button type="button" className="btn loan-mobile-action-btn" onClick={onUpdateClick}>
            <i className="bi bi-pencil text-info"></i> Update
          </button>
        )}
        {!isReleased && !isAuction && (
          <>
            <button type="button" className="btn loan-mobile-action-btn" onClick={onDepositClick}>
              <i className="bi bi-box-arrow-in-down text-success"></i> Deposit
            </button>
            <button type="button" className="btn loan-mobile-action-btn" onClick={onTransactionClick}>
              <i className="bi bi-currency-exchange text-warning"></i> Transaction
            </button>
          </>
        )}
        <button type="button" className="btn loan-mobile-action-btn">
          <i className="bi bi-journal-text text-info"></i> Logs
        </button>
        <button type="button" className="btn loan-mobile-action-btn">
          <i className="bi bi-envelope-open text-warning"></i> Notice
        </button>
        <button
          type="button"
          className="btn loan-mobile-action-btn"
          onClick={onInvoiceClick}
          disabled={isInvoiceDownloading}
        >
          <i className={`bi ${isInvoiceDownloading ? 'bi-hourglass-split' : 'bi-file-earmark-arrow-down'} text-primary`}></i>
          {isInvoiceDownloading ? '...' : 'Invoice'}
        </button>
        <button type="button" className="btn loan-mobile-action-btn">
          <i className="bi bi-envelope text-warning"></i> Alert
        </button>
        <button type="button" className="btn loan-mobile-action-btn">
          <i className="bi bi-trash text-danger"></i> Delete
        </button>
      </div>
    </div>
  );
};

const LoanInfo = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isInvoiceDownloading, setIsInvoiceDownloading] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptState, setReceiptState] = useState({ show: false, type: 'principal', record: null });
  const [previewImage, setPreviewImage] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);

  const customerName = selectedUser?.user_first_name
    ? `${selectedUser.user_first_name} ${selectedUser.user_last_name || ''}`.trim()
    : '';

  const openRecordReceipt = (type, record) => {
    setReceiptState({ show: true, type, record });
  };

  const closeRecordReceipt = () => {
    setReceiptState({ show: false, type: 'principal', record: null });
  };

  const handleInvoiceDownload = () => {
    if (!loanDetails || isInvoiceDownloading) return;
    try {
      setIsInvoiceDownloading(true);
      const fileName = downloadLoanInvoicePdf(loanDetails, selectedUser);
      toast.success(`Invoice downloaded: ${fileName}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download invoice');
    } finally {
      setIsInvoiceDownloading(false);
    }
  };

  const fetchLoan = useCallback(async () => {
    try {
      const loanId = location.state?.loan?.girv_id;
      if (!loanId) {
        toast.error("No loan selected");
        navigate('/user/home/active-loan');
        return;
      }
      const response = await getGirviById(loanId);
      const details = response?.data || response || {};
      const fromDetails = getLoanItems(details);
      const resolvedItems = fromDetails.length ? fromDetails : getLoanItems(response);
      // Keep items even if API nests them beside `data`
      setLoanDetails({
        ...details,
        items: resolvedItems,
      });
    } catch (err) {
      toast.error("Failed to load loan details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  if (loading) return <div className="p-4 text-center">Loading loan details...</div>;
  if (!loanDetails) return <div className="p-4 text-center">Loan not found.</div>;

  const hasTrans = (loanDetails?.additionalPrincipals && loanDetails.additionalPrincipals.length > 0) ||
    (loanDetails?.deposits && loanDetails.deposits.length > 0) ||
    (loanDetails?.releases && loanDetails.releases.length > 0);
  const isUpdateAllowed = loanDetails?.girv_status === 'ACTIVE' && !hasTrans;

  const totalAdditionalPrincipal =
    loanDetails.additionalPrincipals?.reduce(
      (sum, ap) => sum + (parseFloat(ap.ap_prin_amt) || 0),
      0
    ) || 0;

  const startDate = moment(loanDetails.girv_start_date);
  const today = moment();
  const interestSummary = getLoanInterestSummary(loanDetails, today);
  const {
    originalPrincipal,
    currentTotalPrincipal,
    origInterest,
    additionalInterestTotal,
    firstMonthInterest,
    pendingInterest,
    pendingPrincipal,
    totalInterest,
    roi,
    roiType,
    interestMethod,
    compoundFreq,
  } = interestSummary;

  const payableAmount =
    currentTotalPrincipal + origInterest + additionalInterestTotal - firstMonthInterest;

  // Calculate Valuation
  const loanItems = getLoanItems(loanDetails);
  const totalValuation = loanItems.reduce((sum, item) => sum + (parseFloat(getItemValuation(item)) || 0), 0);
  const overallProfitLoss = parseFloat((totalValuation - payableAmount).toFixed(2));

  const resolvedUserImg = resolveItemImage(loanDetails?.user?.user_profile_img || loanDetails?.user?.ur_image || loanDetails?.user?.user_image) || '-';

  const principalDataRows = [];

  // Add Original Principal Row
  principalDataRows.push({
    principal: originalPrincipal,
    roi: roi,
    sInterest: origInterest,
    discount: 0,
    extraAmt: 0,
    total: originalPrincipal + origInterest,
    startDate: startDate.format('DD-MM-YYYY'),
    endDate: today.format('DD-MM-YYYY'),
    timePeriod: formatTimePeriod(startDate, today),
    valuation: totalValuation, // Overall valuation
    profitLoss: overallProfitLoss, // Overall profit/loss
    status: loanDetails.girv_status || 'ACTIVE',
    userImg: resolvedUserImg,
    cashAmt: parseFloat(loanDetails.girv_cash_amt) || 0,
    bankAmt: parseFloat(loanDetails.girv_bank_amt) || 0,
    onlineAmt: parseFloat(loanDetails.girv_online_amt) || 0,
    cardAmt: parseFloat(loanDetails.girv_card_amt) || 0,
    transAmt:
      (parseFloat(loanDetails.girv_cash_amt) || 0) +
      (parseFloat(loanDetails.girv_bank_amt) || 0) +
      (parseFloat(loanDetails.girv_online_amt) || 0) +
      (parseFloat(loanDetails.girv_card_amt) || 0),
  });

  // Calculate and Add Additional Principals Rows
  if (loanDetails.additionalPrincipals && loanDetails.additionalPrincipals.length > 0) {
    loanDetails.additionalPrincipals.forEach(ap => {
      const apPrin = parseFloat(ap.ap_prin_amt) || 0;
      const apRoi = parseFloat(ap.ap_roi) || 0;
      const apStartDate = moment(ap.ap_trans_date);
      const apMonths = getTenureMonths(ap.ap_trans_date, today);
      const apInterest = calculateInterest(apPrin, apRoi, apMonths, interestMethod, compoundFreq, roiType);
      const cashAmt = parseFloat(ap.ap_cash_amt) || 0;
      const bankAmt = parseFloat(ap.ap_bank_amt) || 0;
      const onlineAmt = parseFloat(ap.ap_online_amt) || 0;
      const cardAmt = parseFloat(ap.ap_card_amt) || 0;

      principalDataRows.push({
        principal: apPrin,
        roi: apRoi,
        sInterest: apInterest,
        discount: 0,
        extraAmt: 0,
        total: apPrin + apInterest,
        startDate: apStartDate.format('DD-MM-YYYY'),
        endDate: today.format('DD-MM-YYYY'),
        timePeriod: formatTimePeriod(apStartDate, today),
        valuation: '-',
        profitLoss: '-',
        status: 'ADDED',
        userImg: '-',
        cashAmt,
        bankAmt,
        onlineAmt,
        cardAmt,
        transAmt: cashAmt + bankAmt + onlineAmt + cardAmt,
      });
    });
  }

  // Process Deposits Rows
  const depositDataRows = [];
  if (loanDetails.deposits && loanDetails.deposits.length > 0) {
    loanDetails.deposits.forEach(dep => {
      const depPrin = parseFloat(dep.dep_prin_amt) || 0;
      const depInt = parseFloat(dep.dep_int_amt) || 0;
      const depDisc = parseFloat(dep.dep_disc_amt) || 0;
      const depExtra = parseFloat(dep.dep_extra_amt) || 0;
      const depTotal = parseFloat(dep.dep_payable_amt) || 0;
      const depDate = moment(dep.dep_trans_date);
      const cashAmt = parseFloat(dep.dep_cash_amt) || 0;
      const bankAmt = parseFloat(dep.dep_bank_amt) || 0;
      const onlineAmt = parseFloat(dep.dep_online_amt) || 0;
      const cardAmt = parseFloat(dep.dep_card_amt) || 0;

      depositDataRows.push({
        principal: depPrin,
        sInterest: depInt,
        discount: depDisc,
        extraAmt: depExtra,
        total: depTotal,
        date: depDate.format('DD-MM-YYYY'),
        status: 'RECEIVED',
        cashAmt,
        bankAmt,
        onlineAmt,
        cardAmt,
        transAmt: cashAmt + bankAmt + onlineAmt + cardAmt || depTotal,
      });
    });
  }

  // Process Releases Rows
  const releaseDataRows = [];
  if (loanDetails.releases && loanDetails.releases.length > 0) {
    loanDetails.releases.forEach(rel => {
      const relPrin = parseFloat(rel.rel_prin_amt) || 0;
      const relInt = parseFloat(rel.rel_int_amt) || 0;
      const relDisc = parseFloat(rel.rel_disc_amt) || 0;
      const relExtra = parseFloat(rel.rel_extra_amt) || 0;
      const relTotal = parseFloat(rel.rel_payable_amt) || 0;
      const relDate = moment(rel.rel_trans_date);
      const cashAmt = parseFloat(rel.rel_cash_amt) || 0;
      const bankAmt = parseFloat(rel.rel_bank_amt) || 0;
      const onlineAmt = parseFloat(rel.rel_online_amt) || 0;
      const cardAmt = parseFloat(rel.rel_card_amt) || 0;

      releaseDataRows.push({
        principal: relPrin,
        sInterest: relInt,
        discount: relDisc,
        extraAmt: relExtra,
        total: relTotal,
        date: relDate.format('DD-MM-YYYY'),
        status: 'RELEASED',
        cashAmt,
        bankAmt,
        onlineAmt,
        cardAmt,
        transAmt: cashAmt + bankAmt + onlineAmt + cardAmt || relTotal,
      });
    });
  }

  const profitLoss = overallProfitLoss;

  // Attach computed fields for LoanInformation panel
  const loanInfoData = {
    ...loanDetails,
    girv_prin_amt: originalPrincipal, // Show original principal in the top panel
    payableAmount,
    firstMonthInterest,
    pendingInterest,
  };

  const isUnsecured = String(loanDetails.girv_type || '').toLowerCase() === 'unsecured';
  const isReleased = String(loanDetails.girv_status || '').toUpperCase() === 'RELEASED';
  const isAuction = String(loanDetails.girv_status || '').toUpperCase() === 'AUCTION';
  // Show items for secured loans, or whenever API returned item rows
  const showItems = !isUnsecured || loanItems.length > 0;

  return (
    <div className="active-loan-panel">
      <LoanMobileView
        loanDetails={loanDetails}
        loanInfoData={loanInfoData}
        loanItems={loanItems}
        showItems={showItems}
        principalDataRows={principalDataRows}
        depositDataRows={depositDataRows}
        releaseDataRows={releaseDataRows}
        totalInterest={totalInterest}
        payableAmount={payableAmount}
        totalValuation={totalValuation}
        profitLoss={profitLoss}
        currentTotalPrincipal={currentTotalPrincipal}
        originalPrincipal={originalPrincipal}
        totalAdditionalPrincipal={totalAdditionalPrincipal}
        isUnsecured={isUnsecured}
        isReleased={isReleased}
        isAuction={isAuction}
        isUpdateAllowed={isUpdateAllowed}
        isInvoiceDownloading={isInvoiceDownloading}
        customerName={customerName}
        onBack={() => navigate(-1)}
        onUpdateClick={() => navigate('/user/home/edit-loan/' + loanDetails.girv_id)}
        onDepositClick={() => setActiveModal('deposit')}
        onTransactionClick={() => setActiveModal('transaction')}
        onInvoiceClick={handleInvoiceDownload}
        onSharePrincipal={(row) => openRecordReceipt('principal', row)}
        onShareDeposit={(row) => openRecordReceipt('deposit', row)}
        onShareRelease={(row) => openRecordReceipt('release', row)}
        onImageClick={setPreviewImage}
      />

      {/* ========== Desktop view ========== */}
      <div className="d-none d-md-block">
        <div className="row align-items-center mb-2">
          <div className="col-4">
            <h5 className="fw-bold text-primary mb-0">LOAN DETAILS PANEL</h5>
          </div>
          <div className="col-8">
            <div className="d-flex justify-content-end align-items-stretch gap-2" style={{ height: '36px' }}>
              <span className="badge bg-primary-subtle border border-primary text-primary fw-bold fs-6 px-3 d-inline-flex align-items-center">
                {loanDetails.girv_unique_code || loanDetails.girv_loan_no || (loanDetails.girv_id ? `LN-${loanDetails.girv_id}` : '')}
              </span>
              {(() => {
                const { label, icon, className } = getStatusBadgeMeta(loanDetails.girv_status);
                return (
                  <span className={`${className} loan-info-header-badge shadow-sm px-3 d-inline-flex align-items-center`}>
                    <i className={`bi ${icon} me-2 fs-6`}></i>
                    <h6 className="mb-0 fw-bold fs-6">{label}</h6>
                  </span>
                );
              })()}
              <button className="btn btn-outline-danger btn-sm shadow-sm px-3 d-inline-flex align-items-center justify-content-center" onClick={() => navigate(-1)} title="Back">
                <i className="bi bi-arrow-left-circle fs-6"></i>
              </button>
              <button className="btn btn-outline-success btn-sm shadow-sm px-3 d-inline-flex align-items-center justify-content-center" title="Next">
                <i className="bi bi-arrow-right-circle fs-6"></i>
              </button>
            </div>
          </div>
        </div>

        <LoanInformation data={loanInfoData} />

        {showItems && (
          <ItemTable data={loanItems} onImageClick={setPreviewImage} />
        )}

        <PrincipalInfoTable
          data={principalDataRows}
          isUnsecured={isUnsecured}
          onShare={(row) => openRecordReceipt('principal', row)}
          onImageClick={setPreviewImage}
        />

        <DepositInfoTable
          data={depositDataRows}
          onShare={(row) => openRecordReceipt('deposit', row)}
        />

        <ReleaseInfoTable data={releaseDataRows} />

        <div className="panel-section mt-2">
          <div className="section-header mb-2">{isUnsecured ? 'Total Summary' : 'Final Valuation'}</div>

          {loanDetails.girv_status === 'TRANSFERRED' && (
            <div className="alert alert-secondary border-secondary border-start border-4 bg-secondary bg-opacity-10 text-dark mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle-fill text-secondary fs-4 me-3"></i>
                <div>
                  <strong className="d-block mb-1">Loan Transferred</strong>
                  {loanDetails.girv_other_info ||
                    (loanDetails.girv_transfer_ml_id
                      ? 'This loan has been transferred to a money lender.'
                      : 'This loan has been transferred to another firm.')}
                  {(loanDetails.girv_transfer_firm_id || loanDetails.girv_transfer_girv_id || loanDetails.girv_transfer_ml_id) && (
                    <div className="mt-1 small">
                      {loanDetails.girv_transfer_firm_id && <span className="me-3"><strong>Target Firm ID:</strong> {loanDetails.girv_transfer_firm_id}</span>}
                      {loanDetails.girv_transfer_ml_id && (
                        <span className="me-3">
                          <strong>Money Lender:</strong>{' '}
                          {loanDetails.transferMoneyLender
                            ? [loanDetails.transferMoneyLender.ml_first_name, loanDetails.transferMoneyLender.ml_last_name].filter(Boolean).join(' ')
                            : `#${loanDetails.girv_transfer_ml_id}`}
                        </span>
                      )}
                      {loanDetails.girv_transfer_girv_id && <span><strong>New Loan ID:</strong> {loanDetails.girv_transfer_girv_id}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row g-2 text-center mx-0">
            <div className="col">
              <div className="border border-dark h-100">
                <div className="bg-cust-info text-brown fw-bold p-1 border-bottom border-dark">Total Principal</div>
                <div className="p-2 fw-bold">
                  {loanDetails.girv_status === 'RELEASED'
                    ? (originalPrincipal + totalAdditionalPrincipal).toFixed(2)
                    : currentTotalPrincipal.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="border border-dark h-100">
                <div className="bg-cust-info text-brown fw-bold p-1 border-bottom border-dark">Total Interest</div>
                <div className="p-2 fw-bold">{totalInterest.toFixed(2)}</div>
              </div>
            </div>
            <div className="col">
              <div className="border border-dark h-100">
                <div className="bg-cust-info text-brown fw-bold p-1 border-bottom border-dark">Total Amount</div>
                <div className="p-2 fw-bold">{payableAmount.toFixed(2)}</div>
              </div>
            </div>
            {!isUnsecured && (
              <>
                <div className="col">
                  <div className="border border-dark h-100">
                    <div className="bg-cust-info text-brown fw-bold p-1 border-bottom border-dark">Valuation</div>
                    <div className="p-2 fw-bold">{totalValuation.toFixed(2)}</div>
                  </div>
                </div>
                <div className="col">
                  <div className="border border-dark h-100">
                    <div className="bg-cust-info text-brown fw-bold p-1 border-bottom border-dark">Profit/Loss</div>
                    <div className={`p-2 fw-bold ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {profitLoss >= 0 ? `+${profitLoss.toFixed(2)}` : profitLoss.toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <ActionFooter
          onUpdateClick={() => navigate('/user/home/edit-loan/' + loanDetails.girv_id)}
          onDepositClick={() => setActiveModal('deposit')}
          onTransactionClick={() => setActiveModal('transaction')}
          onInvoiceClick={handleInvoiceDownload}
          isInvoiceDownloading={isInvoiceDownloading}
          isReleased={isReleased}
          isAuction={isAuction}
          isUpdateAllowed={isUpdateAllowed}
        />
      </div>

      <DepositModal
        isOpen={activeModal === 'deposit'}
        onClose={() => setActiveModal(null)}
        loanDetails={loanDetails}
        totalDueAmount={payableAmount}
        onSuccess={() => {
          setActiveModal(null);
          fetchLoan();
        }}
      />
      <TransactionModal
        isOpen={activeModal === 'transaction'}
        onClose={() => setActiveModal(null)}
        loanDetails={loanDetails}
        totalDueAmount={payableAmount}
        pendingPrincipal={pendingPrincipal}
        pendingInterest={pendingInterest}
        onSuccess={() => {
          setActiveModal(null);
          fetchLoan();
        }}
      />

      <LoanRecordReceiptModal
        show={receiptState.show}
        onHide={closeRecordReceipt}
        type={receiptState.type}
        record={receiptState.record}
        loanDetails={loanDetails}
        customer={selectedUser}
      />

      {/* Image Preview Modal */}
      <ImageModal
        show={!!previewImage}
        onHide={() => setPreviewImage(null)}
        imageUrl={previewImage}
        title="Image Preview"
      />
    </div>
  );
};

export default LoanInfo;
