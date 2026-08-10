import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiMail, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  clearEmailSettings,
  getEmailSettings,
  saveEmailSettings,
  testEmailSettings,
} from "../../api/smsApi";

const EmailSettingsModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("Khataboss");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [testTo, setTestTo] = useState("");

  const applySettings = (data) => {
    setSettings(data || null);
    if (data?.email) setEmail(data.email);
    if (data?.fromName) setFromName(data.fromName);
    setPassword("");
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEmailSettings();
      applySettings(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load email settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const status = settings?.status || "NotConfigured";
  const isConfigured = Boolean(settings?.configured);

  const handleSave = async () => {
    setBusy("save");
    try {
      const res = await saveEmailSettings({
        email: email.trim(),
        password: password.trim() || undefined,
        fromName: fromName.trim() || "Khataboss",
        provider: "gmail",
      });
      applySettings(res.data);
      if (res.success) {
        toast.success(res.message || "Email settings saved");
      } else {
        toast.error(res.message || "Saved but verification failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save email settings");
    } finally {
      setBusy("");
    }
  };

  const handleTest = async () => {
    const to = (testTo || email).trim();
    if (!to || !to.includes("@")) {
      toast.error("Enter a valid test recipient email");
      return;
    }
    setBusy("test");
    try {
      const res = await testEmailSettings({ to });
      toast.success(res.message || "Test email sent");
    } catch (err) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setBusy("");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Remove saved Gmail credentials for this owner account?")) return;
    setBusy("clear");
    try {
      const res = await clearEmailSettings();
      applySettings(res.data);
      setEmail("");
      setPassword("");
      toast.success("Email settings cleared");
    } catch (err) {
      toast.error(err.message || "Failed to clear settings");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="sms-modal-backdrop" role="dialog" aria-modal="true" aria-label="Email settings">
      <div className="sms-modal">
        <div className="sms-modal-head">
          <div>
            <h4>Email Settings</h4>
            <p>
              Saved in your account database (Owner record) — applies to all firms after login
            </p>
          </div>
          <button type="button" className="sms-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="sms-modal-body">
          {loading ? (
            <p className="sms-form-hint">Loading settings…</p>
          ) : (
            <>
              <div className="sms-wa-status-row">
                <span className={`sms-wa-status-pill status-${String(status).toLowerCase()}`}>
                  {isConfigured ? (
                    <>
                      <FiCheckCircle size={12} className="me-1" /> Configured
                    </>
                  ) : (
                    status
                  )}
                </span>
              </div>

              {isConfigured ? (
                <div className="sms-wa-connected-box">
                  <FiMail size={22} />
                  <div>
                    <strong>Email is configured</strong>
                    <p>
                      Sending from <strong>{settings?.email || email}</strong> for all automated
                      emails (OTP, receipts, templates).
                    </p>
                  </div>
                </div>
              ) : (
                <p className="sms-form-hint mb-3">
                  Use a Gmail address with a Google <strong>App Password</strong> (not your login
                  password). Set once here — no need to edit server .env when you change accounts.
                </p>
              )}

              <label className="form-label">Gmail address (sender)</label>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <label className="form-label">Gmail app password</label>
              <input
                type="password"
                className="form-control mb-1"
                placeholder={settings?.hasPassword ? "Leave blank to keep current password" : "16-character app password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <small className="sms-field-hint d-block mb-3">
                Google Account → Security → 2-Step Verification → App passwords
              </small>

              <label className="form-label">Display name (From)</label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Khataboss"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />

              <label className="form-label">Send test to (optional)</label>
              <input
                type="email"
                className="form-control"
                placeholder="Defaults to sender email above"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
              />
            </>
          )}
        </div>

        <div className="sms-modal-actions">
          {isConfigured ? (
            <button
              type="button"
              className="btn btn-sms-discard"
              onClick={handleClear}
              disabled={!!busy}
            >
              {busy === "clear" ? "Clearing…" : "Clear"}
            </button>
          ) : (
            <button type="button" className="btn btn-sms-discard" onClick={onClose}>
              Close
            </button>
          )}
          <button
            type="button"
            className="btn btn-sms-discard"
            onClick={handleTest}
            disabled={!!busy || !email.trim()}
          >
            {busy === "test" ? "Sending…" : "Send test"}
          </button>
          <button
            type="button"
            className="btn btn-sms-save"
            onClick={handleSave}
            disabled={!!busy || !email.trim() || (!settings?.hasPassword && !password.trim())}
          >
            {busy === "save" ? "Saving…" : "Save & verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
