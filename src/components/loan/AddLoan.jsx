import React, { useState, useEffect } from 'react';

const AddLoan = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    principalAmount: '',
    loanStartDate: '',
    interestOption: '',
    loanPacketNo: '',
    loanLockerNo: '',
    processingAmount: '',
    chargeAmount: '',
    interestRate: '',
    payableAmount: '',
    loanOtherInfo: '',
    firstMonthInterest: false,
    crAccount: '',
    items: [],
    payments: [],
    paymentOtherInfo: '',
  });

  const [newItem, setNewItem] = useState({
    metalType: 'GOLD',
    itemName: '',
    qty: '',
    grossWeight: '',
    gsType: 'GM',
    netWeight: '',
    ntType: 'GM',
    purity: '100%',
    fineWeight: '',
    valuation: '',
    itemImage: null,
    imageName: '',
  });

  const [newPayment, setNewPayment] = useState({
    accountType: 'cash',
    bankAccountId: '',
    bankAmount: '',
    bankInfo: '',
  });



  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNewItemChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setNewItem((prev) => ({
        ...prev,
        itemImage: files[0],
        imageName: files[0].name,
      }));
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addItem = () => {
    if (
      !newItem.itemName.trim() ||
      !newItem.qty.trim() ||
      !newItem.grossWeight.trim() ||
      !newItem.netWeight.trim() ||
      !newItem.valuation.trim()
    ) {
      alert('Please fill required fields: Item Name, Qty, GS WT, NT WT, Valuation');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...newItem }],
    }));

    setNewItem({
      metalType: 'GOLD',
      itemName: '',
      qty: '',
      grossWeight: '',
      gsType: 'GM',
      netWeight: '',
      ntType: 'GM',
      purity: '100%',
      fineWeight: '',
      valuation: '',
      itemImage: null,
      imageName: '',
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const updateItemImage = (index, file) => {
    if (!file) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemImage: file,
      imageName: file.name,
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const deleteItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({ ...prev, [name]: value }));
  };



  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.principalAmount || !formData.loanStartDate || !formData.interestOption || !formData.interestRate) {
        alert('Please fill all required fields in Loan Information');
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.items.length === 0) {
        alert('Please add at least one item');
        return;
      }
    }
    if (currentStep === 3) {
      if (formData.payments.length === 0) {
        alert('Please add at least one payment');
        return;
      }
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Loan saved successfully! (check console)');
  };

  const loanInformation = (
    <>
      <h5 className="text-muted">Loan Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Principal Amount <span className="text-danger">*</span></label>
          <input type="text" name="principalAmount" placeholder="0.00" className="form-control border-dark" value={formData.principalAmount} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan Start Date <span className="text-danger">*</span></label>
          <input type="date" name="loanStartDate" className="form-control border-dark" value={formData.loanStartDate} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Interest Option <span className="text-danger">*</span></label>
          <select name="interestOption" className="form-select border-dark" value={formData.interestOption} onChange={handleChange} required>
            <option value="" disabled>Select option</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="bullet">Bullet (at end)</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan / Packet No</label>
          <input type="text" name="loanPacketNo" placeholder="Loan or packet number" className="form-control border-dark" value={formData.loanPacketNo} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan Locker No</label>
          <input type="text" name="loanLockerNo" placeholder="Locker or reference number" className="form-control border-dark" value={formData.loanLockerNo} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Processing Amount</label>
          <input type="text" name="processingAmount" placeholder="0.00" className="form-control border-dark" value={formData.processingAmount} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Charge Amount</label>
          <input type="text" name="chargeAmount" placeholder="0.00" className="form-control border-dark" value={formData.chargeAmount} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Rate of Interest <span className="text-danger">*</span></label>
          <input type="text" name="interestRate" placeholder="e.g. 12.5" className="form-control border-dark" value={formData.interestRate} onChange={handleChange} required />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Payable Amount</label>
          <input type="text" name="payableAmount" placeholder="0.00 (total incl. interest)" className="form-control border-dark" value={formData.payableAmount} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">CR Account</label>
          <input type="text" name="crAccount" placeholder="Credit account name / number" className="form-control border-dark" value={formData.crAccount} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3 d-none d-md-block"></div>
        <div className="col-12 col-md-6 col-lg-3 d-flex align-items-center">
          <div className="form-check">
            <input type="checkbox" name="firstMonthInterest" className="form-check-input" id="firstMonthInt" checked={formData.firstMonthInterest} onChange={handleChange} />
            <label className="form-check-label fw-medium" htmlFor="firstMonthInt">First Month Interest</label>
          </div>
        </div>
      </div>
    </>
  );

  const itemInformation = (
    <>
      <h5 className="text-muted mt-3">Item Information</h5>
      <div className="table-responsive table-sticky-first">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-center fw-bold">METAL TYPE</th>
              <th className="text-center fw-bold">ITEM NAME</th>
              <th className="text-center fw-bold">QTY</th>
              <th className="text-center fw-bold">GS WT</th>
              <th className="text-center fw-bold">GS TYPE</th>
              <th className="text-center fw-bold">NT WT</th>
              <th className="text-center fw-bold">NT TYPE</th>
              <th className="text-center fw-bold">TUNCH</th>
              <th className="text-center fw-bold">FN WT</th>
              <th className="text-center fw-bold">VALUATION</th>
              <th className="text-center fw-bold">IMAGE</th>
              <th className="text-center fw-bold">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <select
                    className="form-control form-control-sm border border-secondary no-arrow"
                    value={item.metalType}
                    onChange={(e) => updateItem(index, 'metalType', e.target.value)}
                  >
                    <option value="GOLD">GOLD</option>
                    <option value="SILVER">SILVER</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.qty}
                    onChange={(e) => updateItem(index, 'qty', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.grossWeight}
                    onChange={(e) => updateItem(index, 'grossWeight', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-control form-control-sm border border-secondary no-arrow"
                    value={item.gsType}
                    onChange={(e) => updateItem(index, 'gsType', e.target.value)}
                  >
                    <option value="GM">GM</option>
                    <option value="KG">KG</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.netWeight}
                    onChange={(e) => updateItem(index, 'netWeight', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-control form-control-sm border border-secondary no-arrow"
                    value={item.ntType}
                    onChange={(e) => updateItem(index, 'ntType', e.target.value)}
                  >
                    <option value="GM">GM</option>
                    <option value="KG">KG</option>
                  </select>
                </td>
                <td>
                  <select
                    className="form-control form-control-sm border border-secondary no-arrow"
                    value={item.purity}
                    onChange={(e) => updateItem(index, 'purity', e.target.value)}
                  >
                    <option value="100%">100%</option>
                    <option value="92%">92%</option>
                    <option value="80%">80%</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.fineWeight}
                    onChange={(e) => updateItem(index, 'fineWeight', e.target.value)}
                    placeholder="FN WT"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm border border-secondary"
                    value={item.valuation}
                    onChange={(e) => updateItem(index, 'valuation', e.target.value)}
                  />
                </td>
                <td className="text-center position-relative">
                  <input
                    type="file"
                    accept="image/*"
                    id={`itemImageInput-${index}`}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateItemImage(index, e.target.files[0]);
                      }
                    }}
                  />
                  {item.itemImage || item.imageName ? (
                    <>
                      <label htmlFor={`itemImageInput-${index}`} style={{ cursor: 'pointer' }}>
                        <img
                          src={item.itemImage ? URL.createObjectURL(item.itemImage) : '#'}
                          alt="Item preview"
                          style={{
                            maxWidth: '26px',
                            maxHeight: '26px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </label>
                    </>
                  ) : (
                    <label
                      htmlFor={`itemImageInput-${index}`}
                      className="btn btn-sm btn-outline-info p-1 mb-0"
                      style={{ cursor: 'pointer', minWidth: '60px' }}
                    >
                      <i className="bi bi-upload"></i>
                    </label>
                  )}
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger p-1"
                    onClick={() => deleteItem(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}

            {/* New item row */}
            <tr className="table-light">
              <td>
                <select name="metalType" className="form-control form-control-sm border border-secondary no-arrow" value={newItem.metalType} onChange={handleNewItemChange}>
                  <option value="GOLD">GOLD</option>
                  <option value="SILVER">SILVER</option>
                </select>
              </td>
              <td>
                <input type="text" name="itemName" className="form-control form-control-sm border border-secondary" placeholder="ITEM NAME" value={newItem.itemName} onChange={handleNewItemChange} />
              </td>
              <td>
                <input type="text" name="qty" className="form-control form-control-sm border border-secondary" placeholder="QTY" value={newItem.qty} onChange={handleNewItemChange} />
              </td>
              <td>
                <input type="text" name="grossWeight" className="form-control form-control-sm border border-secondary" placeholder="GS WT" value={newItem.grossWeight} onChange={handleNewItemChange} />
              </td>
              <td>
                <select name="gsType" className="form-control form-control-sm border border-secondary no-arrow" value={newItem.gsType} onChange={handleNewItemChange}>
                  <option value="GM">GM</option>
                  <option value="KG">KG</option>
                </select>
              </td>
              <td>
                <input type="text" name="netWeight" className="form-control form-control-sm border border-secondary" placeholder="NT WT" value={newItem.netWeight} onChange={handleNewItemChange} />
              </td>
              <td>
                <select name="ntType" className="form-control form-control-sm border border-secondary no-arrow" value={newItem.ntType} onChange={handleNewItemChange}>
                  <option value="GM">GM</option>
                  <option value="KG">KG</option>
                </select>
              </td>
              <td>
                <select name="purity" className="form-control form-control-sm border border-secondary no-arrow" value={newItem.purity} onChange={handleNewItemChange}>
                  <option value="100%">100%</option>
                  <option value="92%">92%</option>
                  <option value="80%">80%</option>
                </select>
              </td>
              <td>
                <input type="text" name="fineWeight" className="form-control form-control-sm border border-secondary" placeholder="FN WT" value={newItem.fineWeight} onChange={handleNewItemChange} />
              </td>
              <td>
                <input type="text" name="valuation" className="form-control form-control-sm border border-secondary" placeholder="VALUATION" value={newItem.valuation} onChange={handleNewItemChange} />
              </td>
              <td className="text-center">
                <input
                  id="newItemFileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleNewItemChange}
                />
                {newItem.itemImage ? (
                  <label htmlFor="newItemFileInput" style={{ cursor: 'pointer' }}>
                    <img
                      src={URL.createObjectURL(newItem.itemImage)}
                      alt="Preview"
                      style={{ maxWidth: '26px', maxHeight: '26px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </label>
                ) : (
                  <label htmlFor="newItemFileInput" className="btn btn-sm btn-outline-info p-1 mb-0" style={{ cursor: 'pointer', minWidth: '60px' }}>
                    <i className="bi bi-upload"></i>
                  </label>
                )}
                {newItem.imageName && (
                  <div className="small text-muted mt-1 text-truncate" title={newItem.imageName}>
                   
                  </div>
                )}
              </td>
              <td className="text-center">
                <button type="button" className="btn btn-sm btn-outline-success p-1" onClick={addItem}>
                  <i className="bi bi-plus-square"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );

  const paymentDetails = (
    <>
      <h5 className="text-muted">Payment Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Select Cash Account <span className="text-danger">*</span></label>
          <select name="bankAccountId" className="form-select border-dark" value={newPayment.bankAccountId} onChange={handlePaymentChange} required>
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Account</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input type="text" name="bankAmount" placeholder="0.00" className="form-control border-dark" value={newPayment.bankAmount} onChange={handlePaymentChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input type="text" name="bankInfo" placeholder="Information" className="form-control border-dark" value={newPayment.bankInfo} onChange={handlePaymentChange} />
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Select Bank Account <span className="text-danger">*</span></label>
          <select name="bankAccountId" className="form-select border-dark" value={newPayment.bankAccountId} onChange={handlePaymentChange} required>
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Account</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input type="text" name="bankAmount" placeholder="0.00" className="form-control border-dark" value={newPayment.bankAmount} onChange={handlePaymentChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input type="text" name="bankInfo" placeholder="Information" className="form-control border-dark" value={newPayment.bankInfo} onChange={handlePaymentChange} />
        </div>
      </div>
        <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Select Cash Account <span className="text-danger">*</span></label>
          <select name="bankAccountId" className="form-select border-dark" value={newPayment.bankAccountId} onChange={handlePaymentChange} required>
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Account</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input type="text" name="bankAmount" placeholder="0.00" className="form-control border-dark" value={newPayment.bankAmount} onChange={handlePaymentChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input type="text" name="bankInfo" placeholder="Information" className="form-control border-dark" value={newPayment.bankInfo} onChange={handlePaymentChange} />
        </div>
      </div>
        <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Select Cash Account <span className="text-danger">*</span></label>
          <select name="bankAccountId" className="form-select border-dark" value={newPayment.bankAccountId} onChange={handlePaymentChange} required>
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Account</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input type="text" name="bankAmount" placeholder="0.00" className="form-control border-dark" value={newPayment.bankAmount} onChange={handlePaymentChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input type="text" name="bankInfo" placeholder="Information" className="form-control border-dark" value={newPayment.bankInfo} onChange={handlePaymentChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-6 mt-3">
          <label className="form-label fw-medium">Payment Other Info / Remarks</label>
          <textarea name="paymentOtherInfo" rows={1} placeholder="Combined mode notes, reference numbers, special instructions, cheque no if any..." className="form-control border-dark" value={formData.paymentOtherInfo} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label fw-medium">Other Information</label>
          <textarea name="loanOtherInfo" rows={1} placeholder="Extra notes, remarks, conditions..." className="form-control border-dark" value={formData.loanOtherInfo} onChange={handleChange} />
        </div>
      </div>
    </>
  );

  const progressBar = (
    <div className="progress mt-3 mb-4" style={{ height: '8px' }}>
      <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(currentStep / totalSteps) * 100}%` }} aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps}></div>
    </div>
  );

  const navigationButtons = (
    <div className="d-flex justify-content-between mt-4">
      {currentStep > 1 && (
        <button type="button" className="btn btn-secondary" onClick={handleBack}>Back</button>
      )}
      {currentStep < totalSteps ? (
        <button type="button" className="btn btn-primary ms-auto" onClick={handleNext}>Next</button>
      ) : (
        <button type="submit" className="btn btn-primary btn-lg px-5 ms-auto">Save Loan</button>
      )}
    </div>
  );

  return (
    <div className="card p-0 border-0 border-md-1 border-secondary">
      <h4 className="card-title text-center fw-bold pb-md-0">Add New Loan</h4>

      <form noValidate onSubmit={handleSubmit}>
        {isMobile ? (
          <>
            {progressBar}
            {currentStep === 1 && loanInformation}
            {currentStep === 2 && itemInformation}
            {currentStep === 3 && paymentDetails}
            {navigationButtons}
          </>
        ) : (
          <>
            {loanInformation}
            {itemInformation}
            {paymentDetails}
            <div className="d-grid d-md-block text-center mt-5">
              <button type="submit" className="btn btn-primary btn-lg px-5">Save Loan</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AddLoan;