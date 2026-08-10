import React from "react";
import {
  FiArrowLeft,
  FiBattery,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiPaperclip,
  FiMic,
  FiSend,
  FiWifi,
  FiBarChart2,
} from "react-icons/fi";
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
    return <span className="sms-preview-empty">{emptyText}</span>;
  }

  return <div className="sms-preview-html" dangerouslySetInnerHTML={{ __html: html }} />;
};

const StatusBar = () => (
  <div className="sms-status-bar">
    <span>9:41</span>
    <div className="sms-status-bar-icons">
      <FiBarChart2 size={10} />
      <FiWifi size={10} />
      <FiBattery size={12} />
    </div>
  </div>
);

const PhoneShell = ({ children, screenClassName = "", channelLabel }) => (
  <div className="sms-phone" aria-hidden="true">
    <div className="sms-phone-bezel">
      <div className="sms-phone-notch" />
      <div className={`sms-phone-screen ${screenClassName}`}>
        <StatusBar />
        {children}
      </div>
    </div>
    {channelLabel ? <div className="sms-phone-caption">{channelLabel}</div> : null}
  </div>
);

const AttachmentChip = ({ attachments = [], hasAttachment }) => {
  const list = Array.isArray(attachments) ? attachments : [];
  if (!list.length && !hasAttachment) return null;
  const label = list[0]?.originalName || list[0]?.filename || "Attachment ready";
  return (
    <div className="sms-preview-attach">
      <FiPaperclip size={12} />
      <span>{label}{list.length > 1 ? ` +${list.length - 1}` : ""}</span>
    </div>
  );
};

const WhatsAppPreview = ({ body, firmName, attachments, hasAttachment }) => (
  <PhoneShell channelLabel="WhatsApp preview">
    <div className="wa-header">
      <FiArrowLeft size={14} />
      <div className="wa-avatar">{(firmName || "AC").slice(0, 2).toUpperCase()}</div>
      <div className="wa-header-meta">
        <strong>{firmName || "Acme Corp"}</strong>
        <span>online</span>
      </div>
      <FiVideo size={14} />
      <FiPhone size={14} />
      <FiMoreVertical size={14} />
    </div>
    <div className="wa-chat">
      <div className="wa-date-chip">Today</div>
      <div className="wa-bubble">
        <PreviewHtml body={body} emptyText="Start typing to preview your WhatsApp message…" />
        <AttachmentChip attachments={attachments} hasAttachment={hasAttachment} />
        <span className="wa-time">9:15 AM ✓✓</span>
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
  <PhoneShell screenClassName="sms-imessage" channelLabel="SMS preview">
    <div className="im-header">
      <FiArrowLeft size={14} className="im-back" />
      <div className="im-header-center">
        <div className="im-avatar">{(firmName || "AC").slice(0, 1).toUpperCase()}</div>
        <strong>{firmName || "Acme Corp"}</strong>
        <span>Text Message</span>
      </div>
    </div>
    <div className="im-chat">
      <div className="im-bubble">
        <PreviewHtml body={body} emptyText="Start typing to preview your SMS…" />
      </div>
    </div>
    <div className="im-composer">
      <div className="im-composer-input">Text Message</div>
      <div className="im-send">
        <FiSend size={12} />
      </div>
    </div>
  </PhoneShell>
);

const EmailPreview = ({ body, subject, firmName, attachments, hasAttachment }) => (
  <PhoneShell screenClassName="email-preview" channelLabel="Email preview">
    <div className="email-header">
      <div className="email-toolbar">
        <FiArrowLeft size={14} />
        <strong>Inbox</strong>
      </div>
      <div className="email-meta">
        <div>
          <b>From</b>
          <span>
            {firmName || "Acme Corp"} &lt;noreply@firm.com&gt;
          </span>
        </div>
        <div>
          <b>To</b>
          <span>jane.doe@email.com</span>
        </div>
        <div>
          <b>Subject</b>
          <span>{subject?.trim() || "Your email subject"}</span>
        </div>
      </div>
    </div>
    <div className="email-body">
      <PreviewHtml body={body} emptyText="Start typing to preview your email…" />
      <AttachmentChip attachments={attachments} hasAttachment={hasAttachment} />
    </div>
  </PhoneShell>
);

const TemplatePreview = ({ channel, body, subject, firmName, attachments, hasAttachment }) => {
  if (channel === "sms") {
    return <SmsPreview body={body} firmName={firmName} />;
  }
  if (channel === "email") {
    return (
      <EmailPreview
        body={body}
        subject={subject}
        firmName={firmName}
        attachments={attachments}
        hasAttachment={hasAttachment}
      />
    );
  }
  return (
    <WhatsAppPreview
      body={body}
      firmName={firmName}
      attachments={attachments}
      hasAttachment={hasAttachment}
    />
  );
};

export default TemplatePreview;
