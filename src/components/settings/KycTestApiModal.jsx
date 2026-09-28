import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FiAlertCircle,
  FiBookOpen,
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
  getDefaultTestFormValues,
  getExpectedTestResponse,
  mockTestApiResponse,
} from "../../utils/kycIntegrationConfig";

const KycTestApiModal = ({ show, onHide, provider, providerId, providerSettings, baseUrl }) => {
  const testApis = provider?.testApis || {};
  const testTypeIds = Object.keys(testApis);

  const [activeTestType, setActiveTestType] = useState(testTypeIds[0] || "pan");
  const [formValues, setFormValues] = useState({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const activeApi = testApis[activeTestType];

  useEffect(() => {
    if (!show) {
      setTesting(false);
      setResult(null);
      return;
    }
    if (testTypeIds.length && !testTypeIds.includes(activeTestType)) {
      setActiveTestType(testTypeIds[0]);
    }
  }, [show, testTypeIds, activeTestType]);

  useEffect(() => {
    if (!show) return;
    setFormValues(getDefaultTestFormValues(providerId, activeTestType));
    setResult(null);
  }, [providerId, activeTestType, show]);

  const requestPreview = useMemo(
    () => buildTestRequestPreview(providerId, activeTestType, baseUrl, providerSettings, formValues),
    [providerId, activeTestType, baseUrl, providerSettings, formValues]
  );

  const expectedResponse = useMemo(
    () => getExpectedTestResponse(providerId, activeTestType),
    [providerId, activeTestType]
  );

  const setField = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const fillSampleData = () => {
    setFormValues(getDefaultTestFormValues(providerId, activeTestType));
    setResult(null);
    toast.success("Sample test values applied");
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

    const mock = mockTestApiResponse(providerId, activeTestType, formValues);
    await new Promise((r) => setTimeout(r, mock.durationMs));

    setResult(mock);
    setTesting(false);
    toast.success("Test completed (simulated — wire backend for live calls)");
  };

  const handleReset = () => {
    setFormValues(getDefaultTestFormValues(providerId, activeTestType));
    setResult(null);
  };

  const testTypeIcon = (typeId) => {
    if (typeId === "aadhaar") return <FiSmartphone size={16} />;
    return <FiCreditCard size={16} />;
  };

  if (!provider || !testTypeIds.length) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable className="kyc-test-modal">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          <FiZap className="text-warning" />
          Test {provider.label} API
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3">
          <p className="text-muted small mb-0">
            Use provider sample values, review the exact JSON request, and compare with the documented test
            response. Live calls will run through your backend once integrated.
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

            {activeApi.docsNote && (
              <div className="kyc-test-docs-note small d-flex gap-2 mb-3">
                <FiBookOpen className="flex-shrink-0 mt-1 text-warning" size={16} />
                <span>{activeApi.docsNote}</span>
              </div>
            )}

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
                    Request body includes <code>@entity</code>, <code>consent: &quot;Y&quot;</code>, and your saved
                    verification reason automatically.
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
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={fillSampleData}
                disabled={testing}
              >
                Use sample test data
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset} disabled={testing}>
                Clear
              </button>
            </div>
          </form>
        )}

        <div className="kyc-test-results">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="kyc-test-result-block h-100">
                <h6 className="fw-semibold mb-2">Request JSON</h6>
                <p className="kyc-test-hint small text-muted mb-2">
                  Headers + body as sent to {provider.label} (secrets masked).
                </p>
                <pre className="kyc-test-json">
                  {requestPreview ? JSON.stringify(requestPreview, null, 2) : "{}"}
                </pre>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="kyc-test-result-block expected h-100">
                <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                  <FiBookOpen size={16} className="text-warning" />
                  Expected test response JSON
                </h6>
                <p className="kyc-test-hint small text-muted mb-2">
                  Documented success sample from {provider.label} test environment.
                </p>
                <pre className="kyc-test-json">
                  {expectedResponse ? JSON.stringify(expectedResponse, null, 2) : "—"}
                </pre>
              </div>
            </div>
          </div>

          {result && (
            <div className={`kyc-test-result-block mt-3 ${result.ok ? "success" : "error"}`}>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {result.ok ? (
                  <FiCheckCircle className="text-success" size={18} />
                ) : (
                  <FiAlertCircle className="text-danger" size={18} />
                )}
                <h6 className="fw-semibold mb-0">
                  Simulated response — HTTP {result.status}
                </h6>
                <span className="kyc-test-badge muted d-inline-flex align-items-center gap-1 ms-auto">
                  <FiClock size={13} />
                  {result.durationMs} ms
                </span>
              </div>
              <pre className="kyc-test-json">{JSON.stringify(result.body, null, 2)}</pre>
              <div className="kyc-test-hint small text-muted mt-2">
                Matches the expected test shape above. Real provider calls will go through your backend to keep
                secrets secure.
              </div>
            </div>
          )}
        </div>
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
