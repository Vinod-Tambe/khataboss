import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  FiMail,
  FiMessageCircle,
  FiMessageSquare,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import List from "../common/List";
import MessageBodyEditor, { stripHtml } from "./MessageBodyEditor";
import TemplatePreview from "./TemplatePreview";
import "../../css/Sms.css";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Templates", icon: FiMessageCircle },
  { id: "sms", label: "Text SMS", icon: FiMessageSquare },
  { id: "email", label: "Email Templates", icon: FiMail },
];

const CATEGORIES = ["Marketing", "Transactional", "Customer Care", "OTP"];
const LANGUAGES = ["English (US)", "English (UK)", "Hindi"];

const VARIABLES = [
  { key: "{{1}}", label: "{{1}} User Name" },
  { key: "{{2}}", label: "{{2}} Code" },
  { key: "{{3}}", label: "{{3}} Rating" },
];

const STORAGE_KEY = "khataboss_sms_templates";

const DEFAULT_TEMPLATES = [
  {
    id: "tpl-1",
    channel: "whatsapp",
    name: "welcome_message_v1",
    category: "Marketing",
    language: "English (US)",
    subject: "",
    body: "Hello {{1}},\n\nWelcome to Acme Corp! Your unique code is: {{2}}.\n\nWe appreciate what you rate in {{3}}.",
    status: "Active",
    updatedAt: "2026-07-12T09:15:00",
  },
  {
    id: "tpl-2",
    channel: "whatsapp",
    name: "order_confirmation",
    category: "Transactional",
    language: "English (US)",
    subject: "",
    body: "Hi {{1}}, your order has been confirmed. Tracking code: {{2}}.",
    status: "Active",
    updatedAt: "2026-07-11T14:30:00",
  },
  {
    id: "tpl-3",
    channel: "sms",
    name: "otp_login",
    category: "OTP",
    language: "English (US)",
    subject: "",
    body: "Hello {{1}}, your login OTP is {{2}}. Do not share it with anyone.",
    status: "Active",
    updatedAt: "2026-07-10T11:00:00",
  },
  {
    id: "tpl-4",
    channel: "email",
    name: "welcome_email",
    category: "Marketing",
    language: "English (US)",
    subject: "Welcome to Acme Corp",
    body: "Hello {{1}},\n\nWelcome to Acme Corp! Your unique code is: {{2}}.\n\nWe appreciate what you rate in {{3}}.",
    status: "Active",
    updatedAt: "2026-07-09T16:45:00",
  },
];

const getInitialForm = (channel = "whatsapp") => ({
  name: "",
  category: "Marketing",
  language: "English (US)",
  subject: "",
  body: "",
  channel,
});

const loadTemplates = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
};

const channelTitle = (channel) => {
  if (channel === "sms") return "Text SMS";
  if (channel === "email") return "Email";
  return "WhatsApp";
};

const SmsPage = () => {
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const firmName =
    (selectedFirmId !== "all"
      ? firms?.find((f) => String(f.firm_id) === String(selectedFirmId))?.firm_name
      : firms?.[0]?.firm_name) || "Acme Corp";

  const [activeChannel, setActiveChannel] = useState("whatsapp");
  const [templates, setTemplates] = useState(loadTemplates);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialForm("whatsapp"));
  const [openSelect, setOpenSelect] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates
      .filter((t) => t.channel === activeChannel)
      .filter((t) => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          (t.subject || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf());
  }, [templates, activeChannel, search]);

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    setEditingId(null);
    setFormData(getInitialForm(channel));
    setSearch("");
  };

  const handleNewTemplate = () => {
    setEditingId(null);
    setFormData(getInitialForm(activeChannel));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBodyChange = (html) => {
    setFormData((prev) => ({ ...prev, body: html }));
  };

  const handleDiscard = () => {
    if (editingId) {
      const existing = templates.find((t) => t.id === editingId);
      if (existing) {
        setFormData({
          name: existing.name,
          category: existing.category,
          language: existing.language,
          subject: existing.subject || "",
          body: existing.body,
          channel: existing.channel,
        });
        return;
      }
    }
    setFormData(getInitialForm(activeChannel));
    setEditingId(null);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setActiveChannel(row.channel);
    setFormData({
      name: row.name,
      category: row.category,
      language: row.language,
      subject: row.subject || "",
      body: row.body,
      channel: row.channel,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (row) => {
    setTemplates((prev) => prev.filter((t) => t.id !== row.id));
    if (editingId === row.id) {
      setEditingId(null);
      setFormData(getInitialForm(activeChannel));
    }
    toast.success("Template deleted");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = formData.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) {
      toast.error("Template name is required");
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

    const duplicate = templates.some(
      (t) =>
        t.channel === activeChannel &&
        t.name === name &&
        t.id !== editingId
    );
    if (duplicate) {
      toast.error("A template with this name already exists");
      return;
    }

    const payload = {
      id: editingId || `tpl-${Date.now()}`,
      channel: activeChannel,
      name,
      category: formData.category,
      language: formData.language,
      subject: activeChannel === "email" ? formData.subject.trim() : "",
      body: formData.body,
      status: "Active",
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => {
      if (editingId) {
        return prev.map((t) => (t.id === editingId ? payload : t));
      }
      return [payload, ...prev];
    });

    toast.success(editingId ? "Template updated" : "Template saved");
    setEditingId(null);
    setFormData(getInitialForm(activeChannel));
  };

  const searchPlaceholder = `Search ${channelTitle(activeChannel)} templates...`;

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
    <div className="sms-page">
      <div className="sms-tabs" role="tablist">
        {CHANNELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeChannel === id}
            className={`sms-tab ${activeChannel === id ? "active" : ""}`}
            onClick={() => handleChannelChange(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="sms-editor-row">
        <div className="sms-form-card">
          <h4>Create/Edit {channelTitle(activeChannel)} Template</h4>
          <form noValidate onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Template Name (lowercase)</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. welcome_message_v2"
                  value={formData.name}
                  onChange={handleChange}
                />
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
                    placeholder="Email subject"
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
                {activeChannel === "sms" && (
                  <div className="sms-char-count">
                    {stripHtml(formData.body).length} / 160 characters
                    {stripHtml(formData.body).length > 160
                      ? ` · ${Math.ceil(stripHtml(formData.body).length / 160)} SMS parts`
                      : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="sms-form-actions">
              <button type="button" className="btn btn-sms-discard" onClick={handleDiscard}>
                Discard Changes
              </button>
              <button type="submit" className="btn btn-sms-save">
                Save Template
              </button>
            </div>
          </form>
        </div>

        <div className="sms-preview-wrap">
          <TemplatePreview
            channel={activeChannel}
            body={formData.body}
            subject={formData.subject}
            firmName={firmName}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0 border-md-1 border-secondary">
        <List
          data={filteredTemplates}
          columns={columns}
          title={`Saved ${channelTitle(activeChannel)} Templates`}
          onDelete={handleDelete}
          hasDelete={true}
          hasEdit={true}
          onEdit={handleEdit}
          showFooter={false}
          deleteConfirmMessage={(row) =>
            `Are you sure you want to delete template "${row?.name}"?`
          }
        />
      </div>
    </div>
  );
};

export default SmsPage;
