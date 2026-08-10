import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  FiEdit3,
  FiEye,
  FiList,
  FiMail,
  FiMessageSquare,
  FiPaperclip,
  FiSettings,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import List from "../common/List";
import MessageBodyEditor, { stripHtml } from "./MessageBodyEditor";
import TemplatePreview from "./TemplatePreview";
import WhatsAppSettingsModal from "./WhatsAppSettingsModal";
import EmailSettingsModal from "./EmailSettingsModal";
import { getMessageTemplates, updateMessageTemplate } from "../../api/smsApi";
import "../../css/Sms.css";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", shortLabel: "WhatsApp", iconClass: "bi bi-whatsapp" },
  { id: "sms", label: "Text SMS", shortLabel: "SMS", icon: FiMessageSquare },
  { id: "email", label: "Email", shortLabel: "Email", icon: FiMail },
];

const CATEGORIES = ["Marketing", "Transactional", "Customer Care", "OTP"];
const LANGUAGES = ["English (US)", "English (UK)", "Hindi"];

const VARIABLES = [
  { key: "{{1}}", label: "{{1}} Name" },
  { key: "{{2}}", label: "{{2}} Code / Ref / Login" },
  { key: "{{3}}", label: "{{3}} Amount / Password" },
  { key: "{{4}}", label: "{{4}} Date / Extra" },
  { key: "{{firm_name}}", label: "{{firm_name}}" },
];

const getInitialForm = (channel = "whatsapp") => ({
  name: "",
  category: "Marketing",
  language: "English (US)",
  subject: "",
  body: "",
  channel,
  hasAttachment: false,
});

const channelTitle = (channel) => {
  if (channel === "sms") return "Text SMS";
  if (channel === "email") return "Email";
  return "WhatsApp";
};

