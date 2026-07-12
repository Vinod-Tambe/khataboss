import React from "react";
import { FiMoreVertical, FiPhone, FiVideo, FiPaperclip, FiMic, FiSend } from "react-icons/fi";
import { plainToHtml, stripHtml } from "./MessageBodyEditor";

const SAMPLE_VARS = {
  1: "Jane Doe",
  2: "7890",
  3: "4 stars",
};

export const fillTemplatePreview = (text = "") =>
  text.replace(/\{\{(\d+)\}\}/g, (_, n) => SAMPLE_VARS[n] || `{{${n}}}`);

const PreviewHtml = ({ body, emptyText }) => {
  const html = fillTemplatePreview(plainToHtml(body || ""));
  const hasText = stripHtml(html).trim().length > 0;

  if (!hasText) {
    return <>{emptyText}</>;
  }

  return <div className="sms-preview-html" dangerouslySetInnerHTML={{ __html: html }} />;
};

const PhoneShell = ({ children, screenClassName = "" }) => (
  <div className="sms-phone" aria-hidden="true">
    <div className="sms-phone-notch" />
    <div className={`sms-phone-screen ${screenClassName}`}>{children}</div>
  </div>
);

const WhatsAppPreview = ({ body, firmName }) => (
  <PhoneShell>
    <div className="wa-header">
      <div className="wa-avatar">{(firmName || "AC").slice(0, 2).toUpperCase()}</div>
      <div className="wa-header-meta">
        <strong>{firmName || "Acme Corp"}</strong>
        <span>online</span>
      </div>
      <FiVideo size={16} />
      <FiPhone size={16} />
      <FiMoreVertical size={16} />
    </div>
    <div className="wa-chat">
      <div className="wa-bubble">
        <PreviewHtml body={body} emptyText="Your message preview will appear here." />
        <span className="wa-time">Today 9:15 AM</span>
      </div>
    </div>
    <div className="wa-composer">
      <FiPaperclip size={14} color="#667781" />
      <div className="wa-composer-input">Type a message</div>
      <div className="wa-send">
        <FiMic size={14} />
      </div>
    </div>
  </PhoneShell>
);

const SmsPreview = ({ body, firmName }) => (
  <PhoneShell screenClassName="sms-imessage">
    <div className="im-header">
      <strong>{firmName || "Acme Corp"}</strong>
      <span>Text Message · iMessage</span>
    </div>
    <div className="im-chat">
      <div className="im-bubble">
        <PreviewHtml body={body} emptyText="Your SMS preview will appear here." />
      </div>
    </div>
    <div className="im-composer">
      <div className="im-composer-input">iMessage</div>
      <FiSend size={14} color="#007aff" />
    </div>
  </PhoneShell>
);

const EmailPreview = ({ body, subject, firmName }) => (
  <PhoneShell screenClassName="email-preview">
    <div className="email-header">
      <strong>Inbox</strong>
      <div className="email-meta">
        <div>
          <b>From:</b> {firmName || "Acme Corp"} &lt;noreply@acme.com&gt;
        </div>
        <div>
          <b>To:</b> jane.doe@email.com
        </div>
        <div>
          <b>Subject:</b> {subject || "Welcome to Acme Corp"}
        </div>
      </div>
    </div>
    <div className="email-body">
      <PreviewHtml body={body} emptyText="Your email preview will appear here." />
    </div>
  </PhoneShell>
);

const TemplatePreview = ({ channel, body, subject, firmName }) => {
  if (channel === "sms") {
    return <SmsPreview body={body} firmName={firmName} />;
  }
  if (channel === "email") {
    return <EmailPreview body={body} subject={subject} firmName={firmName} />;
  }
  return <WhatsAppPreview body={body} firmName={firmName} />;
};

export default TemplatePreview;
