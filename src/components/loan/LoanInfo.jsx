import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/ActiveLoanPanel.css';
import DynamicActionModal from './DynamicActionModal';
import { modalConfigs } from '../../utils/modalConfigs';
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

const OtherInfoTable = ({ data }) => (
  <div className="panel-section mt-2">
    <div className="section-header mb-2">Other Information</div>
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover text-center m-0">
        <thead>
          <tr>
            <th className='bg-blue text-brown border border-dark'>Principal</th>
            <th className='bg-blue text-brown border border-dark'>ROI</th>
            <th className='bg-blue text-brown border border-dark'>S. Interest</th>
            <th className='bg-blue text-brown border border-dark'>Discount</th>
            <th className='bg-blue text-brown border border-dark'>Extra Amt</th>
            <th className='bg-blue text-brown border border-dark'>Total</th>
            <th className='bg-blue text-brown border border-dark'>Start Date</th>
            <th className='bg-blue text-brown border border-dark'>End Date</th>
            <th className='bg-blue text-brown border border-dark'>Time Period</th>
            <th className='bg-blue text-brown border border-dark'>Valuation</th>
            <th className='bg-blue text-brown border border-dark'>Profit/Loss</th>
            <th className='bg-blue text-brown border border-dark'>Status</th>
            <th className='bg-blue text-brown border border-dark'>User Image</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? data.map((row, idx) => (
            <tr key={idx}>
              <td>{row.principal}</td>
              <td>{row.roi}</td>
              <td>{row.sInterest}</td>
              <td>{row.discount}</td>
              <td>{row.extraAmt}</td>
              <td>{row.total}</td>
              <td>{row.startDate}</td>
              <td>{row.endDate}</td>
              <td>{row.timePeriod}</td>
              <td>{row.valuation}</td>
              <td className={row.profitLoss >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                {row.profitLoss >= 0 ? `+${row.profitLoss}` : row.profitLoss}
              </td>
              <td>{row.status}</td>
              <td>{row.userImg}</td>
            </tr>
          )) : <tr><td colSpan="13">No data available</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionFooter = ({ onDepositClick, onReleaseClick, onAddPrincipalClick, onTransferClick, onAuctionClick }) => (
  <div className="action-footer mt-4">
    <div className="d-flex flex-nowrap overflow-auto gap-2 pb-2">
      <button className="btn btn-outline-primary btn-sm text-nowrap" onClick={onDepositClick}><i className="bi bi-file-text"></i> FORM 8</button>
      <button className="btn btn-outline-info btn-sm text-nowrap" onClick={onDepositClick}><i className="bi bi-pencil"></i> Edit</button>
      <button className="btn btn-outline-secondary btn-sm text-nowrap" onClick={onDepositClick}><i className="bi bi-envelope"></i> Notice</button>
      <button className="btn btn-outline-success btn-sm text-nowrap" onClick={onDepositClick}><i className="bi bi-box-arrow-in-down"></i> Deposit</button>
      <button className="btn btn-outline-info btn-sm text-nowrap" onClick={onAddPrincipalClick}><i className="bi bi-plus-circle"></i> A.Prin.Amt</button>
      <button className="btn btn-outline-warning btn-sm text-nowrap" onClick={onTransferClick}><i className="bi bi-arrow-left-right"></i> Transfer</button>
      <button className="btn btn-outline-success btn-sm text-nowrap" onClick={onReleaseClick}><i className="bi bi-box-arrow-up-right"></i> Release</button>
      <button className="btn btn-outline-dark btn-sm text-nowrap" onClick={onAuctionClick}><i className="bi bi-gear"></i> Auction</button>
      <button className="btn btn-outline-danger btn-sm text-nowrap"><i className="bi bi-bell"></i> Notice</button>
      <button className="btn btn-outline-secondary btn-sm text-nowrap"><i className="bi bi-sliders"></i> Customize</button>
      <button className="btn btn-outline-primary btn-sm text-nowrap"><i className="bi bi-printer"></i> Print</button>
      <button className="btn btn-outline-danger btn-sm text-nowrap"><i className="bi bi-trash"></i> Delete</button>
    </div>
  </div>
);

const LoanInfo = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoan = async () => {
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
    };
    fetchLoan();
  }, [location.state, navigate]);

  if (loading) return <div className="p-4 text-center">Loading loan details...</div>;
  if (!loanDetails) return <div className="p-4 text-center">Loan not found.</div>;

  // Perform Calculations
  const principal = parseFloat(loanDetails.girv_prin_amt) || 0;
  const roi = parseFloat(loanDetails.girv_roi) || 0;
  const startDate = moment(loanDetails.girv_start_date);
  const today = moment();
  
  // Time period in months
  const months = Math.max(1, today.diff(startDate, 'months', true));
  
  // Calculate Interest (Simple Interest: P * R * T)
  const sInterest = parseFloat((principal * roi * months / 100).toFixed(2));
  const payableAmount = principal + sInterest;
  
  // Calculate Valuation
  const totalValuation = loanDetails.items?.reduce((sum, item) => sum + (parseFloat(item.st_final_valuation) || 0), 0) || 0;
  
  // Profit / Loss = Valuation - Payable Amount
  const profitLoss = parseFloat((totalValuation - payableAmount).toFixed(2));
  
  const timePeriodText = `${months.toFixed(1)} Months`;

  // Attach computed fields for LoanInformation panel
  const loanInfoData = {
    ...loanDetails,
    payableAmount
  };

  const otherData = [{
    principal,
    roi,
    sInterest,
    discount: 0, // Placeholder
    extraAmt: 0, // Placeholder
    total: payableAmount,
    startDate: startDate.format('DD-MM-YYYY'),
    endDate: today.format('DD-MM-YYYY'),
    timePeriod: timePeriodText,
    valuation: totalValuation,
    profitLoss: profitLoss,
    status: loanDetails.girv_status || 'ACTIVE',
    userImg: '-' // Placeholder
  }];

  return (
    <div className="active-loan-panel">
      {/* Top Header */}
      <div className="row">
        <div className="col-6">   <h6 className="mt-2 fw-bold text-brown">LOAN DETAILS PANEL</h6></div>
        <div className="col-6">
          <div className="d-flex flex-column align-items-end">
            <div className="top-actions mb-2">
              <button className="btn btn-outline-primary btn-sm pe-3 me-3">LOAN LOGS <i className="bi bi-journal-text ms-2"></i></button>
              <button className="btn btn-outline-danger btn-sm me-3 text-center" onClick={() => navigate(-1)}><i className="bi bi-arrow-left-circle"></i></button>
              <button className="btn btn-outline-success btn-sm me-3"><i className="bi bi-arrow-right-circle"></i></button>
            </div>
          </div>
        </div>
      </div>

      <LoanInformation data={loanInfoData} />

      {loanDetails.girv_type !== 'unsecured' && (
        <ItemTable data={loanDetails.items || []} />
      )}

      <OtherInfoTable data={otherData} />

      {/* Final Valuation Section */}
      <div className="panel-section mt-2">
        <div className="section-header mb-2">Final Valuation</div>
        <div className="table-responsive">
          <table className="table table-bordered text-center m-0">
            <thead>
              <tr>
                <th className="bg-cust-info text-brown border border-dark">Total Principal</th>
                <th className="bg-cust-info text-brown border border-dark">Total Interest</th>
                <th className="bg-cust-info text-brown border border-dark">Total Amount</th>
                <th className="bg-cust-info text-brown border border-dark">Valuation</th>
                <th className="bg-cust-info text-brown border border-dark">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold">{principal.toFixed(2)}</td>
                <td className="fw-bold">{sInterest.toFixed(2)}</td>
                <td className="fw-bold">{payableAmount.toFixed(2)}</td>
                <td className="fw-bold">{totalValuation.toFixed(2)}</td>
                <td className={`fw-bold ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                  {profitLoss >= 0 ? `+${profitLoss.toFixed(2)}` : profitLoss.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ActionFooter
        onDepositClick={() => setActiveModal('deposit')}
        onReleaseClick={() => setActiveModal('release')}
        onAddPrincipalClick={() => setActiveModal('addPrincipal')}
        onTransferClick={() => setActiveModal('transfer')}
        onAuctionClick={() => setActiveModal('auction')}
      />

      <DynamicActionModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        config={activeModal ? modalConfigs[activeModal] : null}
      />
    </div>
  );
};

export default LoanInfo;
