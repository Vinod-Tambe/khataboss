import React, { useState } from 'react';
import '../../css/ActiveLoanPanel.css';
import DynamicActionModal from './DynamicActionModal';
import { modalConfigs } from '../../utils/modalConfigs';

// Reusable Components
const LoanInformation = () => (
  <div className="panel-section">
    <div className="section-header">Loan Information</div>
    <div className="row g-3">
      <div className="col-md-3">
        <label className="form-label">Principal Amount</label>
        <input type="text" className="form-control" defaultValue="5000" />
      </div>
      <div className="col-md-3">
        <label className="form-label">Loan Start Date</label>
        <input type="date" className="form-control" defaultValue="2025-02-02" />
      </div>
      <div className="col-md-3">
        <label className="form-label">Firm Name</label>
        <input type="text" className="form-control" defaultValue="Swami" />
      </div>
      <div className="col-md-3">
        <label className="form-label">Staff</label>
        <select className="form-select">
          <option>ADMIN</option>
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">Packet No.</label>
        <input type="text" className="form-control" defaultValue="-" />
      </div>
      <div className="col-md-3">
        <label className="form-label">Locker No.</label>
        <input type="text" className="form-control" defaultValue="-" />
      </div>

      <div className="col-md-6 d-flex gap-3 align-items-end">
        <div className="flex-grow-1">
          <label className="form-label">Processing Amount</label>
          <div className="input-group">
            <input type="text" className="form-control" />
            <span className="input-group-text">%</span>
            <input type="text" className="form-control" defaultValue="-" />
          </div>
        </div>
        <div className="flex-grow-1">
          <label className="form-label">Charge Amount</label>
          <div className="input-group">
            <input type="text" className="form-control" defaultValue="2" />
            <span className="input-group-text">%</span>
            <input type="text" className="form-control" defaultValue="100" />
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <label className="form-label">Rate of Interest</label>
        <input type="text" className="form-control" defaultValue="2" />
      </div>
      <div className="col-md-3">
        <label className="form-label">Interest Option</label>
        <select className="form-select">
          <option>MONTHLY</option>
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label">Payable Amount</label>
        <input type="text" className="form-control" readOnly defaultValue="5000" />
      </div>
      <div className="col-md-3 d-flex align-items-center mt-4 pt-2">
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="firstMonthInt" defaultChecked />
          <label className="form-check-label fw-bold text-primary" style={{ fontSize: '0.8rem' }} htmlFor="firstMonthInt">
            FIRST MONTH INT
          </label>
        </div>
      </div>
    </div>
  </div>
);

