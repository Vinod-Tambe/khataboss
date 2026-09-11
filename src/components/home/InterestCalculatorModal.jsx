import React, { useMemo, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { calculateInterest } from '../../utils/loanInterest';

const formatRupee = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const InterestCalculatorModal = ({ show, onClose }) => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [roiType, setRoiType] = useState('monthly');
  const [interestMethod, setInterestMethod] = useState('simple');

  const isAnnualRate = roiType === 'annually';
  const durationLabel = isAnnualRate ? 'Duration (Years)' : 'Duration (Months)';
  const durationPlaceholder = isAnnualRate ? 'Enter years' : 'Enter months';

  const result = useMemo(() => {
    const principalValue = parseFloat(principal) || 0;
    const rateValue = parseFloat(rate) || 0;
    const durationValue = parseFloat(duration) || 0;
    const months = isAnnualRate
      ? Math.round(durationValue * 12)
      : Math.round(durationValue);

    if (!principalValue || !rateValue || !durationValue || !months) {
      return null;
    }

    const interestAmount = calculateInterest(
      principalValue,
      rateValue,
      months,
      interestMethod,
      'monthly',
      roiType
    );

    const totalPayable = parseFloat((principalValue + interestAmount).toFixed(2));

    return {
      interestAmount,
      totalPayable,
      months,
    };
  }, [principal, rate, duration, roiType, interestMethod, isAnnualRate]);

  const handleClose = () => {
    onClose?.();
  };

  const handleReset = () => {
    setPrincipal('');
    setRate('');
    setDuration('');
    setRoiType('monthly');
    setInterestMethod('simple');
  };

  const handleRoiTypeChange = (e) => {
    const nextType = e.target.value;
    const currentDuration = parseFloat(duration);

    if (currentDuration > 0) {
      if (nextType === 'annually' && roiType === 'monthly') {
        setDuration(String(parseFloat((currentDuration / 12).toFixed(2))));
      } else if (nextType === 'monthly' && roiType === 'annually') {
        setDuration(String(Math.round(currentDuration * 12)));
      }
    }

    setRoiType(nextType);
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="interest-calculator-modal">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="h6 fw-bold mb-0 text-brown d-flex align-items-center gap-2">
          <i className="bi bi-calculator" aria-hidden="true" />
          Interest Calculator
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold mb-1">Principal Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              placeholder="Enter principal"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold mb-1">Interest Rate (%)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              placeholder="Enter rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold mb-1">Rate Type</label>
            <select
              className="form-select"
              value={roiType}
              onChange={handleRoiTypeChange}
            >
              <option value="monthly">Per Month</option>
              <option value="annually">Per Year</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-semibold mb-1">{durationLabel}</label>
            <input
              type="number"
              className="form-control"
              min={isAnnualRate ? '0.1' : '1'}
              step={isAnnualRate ? '0.1' : '1'}
              placeholder={durationPlaceholder}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">Interest Method</label>
            <select
              className="form-select"
              value={interestMethod}
              onChange={(e) => setInterestMethod(e.target.value)}
            >
              <option value="simple">Simple Interest</option>
              <option value="compound">Compound Interest (Monthly)</option>
            </select>
          </div>
        </div>

        <div className="interest-calculator-modal__result mt-4">
          <div className="interest-calculator-modal__result-row">
            <span className="text-muted">Interest Amount</span>
            <strong className="text-warning">
              {result ? formatRupee(result.interestAmount) : '—'}
            </strong>
          </div>
          <div className="interest-calculator-modal__result-row interest-calculator-modal__result-row--total">
            <span className="fw-semibold">Total Payable Amount</span>
            <strong className="text-success fs-5">
              {result ? formatRupee(result.totalPayable) : '—'}
            </strong>
          </div>
        </div>

        <p className="form-text mb-0 mt-3">
          {isAnnualRate
            ? 'Per-year rate: enter duration in years (e.g. 1 year = 12 months for interest).'
            : 'Per-month rate: enter duration in months.'}
          {result?.months ? ` Tenure used: ${result.months} month(s).` : ''}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterestCalculatorModal;
