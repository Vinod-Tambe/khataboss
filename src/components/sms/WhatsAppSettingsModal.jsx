import React, { useEffect, useRef, useState } from "react";
import { FiCheckCircle, FiRefreshCw, FiSmartphone, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  disconnectWhatsApp,
  getWhatsAppSettings,
  makeWhatsAppInstance,
  refreshWhatsAppStatus,
} from "../../api/smsApi";

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

const formatDisplayPhone = (value) => {
  const d = digitsOnly(value);
  if (!d) return "";
  if (d.length === 12 && d.startsWith("91")) return `+${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length === 10) return `+91 ${d}`;
  return `+${d}`;
};

const qrSrc = (qr) => {
  if (!qr) return "";
  if (String(qr).startsWith("data:image") || String(qr).startsWith("http")) return qr;
  return `data:image/png;base64,${qr}`;
};

const WhatsAppSettingsModal = ({ open, onClose, firmId, firmName }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const applyInstance = (data) => {
    setInstance(data || null);
    if (data?.phoneNumber) setPhoneNumber(digitsOnly(data.phoneNumber));
  };

  const load = async () => {
    if (!firmId || firmId === "all") return;
    setLoading(true);
    try {
      const res = await getWhatsAppSettings(firmId);
      applyInstance(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load WhatsApp settings");
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    if (!firmId || firmId === "all") return;
    try {
      const res = await refreshWhatsAppStatus(firmId);
      if (res.instance) {
        applyInstance(res.instance);
        if (res.instance.status === "Connected") {
          stopPolling();
          toast.success("WhatsApp connected successfully");
        }
      }
    } catch {
      // keep polling quietly
    }
  };

  useEffect(() => {
    if (open) load();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, firmId]);

  useEffect(() => {
    stopPolling();
    if (!open) return;
    if (instance?.status === "Connected") return;
    if (!instance?.hasCredentials && !instance?.qrCode) return;

    pollRef.current = setInterval(pollStatus, 4000);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, instance?.status, instance?.hasCredentials, instance?.qrCode, firmId]);

  if (!open) return null;

  const status = instance?.status || "Pending";
  const qr = instance?.qrCode || "";
  const isConnected = status === "Connected";

  const handleGenerate = async () => {
    if (!firmId || firmId === "all") {
      toast.error("Select a firm first");
      return;
    }
    const phone = digitsOnly(phoneNumber);
    if (phone.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }

    setBusy("make");
    try {
      const res = await makeWhatsAppInstance({
        firmId,
        phoneNumber: phone,
        reset: Boolean(instance?.status && instance.status !== "Connected"),
      });
      if (res.data) applyInstance(res.data);
      if (res.success) {
        toast.success(res.message || "Scan the QR code with WhatsApp");
      } else {
        toast.error(res.message || "Could not create WhatsApp instance");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create instance");
    } finally {
      setBusy("");
    }
  };

  const handleRefresh = async () => {
    if (!firmId || firmId === "all") return;
    setBusy("refresh");
    try {
      const res = await refreshWhatsAppStatus(firmId);
      if (res.instance) applyInstance(res.instance);
      toast.success(res.success ? `Status: ${res.instance?.status || "Pending"}` : res.message);
    } catch (err) {
      toast.error(err.message || "Failed to refresh status");
    } finally {
      setBusy("");
    }
  };

  const handleDisconnect = async () => {
    if (!firmId || firmId === "all") return;
    setBusy("disconnect");
    try {
      const res = await disconnectWhatsApp(firmId);
      applyInstance(res.data);
      stopPolling();
      toast.success("WhatsApp disconnected. Enter number again to reconnect.");
    } catch (err) {
      toast.error(err.message || "Failed to disconnect");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="sms-modal-backdrop" role="dialog" aria-modal="true" aria-label="WhatsApp settings">
      <div className="sms-modal">
        <div className="sms-modal-head">
          <div>
            <h4>WhatsApp Instance Settings</h4>
            <p>
              Firm: <strong>{firmName || "Selected firm"}</strong>
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
              <ol className="sms-wa-steps">
                <li className={phoneNumber ? "done" : "active"}>Enter mobile number</li>
                <li className={qr && !isConnected ? "active" : isConnected ? "done" : ""}>
                  Scan QR on that phone
                </li>
                <li className={isConnected ? "done active" : ""}>Connected & ready</li>
              </ol>

              <div className="sms-wa-status-row">
                <span className={`sms-wa-status-pill status-${String(status).toLowerCase()}`}>
                  {isConnected ? (
                    <>
                      <FiCheckCircle size={12} className="me-1" /> Connected
                    </>
                  ) : (
                    status
                  )}
                </span>
                {instance?.hasCredentials ? (
                  <button
                    type="button"
                    className="btn btn-sms-discard btn-sm"
                    onClick={handleRefresh}
                    disabled={busy === "refresh"}
                  >
                    <FiRefreshCw size={14} className="me-1" />
                    Refresh
                  </button>
                ) : null}
              </div>

              {isConnected ? (
                <div className="sms-wa-connected-box">
                  <FiSmartphone size={22} />
                  <div>
                    <strong>WhatsApp is connected</strong>
                    <p>
                      Using {formatDisplayPhone(instance?.phoneNumber || phoneNumber)} for{" "}
                      {firmName || "this firm"}.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="sms-form-hint mb-3">
                    Enter the WhatsApp mobile number, generate QR, then scan it from that same
                    phone. No UltraMsg or third-party token is required.
                  </p>

                  <label className="form-label">WhatsApp mobile number</label>
                  <div className="sms-wa-phone-row">
                    <span className="sms-wa-phone-prefix">+</span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="9198XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(digitsOnly(e.target.value).slice(0, 15))}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>
                  <small className="sms-field-hint">
                    10-digit Indian numbers are saved as 91XXXXXXXXXX automatically. No third-party
                    token needed.
                  </small>
                </>
              )}

              {qr && !isConnected ? (
                <div className="sms-wa-qr-box">
                  <p className="sms-form-hint mb-2">
                    Open WhatsApp on <strong>{formatDisplayPhone(phoneNumber)}</strong> → Linked
                    devices → Link a device → scan this QR
                  </p>
                  <img
                    src={qrSrc(qr)}
                    alt="WhatsApp QR"
                    className="sms-wa-qr-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="sms-field-hint mt-2 mb-0">
                    Waiting for scan… status refreshes automatically.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="sms-modal-actions">
          {instance?.hasCredentials ? (
            <button
              type="button"
              className="btn btn-sms-discard"
              onClick={handleDisconnect}
              disabled={!!busy}
            >
              {busy === "disconnect" ? "Disconnecting…" : "Disconnect"}
            </button>
          ) : (
            <button type="button" className="btn btn-sms-discard" onClick={onClose}>
              Close
            </button>
          )}
          {!isConnected ? (
            <button
              type="button"
              className="btn btn-sms-save"
              onClick={handleGenerate}
              disabled={!!busy || digitsOnly(phoneNumber).length < 10}
            >
              {busy === "make"
                ? "Generating…"
                : qr
                  ? "Regenerate QR"
                  : "Generate QR & Connect"}
            </button>
          ) : (
            <button type="button" className="btn btn-sms-save" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettingsModal;
