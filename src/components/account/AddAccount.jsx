import React from 'react';

const AddAccount = () => {
  return (
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary">
        <h4 className="card-title text-center fw-bold pb-md-0">Add New Account</h4>

        <form noValidate>
          {/* ──────────────────────────────────────── */}
          {/*        SECTION 1: ACCOUNT & BANK DETAILS   */}
          {/* ──────────────────────────────────────── */}
          <h5 className="text-muted" >Account & Bank Details</h5>
          <div className="row g-3">
            {/* Most important fields first */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Account Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="accountName"
                placeholder="Enter account name / nickname"
                className="form-control border-dark"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Opening Balance Date <span className="text-danger">*</span></label>
              <input
                type="date"
                name="openingDate"
                className="form-control border-dark"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Account Balance <span className="text-danger">*</span></label>
              <input
                type="number"
                name="balance"
                placeholder="0.00"
                className="form-control border-dark text-end"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Balance Type <span className="text-danger">*</span></label>
              <select name="balanceType" className="form-select border-dark" required>
                <option value="" disabled>Select type</option>
                <option value="CR">CR - Credit</option>
                <option value="DR">DR – Debit</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Primary Account <span className="text-danger">*</span></label>
              <select name="isPrimary" className="form-select border-dark" required>
                <option value="" disabled>Select</option>
                <option value="yes">Yes – Main / Default Account</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Bank identifiers */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Bank Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Enter account number"
                className="form-control border-dark"
                pattern="[0-9]{9,18}"
                title="Usually 9–18 digits"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                placeholder="SBIN0001234"
                className="form-control border-dark text-uppercase"
                maxLength={11}
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                title="Format: XXXX0XXXXXX"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Branch Name</label>
              <input
                type="text"
                name="branchName"
                placeholder="Enter branch name"
                className="form-control border-dark"
              />
            </div>

            {/* Tax & compliance */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">PAN Number</label>
              <input
                type="text"
                name="pan"
                placeholder="ABCDE1234F"
                className="form-control border-dark text-uppercase"
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">BSR Code</label>
              <input
                type="text"
                name="bsrCode"
                placeholder="Enter BSR / IFS Code if applicable"
                className="form-control border-dark"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Bank Address</label>
              <textarea
                name="bankAddress"
                rows={1}
                placeholder="Full branch address (optional)"
                className="form-control border-dark"
              />
            </div>
               <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                className="form-control border-dark"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>
          </div>
          <h5 className=" text-muted mt-4">Additional Details</h5>
          <div className="row g-3 mb-5">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Country <span className="text-danger">*</span></label>
              <select name="country" className="form-select border-dark" required>
                <option value="" disabled>Select country</option>
                <option value="IN">India</option>
                {/* You can later add more options or use a library */}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">State <span className="text-danger">*</span></label>
              <select name="state" className="form-select border-dark" required>
                <option value="" disabled>Select state</option>
                {/* Ideally populated dynamically */}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                className="form-control border-dark"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">City / Village</label>
              <input
                type="text"
                name="city"
                placeholder="Enter city or village name"
                className="form-control border-dark"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <label className="form-label fw-medium">Account Description</label>
              <textarea
                name="description"
                rows={1}
                placeholder="Purpose, nickname..."
                className="form-control border-dark"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <label className="form-label fw-medium">Other Information</label>
              <textarea
                name="otherInfo"
                rows={1}
                placeholder="Extra notes, linked person, tags..."
                className="form-control border-dark"
              />
            </div>
          </div>

          {/* Submit area */}
          <div className="d-grid d-md-block text-center mt-5">
            <button type="submit" className="btn btn-primary btn-lg px-5">
              Save Account
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddAccount;