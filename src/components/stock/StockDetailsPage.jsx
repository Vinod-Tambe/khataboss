import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import { setSelectedUser } from '../../store/slices/userSlice';
import { getStockByUuid } from '../../api/stockApi';
import useOpenLoanDetails from '../../hooks/useOpenLoanDetails';
import {
  resolveCustomerProfileImage,
  resolveStockItemImageRef,
} from '../../utils/imageHelpers';
import ImageModal from '../common/ImageModal';
import StockItemImage from './StockItemImage';
import {
  formatStockValuation,
  formatStockWeight,
  stockCustomerName,
  stockDetailsPath,
  stockLoanRef,
  stockMetalToneClass,
} from '../../utils/stockFormatters';
import {
  formatListAmt,
  formatListDate,
  statusBadgeHtml,
} from '../../utils/listFormatters';
import { getCustomerPhoneParts } from '../../utils/customerFormatters';
import StockDetailInfoGrid from './StockDetailInfoGrid';
import '../../css/Stock.css';

const CUSTOMER_AVATAR_PLACEHOLDER =
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const buildPreviewPayload = (preview) => {
  if (!preview) return null;
  return {
    stock: preview,
    loan: preview.loan || null,
    loanItems: [],
  };
};

const StockDetailsPage = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openLoanDetails = useOpenLoanDetails();
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState(null);
  const [loan, setLoan] = useState(null);
  const [loanItems, setLoanItems] = useState([]);
  const [stockImagePreviewOpen, setStockImagePreviewOpen] = useState(false);

  const load = useCallback(async () => {
    const stockId = uuid ? decodeURIComponent(uuid) : '';
    if (!stockId) return;

    const previewPayload = buildPreviewPayload(location.state?.stockPreview);
    if (previewPayload?.stock) {
      setStock(previewPayload.stock);
      setLoan(previewPayload.loan);
      setLoanItems(previewPayload.loanItems);
    }

    try {
      setLoading(true);
      const payload = await getStockByUuid(stockId);
      if (payload?.stock) {
        setStock(payload.stock);
        setLoan(payload.loan || null);
        setLoanItems(payload.loanItems || []);
      } else if (!previewPayload?.stock) {
        throw new Error('Stock not found');
      }
    } catch (err) {
      console.error(err);
      if (!previewPayload?.stock) {
        toast.error(err?.error || err?.message || 'Failed to load stock details');
        navigate('/stock/grid', { replace: true });
      } else {
        toast.warn('Showing cached stock data. Some details may be incomplete.');
      }
    } finally {
      setLoading(false);
    }
  }, [uuid, navigate, location.state]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="card p-5 text-center app-module-panel">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted mb-0">Loading stock details…</p>
      </div>
    );
  }

  if (!stock) {
    return null;
  }

  const user = stock.user;
  const { url: stockImageUrl } = resolveStockItemImageRef(stock);
  const canPreviewStockImage = Boolean(stockImageUrl);
  const profileImg =
    resolveCustomerProfileImage(user) || CUSTOMER_AVATAR_PLACEHOLDER;

  const customerId =
    user?.user_unique_code ||
    (user?.user_id != null ? `CST-${user.user_id}` : '—');

  const { mobile } = getCustomerPhoneParts(user || {});
  const customerSpecItems = user
    ? [
        {
          key: 'name',
          label: 'Customer name',
          value: stockCustomerName(user),
        },
        {
          key: 'id',
          label: 'Customer ID',
          value: customerId,
        },
        {
          key: 'mobile',
          label: 'Mobile',
          value: mobile || '—',
        },
      ]
    : [];

  const openLoanInfo = () => {
    if (!loan?.girv_id) {
      toast.error('Loan not linked to this stock item');
      return;
    }
    openLoanDetails({ ...loan, user }, user);
  };

  const openCustomerHome = () => {
    if (!user?.user_id) {
      toast.error('Customer not found for this stock item');
      return;
    }
    dispatch(setSelectedUser(user));
    navigate('/user/home');
  };

  const firmName =
    String(stock.firm?.firm_name || stock.firm_name || '').trim();

  const stockSpecItems = [
    {
      key: 'name',
      label: 'Item name',
      value: stock.st_item_name || '—',
    },
    {
      key: 'valuation',
      label: 'Valuation',
      value: `₹ ${formatStockValuation(stock)}`,
    },
    {
      key: 'firm',
      label: 'Firm',
      value: firmName || '—',
    },
    { key: 'qty', label: 'Quantity', value: stock.st_quantity ?? '—' },
    {
      key: 'gs',
      label: 'Gross weight',
      value: formatStockWeight(stock.st_gs_weight, stock.st_gs_type),
    },
    {
      key: 'nt',
      label: 'Net weight',
      value: formatStockWeight(stock.st_nt_weight, stock.st_nt_type),
    },
    { key: 'purity', label: 'Purity', value: `${stock.st_purity ?? '—'}%` },
    {
      key: 'fine',
      label: 'Fine weight',
      value: formatStockWeight(stock.st_fine_weight, 'GM'),
    },
    { key: 'rate', label: 'Rate', value: `₹ ${formatListAmt(stock.st_rate)}` },
    {
      key: 'status',
      label: 'Item status',
      html: statusBadgeHtml(stock.st_status || '—'),
    },
  ];

  const loanSpecItems = loan
    ? [
        { key: 'start', label: 'Start date', value: formatListDate(loan.girv_start_date) },
        {
          key: 'type',
          label: 'Type',
          value: String(loan.girv_type || '—').toUpperCase(),
        },
        { key: 'prin', label: 'Principal', value: `₹ ${formatListAmt(loan.girv_prin_amt)}` },
        {
          key: 'final',
          label: 'Final amount',
          value: `₹ ${formatListAmt(loan.girv_final_amt)}`,
        },
        {
          key: 'roi',
          label: 'ROI',
          value: `${loan.girv_roi ?? '—'}% (${loan.girv_roi_type || '—'})`,
        },
        {
          key: 'int',
          label: 'Interest',
          value: `${loan.girv_interest_method || 'simple'}${
            loan.girv_compound_freq ? ` / ${loan.girv_compound_freq}` : ''
          }`,
        },
        { key: 'packet', label: 'Packet no', value: loan.girv_packet_no || '—' },
        { key: 'locker', label: 'Locker no', value: loan.girv_locker_no || '—' },
      ]
    : [];

  return (
    <div className="app-module-panel stock-module">
      <div className="card mb-3 p-3 stock-detail-actions">
        <div className="stock-detail-actions__bar d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary stock-detail-actions__back"
            onClick={() => navigate('/stock/grid')}
          >
            <i className="bi bi-arrow-left me-1" />
            Back to stock list
          </button>
          <div className="stock-detail-actions__end d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className="btn btn-danger"
              onClick={openLoanInfo}
              disabled={!loan?.girv_id}
            >
              <i className="bi bi-file-earmark-text me-1" />
              Loan info
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCustomerHome}
              disabled={!user?.user_id}
            >
              <i className="bi bi-person me-1" />
              Customer home
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3 stock-detail-page">
        <div className="col-12">
          <div className="card stock-detail-hero h-100">
            <div className="card-header stock-panel-header stock-panel-header--item d-flex flex-wrap align-items-center justify-content-between gap-2">
              <span className="fw-bold">
                <i className="bi bi-box-seam me-2" />
                Item details
              </span>
              {firmName ? (
                <span className="badge stock-firm-badge" title={firmName}>
                  {firmName}
                </span>
              ) : null}
            </div>
            <div className="card-body">
              <div className="stock-detail-item-top">
                <div className="stock-detail-item-row">
                  <div
                    className={`stock-detail-hero__img-wrap${
                      canPreviewStockImage ? ' stock-detail-hero__img-wrap--preview' : ''
                    }`}
                    role={canPreviewStockImage ? 'button' : undefined}
                    tabIndex={canPreviewStockImage ? 0 : undefined}
                    title={canPreviewStockImage ? 'Click to view image' : undefined}
                    onClick={() => {
                      if (canPreviewStockImage) {
                        setStockImagePreviewOpen(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        canPreviewStockImage &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        e.preventDefault();
                        setStockImagePreviewOpen(true);
                      }
                    }}
                  >
                    <StockItemImage
                      item={stock}
                      alt={stock.st_item_name || 'Stock item'}
                      variant="hero"
                    />
                    {canPreviewStockImage ? (
                      <span className="stock-detail-hero__zoom-hint" aria-hidden="true">
                        <i className="bi bi-zoom-in" />
                      </span>
                    ) : null}
                    <span
                      className={`stock-detail-hero__metal stock-metal-badge text-uppercase ${stockMetalToneClass(stock.st_metal_type)}`}
                    >
                      {stock.st_metal_type || '—'}
                    </span>
                  </div>
                  <div className="stock-detail-item-specs flex-grow-1 min-w-0">
                    <StockDetailInfoGrid items={stockSpecItems} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card stock-panel h-100">
            <div className="card-header stock-panel-header stock-panel-header--loan fw-bold">
              Linked loan
            </div>
            <div className="card-body">
              {loan ? (
                <>
                  <div className="stock-detail-loan-head d-flex flex-wrap align-items-center gap-2 mb-3">
                    <h5 className="fw-bold text-brown mb-0 stock-detail-loan-head__ref">
                      {stockLoanRef(loan)}
                    </h5>
                    <span
                      className="stock-detail-loan-head__status"
                      dangerouslySetInnerHTML={{
                        __html: statusBadgeHtml(loan.girv_status),
                      }}
                    />
                  </div>
                  <StockDetailInfoGrid items={loanSpecItems} />
                </>
              ) : (
                <p className="text-muted mb-0">This item is not linked to a loan record.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card stock-panel h-100">
            <div className="card-header stock-panel-header stock-panel-header--customer fw-bold">
              Customer
            </div>
            <div className="card-body">
              {user ? (
                <div className="stock-detail-customer">
                  <div className="stock-detail-customer__avatar-wrap">
                    <img
                      src={profileImg}
                      alt={stockCustomerName(user)}
                      className="stock-detail-customer__avatar"
                      onError={(e) => {
                        e.currentTarget.src = CUSTOMER_AVATAR_PLACEHOLDER;
                      }}
                    />
                  </div>
                  <StockDetailInfoGrid items={customerSpecItems} />
                  <button
                    type="button"
                    className="btn stock-detail-customer__home-btn w-100"
                    onClick={openCustomerHome}
                  >
                    <i className="bi bi-house-door-fill" aria-hidden="true" />
                    <span>Customer home</span>
                  </button>
                </div>
              ) : (
                <p className="text-muted mb-0">Customer not found.</p>
              )}
            </div>
          </div>
        </div>

        {loanItems.length > 1 && (
          <div className="col-12">
            <div className="card stock-panel">
              <div className="card-header stock-panel-header stock-panel-header--items fw-bold">
                Other items on this loan
              </div>
              <div className="card-body p-3">
                <div className="row g-3 stock-loan-siblings">
                  {loanItems
                    .filter((item) => item.st_uuid !== stock.st_uuid)
                    .map((item) => {
                      const openSibling = () => {
                        const path = stockDetailsPath(item);
                        if (path) {
                          navigate(path, { state: { stockPreview: item } });
                        }
                      };
                      return (
                        <div
                          key={item.st_uuid || item.st_id}
                          className="col-12 col-md-4"
                        >
                          <div
                            className="card stock-loan-sibling-card h-100"
                            role="button"
                            tabIndex={0}
                            onClick={openSibling}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openSibling();
                              }
                            }}
                          >
                            <div className="stock-loan-sibling-card__media">
                              <StockItemImage
                                item={item}
                                alt={item.st_item_name || 'Stock item'}
                                variant="sibling"
                              />
                              <span
                                className={`stock-loan-sibling-card__metal stock-metal-badge text-uppercase ${stockMetalToneClass(item.st_metal_type)}`}
                              >
                                {item.st_metal_type || '—'}
                              </span>
                            </div>
                            <div className="stock-loan-sibling-card__body">
                              <div
                                className="stock-loan-sibling-card__name fw-semibold text-truncate"
                                title={item.st_item_name || ''}
                              >
                                {item.st_item_name || '—'}
                              </div>
                              <div className="stock-loan-sibling-card__price">
                                ₹ {formatStockValuation(item)}
                              </div>
                              <span
                                className="stock-details-btn stock-loan-sibling-card__action"
                                aria-hidden="true"
                              >
                                View details
                                <i className="bi bi-arrow-right-short" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {stock.st_add_date && (
        <p className="text-center text-muted small mt-3 mb-0">
          Added {moment(stock.st_add_date).isValid()
            ? moment(stock.st_add_date).format('DD-MM-YYYY')
            : stock.st_add_date}
        </p>
      )}

      <ImageModal
        show={stockImagePreviewOpen}
        onHide={() => setStockImagePreviewOpen(false)}
        imageUrl={stockImageUrl}
        title={stock.st_item_name || 'Stock item image'}
        zoomable
      />
    </div>
  );
};

export default StockDetailsPage;
