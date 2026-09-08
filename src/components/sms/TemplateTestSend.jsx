import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { testMessageTemplate } from "../../api/smsApi";
import { stripHtml } from "./MessageBodyEditor";
import { sanitizeBodyForSave } from "./templateBodyUtils";

const channelTitle = (channel) => {
  if (channel === "sms") return "Text SMS";
  if (channel === "email") return "Email";
  return "WhatsApp";
};

const TemplateTestSend = ({
  firmId,
  channel,
  subject,
  body,
  templateName,
  templateKey,
  templateUuid,
  newFiles = [],
  attachmentCount = 0,
  disabled = false,
}) => {
  const { user } = useSelector((state) => state.auth);

  const defaultRecipient = useMemo(() => {
    if (channel === "email") {
      return user?.own_email || "";
    }
    return user?.own_mobile_no || "";
  }, [channel, user?.own_email, user?.own_mobile_no]);

  const [to, setTo] = useState(defaultRecipient);
  const [sending, setSending] = useState(false);
  const [smsPreview, setSmsPreview] = useState(null);

  useEffect(() => {
    setTo(defaultRecipient);
    setSmsPreview(null);
  }, [defaultRecipient, channel]);

  const handleTestSend = async () => {
    if (!firmId) {
      toast.error("Select a firm first");
      return;
    }
    if (!stripHtml(body).trim()) {
      toast.error("Message body is required");
      return;
    }
    if (channel === "email" && !subject?.trim()) {
      toast.error("Email subject is required");
      return;
    }
    if (channel === "email" && (!to.trim() || !to.includes("@"))) {
      toast.error("Enter a valid test email address");
      return;
    }
    if (channel !== "email" && !to.trim()) {
      toast.error("Enter a test mobile number");
      return;
    }

    setSending(true);
    try {
      let bodyToSend;
      try {
        bodyToSend = sanitizeBodyForSave(body, channel);
      } catch (err) {
        toast.error(err.message || "Invalid template format");
        return;
      }

      const res = await testMessageTemplate(
        {
          firmId,
          channel,
          to: to.trim(),
          subject: channel === "email" ? subject.trim() : "",
          body: bodyToSend,
          templateName,
          templateKey,
          templateUuid,
        },
        newFiles
      );

      if (res.preview && channel === "sms") {
        setSmsPreview(res.data || null);
        toast.success(res.message || "SMS preview ready", { duration: 5000 });
        return;
      }

      setSmsPreview(null);
      toast.success(res.message || "Test message sent");
    } catch (err) {
      toast.error(err.message || "Failed to send test message");
    } finally {
      setSending(false);
    }
  };

  const recipientLabel =
    channel === "email" ? "Test email address" : "Test mobile number";
  const recipientPlaceholder =
    channel === "email" ? "you@example.com" : "10-digit mobile with country code if needed";

  return (
    <div className="sms-test-send">
      <div className="sms-test-send-head">
        <strong>Send test {channelTitle(channel)}</strong>
        <span>Uses sample data: Jane Doe, 7890, 4,500.00</span>
      </div>
      <div className="sms-test-send-row">
        <div className="sms-test-send-field">
          <label className="form-label mb-1">{recipientLabel}</label>
          <input
            type={channel === "email" ? "email" : "tel"}
            className="form-control"
            placeholder={recipientPlaceholder}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={disabled || sending}
          />
        </div>
        <button
          type="button"
          className="btn btn-sms-test"
          onClick={handleTestSend}
          disabled={disabled || sending || !firmId}
        >
          <FiSend size={15} />
          {sending ? "Sending…" : `Test ${channelTitle(channel)}`}
        </button>
      </div>
      {channel === "sms" ? (
        <p className="sms-test-send-hint mb-0">
          SMS gateway is not connected yet — test shows formatted message preview and character count.
        </p>
      ) : (
        <p className="sms-test-send-hint mb-0">
          Sends the current draft (unsaved changes included) with KhataBoss branding and footer.
          {attachmentCount > 0
            ? ` Includes ${attachmentCount} attachment${attachmentCount > 1 ? "s" : ""} (save template first to keep files on the server).`
            : ""}
        </p>
      )}
      {smsPreview?.formattedBody ? (
        <div className="sms-test-preview-box">
          <div className="sms-test-preview-meta">
            {smsPreview.characters} chars · {smsPreview.parts} SMS part(s)
          </div>
          <pre>{smsPreview.formattedBody}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default TemplateTestSend;