const ItemTable = ({ data }) => (
  <div className="panel-section">
    <div className="section-header">Item Information</div>
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover text-center m-0">
        <thead>
          <tr>
            <th>Metal Type</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>GS WT</th>
            <th>GS Type</th>
            <th>NT WT</th>
            <th>NT Type</th>
            <th>Purity/Tunch</th>
            <th>FN WT</th>
            <th>Valuation</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.metal}</td>
              <td>{item.item}</td>
              <td>{item.qty}</td>
              <td>{item.gsWt}</td>
              <td>{item.gsType}</td>
              <td>{item.ntWt}</td>
              <td>{item.ntType}</td>
              <td>{item.purity}</td>
              <td>{item.fnWt}</td>
              <td>{item.valuation}</td>
              <td>{item.img}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const OtherInfoTable = ({ data }) => (
  <div className="panel-section">
    <div className="section-header">Other Information</div>
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover text-center m-0">
        <thead>
          <tr>
            <th>Principal</th>
            <th>ROI</th>
            <th>S. Interest</th>
            <th>Discount</th>
            <th>Extra Amt</th>
            <th>Total</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Time Period</th>
            <th>Valuation</th>
            <th>Profit/Loss</th>
            <th>Status</th>
            <th>User Image</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
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
              <td>{row.profitLoss}</td>
              <td>{row.status}</td>
              <td>{row.userImg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActionFooter = ({ onDepositClick, onReleaseClick, onAddPrincipalClick, onTransferClick, onAuctionClick }) => (
  <div className="action-footer">
    <button className="btn"><i className="bi bi-file-text"></i> Form</button>
    <button className="btn"><i className="bi bi-upc-scan"></i> Barcode</button>
    <button className="btn" onClick={onDepositClick}><i className="bi bi-box-arrow-in-down"></i> Deposit</button>
    <button className="btn text-warning border-warning"><i className="bi bi-pencil"></i> Update</button>
    <button className="btn" onClick={onAddPrincipalClick}><i className="bi bi-plus-circle"></i> A. Prin. Amt</button>
    <button className="btn text-success border-success" onClick={onReleaseClick}><i className="bi bi-box-arrow-up-right"></i> Release</button>
    <button className="btn text-info border-info" onClick={onTransferClick}><i className="bi bi-arrow-left-right"></i> Transfer</button>
    <button className="btn text-secondary border-secondary" onClick={onAuctionClick}><i className="bi bi-gear"></i> Action</button>
    <button className="btn text-warning border-warning"><i className="bi bi-bell"></i> Notice</button>
    <button className="btn text-secondary border-secondary"><i className="bi bi-sliders"></i> Customize</button>
    <button className="btn text-primary border-primary"><i className="bi bi-printer"></i> Print</button>
    <button className="btn text-danger border-danger"><i className="bi bi-trash"></i> Delete</button>
  </div>
);

const LoanInfo = () => {
  const [activeModal, setActiveModal] = useState(null);

  // Dummy Data for tables
  const itemData = [
    { id: 1, metal: 'GOLD', item: 'Ring', qty: 5, gsWt: 5, gsType: 'GM', ntWt: 2, ntType: 'GM', purity: 95, fnWt: 6, valuation: 2000, img: '-' },
    { id: 2, metal: '-', item: '-', qty: 3, gsWt: 5, gsType: '-', ntWt: 3, ntType: '-', purity: '-', fnWt: 6, valuation: 5000, img: '-' }
  ];

  const otherData = [
    { id: 1, principal: 4000, roi: 2, sInterest: 50, discount: 500, extraAmt: 6000, total: 500, startDate: '5/5/5', endDate: '5/5/5', timePeriod: 77, valuation: 2000, profitLoss: 2000, status: '2000', userImg: '-' },
    { id: 2, principal: 200, roi: 200, sInterest: 200, discount: 200, extraAmt: 200, total: 200, startDate: '200', endDate: '200', timePeriod: 200, valuation: 200, profitLoss: 200, status: '200', userImg: '-' }
  ];

  return (
    <div className="active-loan-panel">
      {/* Top Header */}
      <div className="top-header border-bottom-0 pb-0">
        <h5 className="mt-2">Active Loan Panel</h5>
        <div className="d-flex flex-column align-items-end">
          <div className="top-actions mb-2">
            <button className="btn"><i className="bi bi-arrow-left-circle me-1"></i> BACK</button>
            <button className="btn">RECEIPT</button>
            <button className="btn">NOTICE LOGS</button>
            <button className="btn">LOGS</button>
            <button className="btn">NEXT <i className="bi bi-arrow-right-circle ms-1"></i></button>
          </div>
          <div className="loan-header-tag">UNSECURED LOAN</div>
        </div>
      </div>

      <LoanInformation />

      <ItemTable data={itemData} />

      <OtherInfoTable data={otherData} />

      {/* Final Valuation Section */}
      <div className="panel-section">
        <div className="section-header">Final Valuation</div>
        <div className="table-responsive">
          <table className="table table-bordered text-center m-0">
            <thead>
              <tr>
                <th>Total Principal</th>
                <th>Total Interest</th>
                <th>Total Amount</th>
                <th>Valuation</th>
                <th>Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold">5000</td>
                <td className="fw-bold">6000</td>
                <td className="fw-bold">500</td>
                <td className="fw-bold">400</td>
                <td className="profit fw-bold">5200</td>
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
