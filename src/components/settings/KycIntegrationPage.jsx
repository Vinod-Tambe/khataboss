import React, { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiHash,
  FiKey,
  FiLock,
  FiSave,
  FiShield,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  KYC_PROVIDERS,
  defaultKycSettings,
  loadKycSettings,
  saveKycSettings,
} from "../../utils/kycIntegrationConfig";
import KycTestApiModal, { KycTestApiButton } from "./KycTestApiModal";
import KycCredentialGuideModal, { KycCredentialInfoButton } from "./KycCredentialGuideModal";
import "../../css/Rate.css";
import "../../css/KycIntegration.css";

const fieldIcon = (icon) => {
  switch (icon) {
    case "key":
      return <FiKey size={14} className="me-1 opacity-75" />;
    case "lock":
      return <FiLock size={14} className="me-1 opacity-75" />;
    case "hash":
      return <FiHash size={14} className="me-1 opacity-75" />;
    case "user":
      return <FiUser size={14} className="me-1 opacity-75" />;
    default:
      return null;
  }
};

const KycIntegrationPage = () => {
  const [settings, setSettings] = useState(defaultKycSettings);
  const [saving, setSaving] = useState(false);
  const [showCredentialGuide, setShowCredentialGuide] = useState(false);
  const [showTestApi, setShowTestApi] = useState(false);

  useEffect(() => {
    setSettings(loadKycSettings());
  }, []);

  const provider = KYC_PROVIDERS[settings.activeProvider] || KYC_PROVIDERS.sandbox;
  const providerSettings = settings[settings.activeProvider] || {};

  const resolveBaseUrl = (providerId, environment) => {
    if (providerId === "sandbox") {
      return environment === "live"
        ? KYC_PROVIDERS.sandbox.liveBaseUrl
        : KYC_PROVIDERS.sandbox.testBaseUrl;
    }
    if (environment === "production") {
      return KYC_PROVIDERS.eko.liveBaseUrl;
    }
    return KYC_PROVIDERS.eko.testBaseUrl;
  };

  const baseUrl = useMemo(
    () => resolveBaseUrl(settings.activeProvider, providerSettings.environment),
    [settings.activeProvider, providerSettings.environment]
  );

  const setProviderField = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [prev.activeProvider]: {
        ...prev[prev.activeProvider],
        [key]: value,
        ...(key === "environment"
          ? { baseUrl: resolveBaseUrl(prev.activeProvider, value) }
          : {}),
      },
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        [settings.activeProvider]: {
          ...settings[settings.activeProvider],
          baseUrl,
        },
      };
      saveKycSettings(payload);
      toast.success("KYC integration settings saved locally");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const envOptions =
    settings.activeProvider === "sandbox"
      ? [
          { value: "test", label: "Test (Sandbox)" },
          { value: "live", label: "Production (Live)" },
        ]
      : [
          { value: "sandbox", label: "Sandbox / UAT" },
          { value: "production", label: "Production" },
        ];

  return (
    <div className="kyc-page">
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary kyc-form-card mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-2">
            <span className="kyc-form-icon d-inline-flex align-items-center justify-content-center">
              <FiShield size={20} />
            </span>
            <div>
              <h4 className="card-title fw-bold mb-0">KYC Integration</h4>
              <p className="text-muted small mb-0 mt-1">
                Configure third-party PAN &amp; Aadhaar verification. Backend wiring will be added
                later — settings are stored in this browser for now.
              </p>
            </div>
          </div>
          <span className={`kyc-status-pill ${settings.kycEnabled ? "on" : "off"}`}>
            {settings.kycEnabled ? "Verification ON" : "Verification OFF"}
          </span>
        </div>
      </div>

      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary kyc-form-card mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <FiShield className="text-warning" size={18} />
          Start KYC verification
        </h5>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <label
            className={`kyc-radio-option d-flex align-items-center gap-2 mb-0 ${
              settings.kycEnabled ? "active-yes" : ""
            }`}
          >
            <input
              type="radio"
              name="kycEnabled"
              className="form-check-input mt-0"
              checked={settings.kycEnabled === true}
              onChange={() => {
                setSettings((prev) => ({ ...prev, kycEnabled: true }));
              }}
            />
            <FiCheckCircle className="text-success flex-shrink-0" size={18} />
            <span className="fw-medium">Yes — verify on customer add</span>
          </label>
          <label
            className={`kyc-radio-option d-flex align-items-center gap-2 mb-0 ${
              !settings.kycEnabled ? "active-no" : ""
            }`}
          >
            <input
              type="radio"
              name="kycEnabled"
              className="form-check-input mt-0"
              checked={settings.kycEnabled === false}
              onChange={() => {
                setSettings((prev) => ({ ...prev, kycEnabled: false }));
                setShowCredentialGuide(false);
                setShowTestApi(false);
              }}
            />
            <FiXCircle className="text-secondary flex-shrink-0" size={18} />
            <span className="fw-medium">No — skip API verification</span>
          </label>
        </div>

        {!settings.kycEnabled && (
          <div className="kyc-form-footer d-flex flex-wrap gap-2 pt-3 mt-3">
            <button
              type="button"
              className="btn btn-rate-save d-inline-flex align-items-center gap-2"
              disabled={saving}
              onClick={handleSave}
            >
              <FiSave size={16} />
              {saving ? "Saving…" : "Save settings"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSettings(defaultKycSettings())}
            >
              Reset to defaults
            </button>
          </div>
        )}
      </div>

      {settings.kycEnabled && (
        <>
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary kyc-form-card mb-4">
        <h5 className="fw-bold mb-3">KYC provider</h5>
        <div className="kyc-provider-grid">
          {Object.values(KYC_PROVIDERS).map((item) => {
            const selected = settings.activeProvider === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`kyc-provider-card text-start w-100 ${selected ? "selected" : ""}`}
                onClick={() => setSettings((prev) => ({ ...prev, activeProvider: item.id }))}
              >
                <div className="d-flex align-items-start gap-3">
                  <span className={`kyc-provider-logo ${item.id}`}>
                    {item.label.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <strong>{item.label}</strong>
                      {selected && <FiCheckCircle className="text-success flex-shrink-0" size={18} />}
                    </div>
                    <div className="small text-muted mt-1">{item.tagline}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary kyc-form-card mb-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
            <h5 className="mb-0 fw-bold">{provider.label} API credentials</h5>
            <div className="kyc-credentials-actions d-flex flex-wrap align-items-center gap-2">
              <KycTestApiButton onClick={() => setShowTestApi(true)} />
              <KycCredentialInfoButton
                label={provider.label}
                onClick={() => setShowCredentialGuide(true)}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-medium" htmlFor="kyc-environment">
                Environment
              </label>
              <select
                id="kyc-environment"
                className="form-select border-dark"
                value={providerSettings.environment || envOptions[0].value}
                onChange={(e) => setProviderField("environment", e.target.value)}
              >
                {envOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-8">
              <label className="form-label fw-medium" htmlFor="kyc-base-url">
                Base URL
              </label>
              <input
                id="kyc-base-url"
                type="text"
                className="form-control border-dark bg-light"
                value={baseUrl}
                readOnly
              />
              <div className="form-text">Auto-set from environment selection</div>
            </div>

            {provider.credentialFields.map((field) => (
              <div className="col-12 col-md-6" key={field.key}>
                <label className="form-label fw-medium" htmlFor={`kyc-field-${field.key}`}>
                  {fieldIcon(field.icon)}
                  {field.label}
                  {field.required && <span className="text-danger"> *</span>}
                </label>
                <input
                  id={`kyc-field-${field.key}`}
                  type={field.type}
                  className="form-control border-dark"
                  placeholder={field.placeholder}
                  value={providerSettings[field.key] || ""}
                  onChange={(e) => setProviderField(field.key, e.target.value)}
                  autoComplete="off"
                />
              </div>
            ))}

            {settings.activeProvider === "sandbox" && (
              <div className="col-12">
                <label className="form-label fw-medium" htmlFor="kyc-verification-reason">
                  Default verification reason
                </label>
                <textarea
                  id="kyc-verification-reason"
                  className="form-control border-dark"
                  rows={2}
                  placeholder="Minimum 20 characters — shown to provider on each KYC request"
                  value={providerSettings.verificationReason || ""}
                  onChange={(e) => setProviderField("verificationReason", e.target.value)}
                />
                <div className="form-text">Required by Sandbox PAN/Aadhaar APIs (consent + reason).</div>
              </div>
            )}
          </div>

          <div className="kyc-form-footer d-flex flex-wrap gap-2 pt-3 mt-3">
            <button
              type="submit"
              className="btn btn-rate-save d-inline-flex align-items-center gap-2"
              disabled={saving}
            >
              <FiSave size={16} />
              {saving ? "Saving…" : "Save settings"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSettings(defaultKycSettings())}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </form>

      <KycCredentialGuideModal
        show={showCredentialGuide}
        onHide={() => setShowCredentialGuide(false)}
        provider={provider}
      />

      <KycTestApiModal
        show={showTestApi}
        onHide={() => setShowTestApi(false)}
        provider={provider}
        providerId={settings.activeProvider}
        providerSettings={providerSettings}
        baseUrl={baseUrl}
      />
        </>
      )}
    </div>
  );
};

export default KycIntegrationPage;
