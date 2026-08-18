import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiPlay,
  FiRefreshCw,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  buildTestRequestPreview,
  credentialsReady,
  mockTestApiResponse,
} from "../../utils/kycIntegrationConfig";

const defaultFormForApi = (api) => {
  const values = {};
  api?.fields?.forEach((field) => {
    values[field.key] = "";
  });
  return values;
};

const KycTestApiModal = ({ show, onHide, provider, providerId, providerSettings, baseUrl }) => {
  const testApis = provider?.testApis || {};
  const testTypeIds = Object.keys(testApis);

  const [activeTestType, setActiveTestType] = useState(testTypeIds[0] || "pan");
  const [formValues, setFormValues] = useState({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [requestPreview, setRequestPreview] = useState(null);

  const activeApi = testApis[activeTestType];

  useEffect(() => {
    if (!show) {
      setTesting(false);
      setResult(null);
      setRequestPreview(null);
      return;
    }
    if (testTypeIds.length && !testTypeIds.includes(activeTestType)) {
      setActiveTestType(testTypeIds[0]);
    }
  }, [show, testTypeIds, activeTestType]);

  useEffect(() => {
    setFormValues(defaultFormForApi(activeApi));
    setResult(null);
    setRequestPreview(null);
  }, [providerId, activeTestType, activeApi, show]);

  const requestSummary = useMemo(
    () => buildTestRequestPreview(providerId, activeTestType, baseUrl, providerSettings, formValues),
    [providerId, activeTestType, baseUrl, providerSettings, formValues]
  );

  const setField = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!credentialsReady(providerId, providerSettings)) {
      toast.error("Fill in API credentials before testing");
      return false;
    }
    for (const field of activeApi?.fields || []) {
      if (field.required && !String(formValues[field.key] || "").trim()) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }
    if (providerId === "sandbox") {
      const reason = providerSettings.verificationReason?.trim() || "";
      if (reason.length < 20) {
        toast.error("Sandbox verification reason must be at least 20 characters");
        return false;
      }
    }
    return true;
  };

  const handleRunTest = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setTesting(true);
    setResult(null);
    setRequestPreview(requestSummary);

    const mock = mockTestApiResponse(providerId, activeTestType, formValues);
    await new Promise((r) => setTimeout(r, mock.durationMs));

    setResult(mock);
    setTesting(false);
    toast.success("Test completed (mock response — backend pending)");
  };

  const handleReset = () => {
    setFormValues(defaultFormForApi(activeApi));
    setResult(null);
    setRequestPreview(null);
  };

  const testTypeIcon = (typeId) => {
    if (typeId === "aadhaar") return <FiSmartphone size={16} />;
    return <FiCreditCard size={16} />;
  };

  if (!provider || !testTypeIds.length) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable className="kyc-test-modal">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          <FiZap className="text-warning" />
          Test {provider.label} API
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3">
          <p className="text-muted small mb-0">
            Send a sample request with test data. Live calls will run via backend later — this shows the
            request shape and a mock response.
          </p>
          {!credentialsReady(providerId, providerSettings) && (
            <span className="kyc-test-badge warn d-inline-flex align-items-center gap-1">
              <FiAlertCircle size={14} />
              Credentials required
            </span>
          )}
        </div>

        <div className="kyc-test-type-tabs mb-3">
          {testTypeIds.map((typeId) => {
            const api = testApis[typeId];
            const selected = activeTestType === typeId;
            return (
              <button
                key={typeId}
                type="button"
                className={`kyc-test-type-tab ${selected ? "selected" : ""}`}
                onClick={() => setActiveTestType(typeId)}
              >
                {testTypeIcon(typeId)}
                {api.label}
              </button>
            );
          })}
        </div>

        {activeApi && (
          <form onSubmit={handleRunTest}>
            <div className="kyc-test-endpoint mb-3">
              <span className="kyc-test-method">{activeApi.method}</span>
              <code className="kyc-test-url">
                {baseUrl.replace(/\/$/, "")}
                {activeApi.path}
              </code>
            </div>

            <div className="row g-3 mb-3">
              {activeApi.fields.map((field) => (
                <div className="col-12 col-md-6" key={field.key}>
                  <label className="form-label fw-medium" htmlFor={`kyc-test-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-danger"> *</span>}
                  </label>
                  <input
                    id={`kyc-test-${field.key}`}
                    type="text"
                    className="form-control border-dark"
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ""}
                    onChange={(ev) => setField(field.key, ev.target.value)}
                    autoComplete="off"
                  />
                </div>
              ))}
              {providerId === "sandbox" && (
                <div className="col-12">
                  <div className="kyc-test-hint small text-muted">
                    Consent <code>Y</code> and your saved verification reason will be included automatically.
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                type="submit"
                className="btn btn-rate-save d-inline-flex align-items-center gap-2"
                disabled={testing}
              >
                {testing ? (
                  <>
                    <FiRefreshCw className="kyc-spin" size={16} />
                    Running test…
                  </>
                ) : (
                  <>
                    <FiPlay size={16} />
                    Run test API
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={testing}>
                Clear
              </button>
            </div>
          </form>
        )}

        {(requestPreview || result) && (
          <div className="kyc-test-results">
            {requestPreview && (
              <div className="kyc-test-result-block mb-3">
                <h6 className="fw-semibold mb-2">Request preview</h6>
                <pre className="kyc-test-json">{JSON.stringify(requestPreview, null, 2)}</pre>
              </div>
            )}

            {result && (
              <div className={`kyc-test-result-block ${result.ok ? "success" : "error"}`}>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  {result.ok ? (
                    <FiCheckCircle className="text-success" size={18} />
                  ) : (
                    <FiAlertCircle className="text-danger" size={18} />
                  )}
                  <h6 className="fw-semibold mb-0">
                    {result.ok ? "Mock success" : "Mock failure"} — HTTP {result.status}
                  </h6>
                  <span className="kyc-test-badge muted d-inline-flex align-items-center gap-1 ms-auto">
                    <FiClock size={13} />
                    {result.durationMs} ms
                  </span>
                </div>
                <pre className="kyc-test-json">{JSON.stringify(result.body, null, 2)}</pre>
                <div className="kyc-test-hint small text-muted mt-2">
                  This is a simulated response. Real provider calls will go through your backend to keep
                  secrets secure.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export const KycTestApiButton = ({ onClick }) => (
  <button
    type="button"
    className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
    onClick={onClick}
    title="Test KYC API"
  >
    <FiZap size={14} />
    Test API
  </button>
);

export default KycTestApiModal;
