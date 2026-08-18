import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiBookOpen,
  FiCheck,
  FiExternalLink,
  FiInfo,
} from "react-icons/fi";

const fieldLabel = (provider, key) => {
  if (key === "verificationReason") return "Default verification reason";
  return provider.credentialFields.find((f) => f.key === key)?.label || key;
};

const KycCredentialGuideModal = ({ show, onHide, provider }) => {
  const steps = provider?.credentialSetupSteps || [];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (show) setActiveStep(0);
  }, [show, provider?.id]);

  const scrollToField = (key) => {
    onHide();
    window.setTimeout(() => {
      const id = key === "verificationReason" ? "kyc-verification-reason" : `kyc-field-${key}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }, 200);
  };

  if (!provider) return null;

  const current = steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="kyc-guide-modal">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          <FiBookOpen className="text-warning" />
          How to get {provider.label} credentials
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        <p className="text-muted small mb-3">
          Simple setup guide for {provider.label}. Complete each step in order — use <strong>Next</strong> when
          you are ready to move on.
        </p>

        <div className="kyc-stepper-layout">
          <div className="kyc-stepper-vertical" role="tablist" aria-label="Credential setup steps">
            {steps.map((step, index) => {
              const done = index < activeStep;
              const active = index === activeStep;
              const isLastStep = index === steps.length - 1;
              return (
                <button
                  key={step.title}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? "step" : undefined}
                  className={`kyc-stepper-v-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => setActiveStep(index)}
                  title={step.title}
                >
                  <div className="kyc-stepper-v-rail">
                    <span className="kyc-stepper-node">
                      {done ? <FiCheck size={14} /> : index + 1}
                    </span>
                    {!isLastStep && <span className="kyc-stepper-v-line" aria-hidden="true" />}
                  </div>
                  <span className="kyc-stepper-v-label">{step.title}</span>
                </button>
              );
            })}
          </div>

          {current && (
            <div className="kyc-step-panel">
              <div className="kyc-step-panel-header">
                <span className="kyc-step-panel-badge">
                  Step {activeStep + 1} of {steps.length}
                </span>
                <h6 className="fw-bold mb-0">{current.title}</h6>
              </div>

              <p className="kyc-step-description mb-3">{current.description}</p>

              {current.tips?.length > 0 && (
                <div className="kyc-step-tips mb-3">
                  <div className="kyc-step-tips-title">Helpful tips</div>
                  <ul className="kyc-step-tips-list">
                    {current.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="kyc-step-actions d-flex flex-wrap align-items-center gap-2">
                {current.link && (
                  <a
                    href={current.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  >
                    {current.link.label} <FiExternalLink size={13} />
                  </a>
                )}
                {current.mapsTo?.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="kyc-field-jump btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                    onClick={() => scrollToField(key)}
                  >
                    <FiArrowUp size={13} />
                    Go to {fieldLabel(provider, key)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="kyc-step-nav d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 mt-3 border-top">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            disabled={isFirst}
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          >
            <FiArrowLeft size={14} />
            Previous
          </button>

          <span className="small text-muted">
            {activeStep + 1} / {steps.length}
          </span>

          {isLast ? (
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            >
              Full documentation <FiExternalLink size={14} />
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-rate-save d-inline-flex align-items-center gap-1"
              onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              Next
              <FiArrowRight size={14} />
            </button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const KycCredentialInfoButton = ({ onClick, label }) => (
  <button
    type="button"
    className="kyc-info-btn btn btn-sm d-inline-flex align-items-center justify-content-center"
    onClick={onClick}
    title={`How to get ${label} credentials`}
    aria-label={`How to get ${label} credentials`}
  >
    <FiInfo size={16} />
  </button>
);

export default KycCredentialGuideModal;