const SmsPage = () => {
  const { firms, selectedFirmId } = useSelector((state) => state.firm);

  const activeFirm = useMemo(() => {
    if (!firms?.length) return null;
    if (selectedFirmId && selectedFirmId !== "all") {
      return firms.find((f) => String(f.firm_id) === String(selectedFirmId)) || firms[0];
    }
    return firms[0];
  }, [firms, selectedFirmId]);

  const firmId = activeFirm?.firm_id;
  const firmName = activeFirm?.firm_name || "Your Firm";

  const [activeChannel, setActiveChannel] = useState("whatsapp");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialForm("whatsapp"));
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [openSelect, setOpenSelect] = useState(null);
  const [mobileMode, setMobileMode] = useState("list");
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!firmId) {
      setTemplates([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getMessageTemplates({ firmId, channel: activeChannel });
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [firmId, activeChannel]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    return [...templates].sort(
      (a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf()
    );
  }, [templates]);

  const bodyLength = stripHtml(formData.body).length;
  const smsParts = Math.max(1, Math.ceil(bodyLength / 160));
  const previewAttachments = [
    ...existingAttachments,
    ...newFiles.map((f) => ({ originalName: f.name, filename: f.name })),
  ];

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    setEditingId(null);
    setFormData(getInitialForm(channel));
    setExistingAttachments([]);
    setNewFiles([]);
    setMobileMode("list");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBodyChange = (html) => {
    setFormData((prev) => ({ ...prev, body: html }));
  };

  const handleDiscard = () => {
    if (editingId) {
      const existing = templates.find((t) => t.id === editingId || t.uuid === editingId);
      if (existing) {
        setFormData({
          name: existing.name,
          category: existing.category,
          language: existing.language,
          subject: existing.subject || "",
          body: existing.body,
          channel: existing.channel,
          hasAttachment: Boolean(existing.hasAttachment),
        });
        setExistingAttachments(existing.attachments || []);
        setNewFiles([]);
        return;
      }
    }
    setFormData(getInitialForm(activeChannel));
    setEditingId(null);
    setExistingAttachments([]);
    setNewFiles([]);
    setMobileMode("list");
  };

  const handleEdit = (row) => {
    setEditingId(row.id || row.uuid);
    setActiveChannel(row.channel);
    setFormData({
      name: row.name,
      category: row.category,
      language: row.language,
      subject: row.subject || "",
      body: row.body,
      channel: row.channel,
      hasAttachment: Boolean(row.hasAttachment),
    });
    setExistingAttachments(row.attachments || []);
    setNewFiles([]);
    setMobileMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firmId) {
      toast.error("Create or select a firm first");
      return;
    }
    if (!editingId) {
      toast.error("Select a template from the list to edit");
      return;
    }
    if (!stripHtml(formData.body).trim()) {
      toast.error("Message body is required");
      return;
    }
    if (activeChannel === "email" && !formData.subject.trim()) {
      toast.error("Email subject is required");
      return;
    }

    const fd = new FormData();
    fd.append("firmId", String(firmId));
    fd.append("channel", activeChannel);
    fd.append("name", formData.name.trim().toLowerCase().replace(/\s+/g, "_"));
    fd.append("category", formData.category);
    fd.append("language", formData.language);
    fd.append("subject", activeChannel === "email" ? formData.subject.trim() : "");
    fd.append("body", formData.body);
    fd.append(
      "hasAttachment",
      String(formData.hasAttachment || newFiles.length > 0 || existingAttachments.length > 0)
    );
    fd.append("variables", JSON.stringify(VARIABLES));
    newFiles.forEach((file) => fd.append("attachments", file));

    setSaving(true);
    try {
      await updateMessageTemplate(editingId, fd);
      toast.success("Template updated");
      setEditingId(null);
      setFormData(getInitialForm(activeChannel));
      setExistingAttachments([]);
      setNewFiles([]);
      setMobileMode("list");
      await loadTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const renderChannelTabs = (extraClass = "") => (
    <div className={`sms-tabs ${extraClass}`.trim()} role="tablist" aria-label="Template channels">
      {CHANNELS.map(({ id, label, shortLabel, icon: Icon, iconClass }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeChannel === id}
          className={`sms-tab sms-tab-${id} ${activeChannel === id ? "active" : ""}`}
          onClick={() => handleChannelChange(id)}
        >
          {iconClass ? (
            <i className={`${iconClass} sms-tab-icon`} aria-hidden="true" />
          ) : (
            Icon && <Icon size={16} className="sms-tab-icon" />
          )}
          <span className="sms-tab-label-full">{label}</span>
          <span className="sms-tab-label-short">{shortLabel}</span>
        </button>
      ))}
    </div>
  );

  const columns = [
    { title: "Name", key: "name", orderable: true, searchable: true },
    { title: "Category", key: "category", orderable: true, searchable: true },
    {
      title: "Content",
      key: "body",
      orderable: false,
      searchable: true,
      render: (val) => {
        const text = stripHtml(val || "");
        return text.length > 60 ? `${text.slice(0, 60)}...` : text;
      },
    },
    {
      title: "Attachment",
      key: "hasAttachment",
      orderable: false,
      searchable: false,
      render: (val, _type, row) => {
        const count = Array.isArray(row?.attachments) ? row.attachments.length : 0;
        if (!val && !count) return "—";
        return count ? `Yes (${count})` : "Optional";
      },
    },
    {
      key: "updatedAt",
      title: "Last Updated",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => (value ? moment(value).format("DD-MM-YYYY hh:mm A") : "-"),
    },
    {
      title: "Status",
      key: "status",
      orderable: true,
      searchable: true,
      render: (val) =>
        `<span class="badge ${val === "Active" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}">${val || "-"}</span>`,
    },
  ];

  return (
    <div className={`sms-page mobile-mode-${mobileMode}`}>
      <div className="sms-page-header">
        <div>
          <h2 className="sms-page-title">Message Templates</h2>
          <p className="sms-page-subtitle">
            System templates for WhatsApp, SMS, and Email
            {firmName ? ` — ${firmName}` : ""}. Edit message content only; names are fixed for
            triggers.
            {selectedFirmId === "all" && firms?.length > 1
              ? " Pick a firm from the top filter to switch."
              : ""}
          </p>
        </div>
        <div className="sms-page-header-actions">
          {activeChannel === "whatsapp" ? (
            <button
              type="button"
              className="btn btn-sms-wa-settings"
              onClick={() => setWaModalOpen(true)}
              disabled={!firmId}
            >
              <FiSettings size={16} />
              <span>WhatsApp Settings</span>
            </button>
          ) : null}
          {activeChannel === "email" ? (
            <button
              type="button"
              className="btn btn-sms-wa-settings"
              onClick={() => setEmailModalOpen(true)}
            >
              <FiSettings size={16} />
              <span>Email Settings</span>
            </button>
          ) : null}
        </div>
      </div>

      {!firmId ? (
        <div className="alert alert-warning">
          Create a firm first to manage message templates. Existing workflows are unaffected.
        </div>
      ) : null}

      {renderChannelTabs("sms-tabs-desktop")}

      <div className="sms-mobile-mode-tabs" role="tablist" aria-label="Mobile sections">
        <button
          type="button"
          role="tab"
          aria-selected={mobileMode === "list"}
          className={`sms-mobile-mode-tab ${mobileMode === "list" ? "active" : ""}`}
          onClick={() => setMobileMode("list")}
        >
          <FiList size={16} />
          <span>List</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileMode === "edit"}
          className={`sms-mobile-mode-tab ${mobileMode === "edit" ? "active" : ""}`}
          onClick={() => editingId && setMobileMode("edit")}
          disabled={!editingId}
        >
          <FiEdit3 size={16} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileMode === "preview"}
          className={`sms-mobile-mode-tab ${mobileMode === "preview" ? "active" : ""}`}
          onClick={() => setMobileMode("preview")}
        >
          <FiEye size={16} />
          <span>Preview</span>
        </button>
      </div>

      {renderChannelTabs("sms-tabs-mobile-channels")}

      <div className="sms-workspace">
        <div className="sms-workspace-body">
          {editingId ? (
          <div className="sms-form-card">
            <div className="sms-form-card-head">
              <div>
                <h4>
                  <FiEdit3 size={16} className="me-1" />
                  Edit {channelTitle(activeChannel)} Template
                </h4>
                <p className="sms-form-hint">
                  Template key is fixed for system triggers. You can edit subject, body, and
                  attachments only.
                </p>
              </div>
              <span className="sms-edit-badge">Editing</span>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">Template Key</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    readOnly
                    disabled
                  />
                  <small className="sms-field-hint">Used by loan, finance, staff & customer triggers</small>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Category</label>
                  <div className={`sms-select-wrap ${openSelect === "category" ? "is-open" : ""}`}>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onMouseDown={() => setOpenSelect("category")}
                      onChange={(e) => {
                        handleChange(e);
                        setOpenSelect(null);
                      }}
                      onBlur={() => setOpenSelect(null)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Language</label>
                  <div className={`sms-select-wrap ${openSelect === "language" ? "is-open" : ""}`}>
                    <select
                      name="language"
                      className="form-select"
                      value={formData.language}
                      onMouseDown={() => setOpenSelect("language")}
                      onChange={(e) => {
                        handleChange(e);
                        setOpenSelect(null);
                      }}
                      onBlur={() => setOpenSelect(null)}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeChannel === "email" && (
                  <div className="col-12">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Email subject line"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">Message Body</label>
                  <MessageBodyEditor
                    value={formData.body}
                    onChange={handleBodyChange}
                    variables={VARIABLES}
                    placeholder="Write your message template..."
                  />
                  {activeChannel === "sms" ? (
                    <div className={`sms-char-count ${bodyLength > 160 ? "is-warn" : ""}`}>
                      <span>{bodyLength} / 160 characters</span>
                      {bodyLength > 160 ? <span>· {smsParts} SMS parts</span> : <span>· 1 SMS part</span>}
                    </div>
                  ) : (
                    <div className="sms-char-count">{bodyLength} characters</div>
                  )}
                </div>

                {activeChannel !== "sms" ? (
                  <div className="col-12">
                    <label className="form-label">
                      <FiPaperclip size={14} className="me-1" />
                      Attachments {activeChannel === "email" ? "(PDF / image)" : "(optional)"}
                    </label>
                    <div className="sms-attach-row">
                      <label className="sms-attach-check">
                        <input
                          type="checkbox"
                          name="hasAttachment"
                          checked={formData.hasAttachment}
                          onChange={handleChange}
                        />
                        <span>This message may include an attachment when sent</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
                      />
                    </div>
                    {existingAttachments.length || newFiles.length ? (
                      <ul className="sms-attach-list">
                        {existingAttachments.map((a, idx) => (
                          <li key={`ex-${idx}`}>{a.originalName || a.filename}</li>
                        ))}
                        {newFiles.map((f, idx) => (
                          <li key={`new-${idx}`}>{f.name} (new)</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="sms-form-actions">
                <button type="button" className="btn btn-sms-discard" onClick={handleDiscard}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sms-save" disabled={saving || !firmId}>
                  {saving ? "Saving…" : "Update Template"}
                </button>
              </div>
            </form>
          </div>
          ) : (
            <div className="sms-form-card sms-form-empty">
              <FiEdit3 size={28} className="sms-form-empty-icon" />
              <h4>Select a template to edit</h4>
              <p className="sms-form-hint mb-0">
                Templates are created automatically when a firm is added. Click the edit button on
                any row below to update message content.
              </p>
            </div>
          )}

          <aside className="sms-preview-panel">
            <div className="sms-preview-panel-head">
              <div>
                <h5>Live Preview</h5>
                <p>How your {channelTitle(activeChannel).toLowerCase()} will look to customers</p>
              </div>
              <span className="sms-preview-channel-pill">{channelTitle(activeChannel)}</span>
            </div>

            <div className="sms-preview-wrap">
              <TemplatePreview
                channel={activeChannel}
                body={formData.body}
                subject={formData.subject}
                firmName={firmName}
                attachments={previewAttachments}
                hasAttachment={formData.hasAttachment || previewAttachments.length > 0}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="sms-list-card card shadow-sm border-0 border-md-1 border-secondary">
        <List
          data={filteredTemplates}
          columns={columns}
          title={`${channelTitle(activeChannel)} Templates${loading ? " (loading…)" : ""}`}
          primaryKey="name"
          subtitleKey="updatedAt"
          hasDelete={false}
          hasEdit={true}
          onEdit={handleEdit}
          showFooter={false}
          showSearch={false}
        />
      </div>

      <WhatsAppSettingsModal
        open={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        firmId={firmId}
        firmName={firmName}
      />

      <EmailSettingsModal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
};

export default SmsPage;
