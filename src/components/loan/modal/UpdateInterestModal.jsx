import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateGirvi } from '../../../api/girviApi';
import {
  buildGirviUpdatePayload,
  getInterestUpdateBlockReason,
  validateInterestForm,
} from '../../../utils/loanUpdateRules';
import {
  calculateFirstMonthInterest,
  normalizeRoiType,
} from '../../../utils/loanInterest';
import '../../../css/Modal.css';

const UpdateInterestModal = ({
  isOpen,
  onClose,
  loanDetails,
  canEdit = true,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    girv_roi: '',
    girv_interest_method: 'simple',
    girv_compound_freq: 'monthly',
    girv_roi_type: 'monthly',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blockReason = useMemo(
    () => getInterestUpdateBlockReason(loanDetails, canEdit),
    [loanDetails, canEdit]
  );

  const firstMonthPreview = useMemo(
    () =>
      calculateFirstMonthInterest(
        loanDetails?.girv_prin_amt,
        formData.girv_roi,
        formData.girv_interest_method,
        formData.girv_compound_freq,
        formData.girv_roi_type
      ),
    [
      loanDetails?.girv_prin_amt,
      formData.girv_roi,
      formData.girv_interest_method,
      formData.girv_compound_freq,
      formData.girv_roi_type,
    ]
  );

  useEffect(() => {
    if (!isOpen || !loanDetails) return;

    setFormData({
      girv_roi: loanDetails.girv_roi || '',
      girv_interest_method: loanDetails.girv_interest_method || 'simple',
      girv_compound_freq: loanDetails.girv_compound_freq || 'monthly',
      girv_roi_type: normalizeRoiType(loanDetails.girv_roi_type || 'monthly'),
    });
  }, [isOpen, loanDetails]);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'girv_interest_method' && value === 'simple') {
        next.girv_compound_freq = 'monthly';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || blockReason || !loanDetails?.girv_uuid) return;

    const validationError = validateInterestForm(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = buildGirviUpdatePayload(loanDetails, {
      girv_roi: formData.girv_roi,
      girv_interest_method: formData.girv_interest_method,
      girv_compound_freq:
        formData.girv_interest_method === 'compound'
          ? formData.girv_compound_freq
          : null,
      girv_roi_type: normalizeRoiType(formData.girv_roi_type),
      girv_first_int: loanDetails.girv_first_int === 'Y',
    });

    setIsSubmitting(true);
    try {
      await updateGirvi(loanDetails.girv_uuid, {
        ...payload,
        girv_first_int: payload.girv_first_int ? 'Y' : 'N',
      });
      toast.success('Interest settings updated successfully.');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.error || err?.message || 'Failed to update interest settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <form
        className="custom-modal-container"
        style={{ maxWidth: '640px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="modal-title fw-bold mb-0">Update Interest Settings</h5>
          <button type="button" className="custom-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="custom-modal-body">
          {blockReason ? (
            <div className="alert alert-warning mb-0">
              {blockReason}
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Interest method and option can only be changed on active loans with no deposits,
                releases, or additional principal entries.
              </p>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Rate of Interest <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="girv_roi"
                    className="form-control border-dark"
                    value={formData.girv_roi}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setFormData((prev) => ({ ...prev, girv_roi: val }));
                    }}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Interest Option <span className="text-danger">*</span>
                  </label>
                  <select
                    name="girv_roi_type"
                    className="form-select border-dark"
                    value={formData.girv_roi_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annual</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Interest Method <span className="text-danger">*</span>
                  </label>
                  <select
                    name="girv_interest_method"
                    className="form-select border-dark"
                    value={formData.girv_interest_method}
                    onChange={handleChange}
                    required
                  >
                    <option value="simple">Simple</option>
                    <option value="compound">Compound</option>
                  </select>
                </div>

                {formData.girv_interest_method === 'compound' && (
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      Compound Frequency <span className="text-danger">*</span>
                    </label>
                    <select
                      name="girv_compound_freq"
                      className="form-select border-dark"
                      value={formData.girv_compound_freq}
                      onChange={handleChange}
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>

              {loanDetails?.girv_first_int === 'Y' && firstMonthPreview > 0 && (
                <div className="alert alert-info mt-3 mb-0 py-2 small">
                  First month interest will be recalculated to{' '}
                  <strong>
                    ₹{firstMonthPreview.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>{' '}
                  after saving.
                </div>
              )}
            </>
          )}
        </div>

        <div className="custom-modal-footer border-top border-dark p-3 d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {!blockReason && (
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateInterestModal;
