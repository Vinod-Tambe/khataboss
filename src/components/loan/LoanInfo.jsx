import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/ActiveLoanPanel.css';
import DepositModal from './modal/DepositModal';
import TransactionModal from './modal/TransactionModal';
import { getGirviById } from '../../api/girviApi';
import moment from 'moment';
import { toast } from 'react-toastify';

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
        <label className="form-label">Interest Option</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.girv_roi_type ? data.girv_roi_type.toUpperCase() : ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Firm Name</label>
        <input type="text" className="form-control border-dark" readOnly value={data?.firm?.firm_name || ''} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Loan / Packet No</label>
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
          </label>
        </div>
      </div>
    </div>
  </div>
);

const ItemTable = ({ data }) => (
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
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.st_metal_type?.toUpperCase()}</td>
              <td>{item.st_item_name}</td>
              <td>{item.st_quantity}</td>
              <td>{item.st_gs_weight}</td>
              <td>{item.st_gs_type}</td>
              <td>{item.st_nt_weight}</td>
              <td>{item.st_nt_type}</td>
              <td>{item.st_purity}</td>
              <td>{item.st_fine_weight}</td>
              <td>{item.st_final_valuation}</td>
            </tr>
          )) : <tr><td colSpan="10">No items found</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const PrincipalInfoTable = ({ data, isUnsecured }) => (
  <div className="panel-section mt-2">
    <div className="section-header mb-2">Principal Information</div>
    <div className="table-responsive">
      <table className="table table-bordered text-center m-0">
        <thead>
          <tr>
            <th className='bg-blue text-brown border border-dark'>Status</th>
            <th className='bg-blue text-brown border border-dark'>Principal</th>
            <th className='bg-blue text-brown border border-dark'>ROI</th>
            <th className='bg-blue text-brown border border-dark'>S. Interest</th>
            <th className='bg-blue text-brown border border-dark'>Discount Amt</th>
            <th className='bg-blue text-brown border border-dark'>Extra Amt</th>
            <th className='bg-blue text-brown border border-dark'>Total</th>
            <th className='bg-blue text-brown border border-dark'>Start Date</th>
            <th className='bg-blue text-brown border border-dark'>End Date</th>
            <th className='bg-blue text-brown border border-dark'>Time Period</th>
            {!isUnsecured && <th className='bg-blue text-brown border border-dark'>Valuation</th>}
            {!isUnsecured && <th className='bg-blue text-brown border border-dark'>Profit/Loss</th>}
            <th className='bg-blue text-brown border border-dark'>User Image</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((row, idx) => (
            <tr key={idx}>
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
              <td>{row.userImg}</td>
            </tr>
          )) : <tr><td colSpan={isUnsecured ? "12" : "14"}>No data available</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const DepositInfoTable = ({ data }) => (
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


const ActionFooter = ({ onDepositClick, onTransactionClick, isReleased }) => (
  <div className="action-footer mt-4">
    <div className="d-flex flex-wrap gap-2 justify-content-center">
      <button className="btn btn-outline-primary btn-sm text-nowrap blue-btn" onClick={onDepositClick}>
        <i className="bi bi-file-text text-primary me-1"></i> FORM 8
      </button>
      {!isReleased && (
        <>
          <button className="btn btn-outline-info btn-sm text-nowrap blue-btn" onClick={onDepositClick}>
            <i className="bi bi-pencil text-info me-1"></i> Update
          </button>
          <button className="btn btn-outline-success btn-sm text-nowrap blue-btn" onClick={onDepositClick}>
            <i className="bi bi-box-arrow-in-down text-success me-1"></i> Deposit
          </button>
          <button className="btn btn-outline-warning btn-sm text-nowrap blue-btn fw-bold" onClick={onTransactionClick}>
            <i className="bi bi-currency-exchange text-warning me-1"></i> Make Transaction
          </button>
        </>
      )}
      <button className="btn btn-outline-info btn-sm text-nowrap blue-btn">
        <i className="bi bi-journal-text text-info me-1"></i> Logs
      </button>
      <button className="btn btn-outline-warning btn-sm text-nowrap blue-btn">
        <i className="bi bi-envelope-open text-warning me-1"></i> Notice
      </button>
      <button className="btn btn-outline-primary btn-sm text-nowrap blue-btn">
        <i className="bi bi-printer text-dark me-1"></i> Print
      </button>
      <button className="btn btn-outline-danger btn-sm text-nowrap blue-btn">
        <i className="bi bi-envelope text-warning me-1"></i> Alert
      </button>
      <button className="btn btn-outline-danger btn-sm text-nowrap blue-btn">
        <i className="bi bi-trash text-danger me-1"></i> Delete
      </button>
    </div>
  </div>
);

const LoanInfo = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchLoan = useCallback(async () => {
    try {
      const loanId = location.state?.loan?.girv_id;
      if (!loanId) {
        toast.error("No loan selected");
        navigate('/user/home/active-loan');
        return;
      }
      const response = await getGirviById(loanId);
      setLoanDetails(response.data || response);
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

  // Reconstruct original principal
  const totalAdditionalPrincipal = loanDetails.additionalPrincipals?.reduce((sum, ap) => sum + (parseFloat(ap.ap_prin_amt) || 0), 0) || 0;
  const totalReleasesPrincipal = loanDetails.releases?.reduce((sum, rel) => sum + (parseFloat(rel.rel_prin_amt) || 0), 0) || 0;
  const totalDepositsPrincipal = loanDetails.deposits?.reduce((sum, dep) => sum + (parseFloat(dep.dep_prin_amt) || 0), 0) || 0;

  // Note: girv_prin_amt in db includes all additional principals, but is reduced by deposits and releases
  const currentTotalPrincipal = parseFloat(loanDetails.girv_prin_amt) || 0;
  const originalPrincipal = Math.max(0, currentTotalPrincipal + totalReleasesPrincipal + totalDepositsPrincipal - totalAdditionalPrincipal);

  const roi = parseFloat(loanDetails.girv_roi) || 0;
  const startDate = moment(loanDetails.girv_start_date);
  const today = moment();

  // Time period in months for original principal
  const origMonths = Math.max(1, today.diff(startDate, 'months', true));

  // Calculate Interest for original principal
  const origInterest = parseFloat((originalPrincipal * roi * origMonths / 100).toFixed(2));

  let totalInterest = origInterest;

  // Pre-calculate additional interest to get overall payable amount for Profit/Loss
  let additionalInterestTotal = 0;
  if (loanDetails.additionalPrincipals && loanDetails.additionalPrincipals.length > 0) {
    loanDetails.additionalPrincipals.forEach(ap => {
      const apPrin = parseFloat(ap.ap_prin_amt) || 0;
      const apRoi = parseFloat(ap.ap_roi) || 0;
      const apStartDate = moment(ap.ap_trans_date);
      const apMonths = Math.max(1, today.diff(apStartDate, 'months', true));
      additionalInterestTotal += parseFloat((apPrin * apRoi * apMonths / 100).toFixed(2));
    });
  }

  const payableAmount = currentTotalPrincipal + origInterest + additionalInterestTotal;

  // Calculate Valuation
  const totalValuation = loanDetails.items?.reduce((sum, item) => sum + (parseFloat(item.st_final_valuation) || 0), 0) || 0;
  const overallProfitLoss = parseFloat((totalValuation - payableAmount).toFixed(2));

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
    timePeriod: `${origMonths.toFixed(1)} Months`,
    valuation: totalValuation, // Overall valuation
    profitLoss: overallProfitLoss, // Overall profit/loss
    status: loanDetails.girv_status || 'ACTIVE',
    userImg: '-'
  });

  // Calculate and Add Additional Principals Rows
  if (loanDetails.additionalPrincipals && loanDetails.additionalPrincipals.length > 0) {
    loanDetails.additionalPrincipals.forEach(ap => {
      const apPrin = parseFloat(ap.ap_prin_amt) || 0;
      const apRoi = parseFloat(ap.ap_roi) || 0;
      const apStartDate = moment(ap.ap_trans_date);
      const apMonths = Math.max(1, today.diff(apStartDate, 'months', true));
      const apInterest = parseFloat((apPrin * apRoi * apMonths / 100).toFixed(2));

      totalInterest += apInterest;

      principalDataRows.push({
        principal: apPrin,
        roi: apRoi,
        sInterest: apInterest,
        discount: 0,
        extraAmt: 0,
        total: apPrin + apInterest,
        startDate: apStartDate.format('DD-MM-YYYY'),
        endDate: today.format('DD-MM-YYYY'),
        timePeriod: `${apMonths.toFixed(1)} Months`,
        valuation: '-',
        profitLoss: '-',
        status: 'ADDED',
        userImg: '-'
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

      depositDataRows.push({
        principal: depPrin,
        sInterest: depInt,
        discount: depDisc,
        extraAmt: depExtra,
        total: depTotal,
        date: depDate.format('DD-MM-YYYY'),
        status: 'RECEIVED'
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

      releaseDataRows.push({
        principal: relPrin,
        sInterest: relInt,
        discount: relDisc,
        extraAmt: relExtra,
        total: relTotal,
        date: relDate.format('DD-MM-YYYY'),
        status: 'RELEASED'
      });
    });
  }

  const profitLoss = overallProfitLoss;

  // Attach computed fields for LoanInformation panel
  const loanInfoData = {
    ...loanDetails,
    girv_prin_amt: originalPrincipal, // Show original principal in the top panel
    payableAmount
  };

  return (
    <div className="active-loan-panel">
      {/* Top Header */}
      <div className="row">
        <div className="col-4">
          <h6 className="mt-2 fw-bold text-brown d-flex align-items-center">
            LOAN DETAILS PANEL
          </h6>
        </div>
        <div className="col-8">
          <div className="d-flex justify-content-end align-items-center w-100">
            <div className="top-actions mb-2 d-flex align-items-center gap-2">
              <span className={`badge ${loanDetails.girv_status === 'RELEASED' ? 'bg-danger' : 'bg-success'} px-3 py-2 shadow-sm rounded-pill`}>
                {loanDetails.girv_status}
              </span>
              <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={() => navigate(-1)} title="Back">
                <i className="bi bi-arrow-left-circle"></i>
              </button>
              <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 shadow-sm" title="Next">
                <i className="bi bi-arrow-right-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoanInformation data={loanInfoData} />

      {loanDetails.girv_type !== 'unsecured' && (
        <ItemTable data={loanDetails.items || []} />
      )}

      <PrincipalInfoTable data={principalDataRows} isUnsecured={loanDetails.girv_type === 'unsecured'} />

      <DepositInfoTable data={depositDataRows} />

      <ReleaseInfoTable data={releaseDataRows} />

      {/* Final Valuation Section */}
      <div className="panel-section mt-2">
        <div className="section-header mb-2">{loanDetails.girv_type === 'unsecured' ? 'Total Summary' : 'Final Valuation'}</div>
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
          {loanDetails.girv_type !== 'unsecured' && (
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
        onDepositClick={() => setActiveModal('deposit')}
        onTransactionClick={() => setActiveModal('transaction')}
        isReleased={loanDetails.girv_status === 'RELEASED'}
      />

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
        onSuccess={() => {
          setActiveModal(null);
          fetchLoan();
        }}
      />
    </div>
  );
};

export default LoanInfo;
