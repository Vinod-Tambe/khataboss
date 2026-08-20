import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiEye,
  FiFileText,
  FiList,
  FiSave,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import List from "../common/List";
import { getFormTemplates, updateFormTemplate } from "../../api/formTemplateApi";
import FormTemplatePreview from "./formTemplate/FormTemplatePreview";
import DraggableList from "./formTemplate/DraggableList";
import {
  normalizeFormConfig,
  getSortedSections,
  getSortedFields,
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
} from "../../utils/formTemplate/formTemplateConfig";
import {
  openFormTemplatePdfPreview,
  downloadFormTemplatePdf,
} from "../../utils/formTemplate/buildFormTemplatePdf";
import "../../css/FormCustomization.css";

const EDITOR_TABS = [
  { id: "general", label: "General" },
  { id: "colors", label: "Colors & Theme" },
  { id: "sections", label: "Sections & Order" },
  { id: "content", label: "Content" },
];

const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const PAGE_SIZES = [
  { value: "A4", label: "A4" },
  { value: "A5", label: "A5" },
  { value: "Letter", label: "Letter" },
];

const ORIENTATIONS = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const LAYOUT_FIELDS = [
  { key: "showLeftLogo", label: "Show left logo" },
  { key: "showRightLogo", label: "Show right logo" },
  { key: "showOwnerSign", label: "Show owner signature" },
  { key: "showQrCode", label: "Show QR code" },
  { key: "useFirmFormHeader", label: "Use firm form header" },
  { key: "useFirmFormFooter", label: "Use firm form footer" },
];

const FormCustomizationPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFirmName, setEditingFirmName] = useState("");
  const [formConfig, setFormConfig] = useState(null);
  const [status, setStatus] = useState("Active");
  const [mobileMode, setMobileMode] = useState("list");
  const [editorTab, setEditorTab] = useState("general");
  const [expandedSectionIds, setExpandedSectionIds] = useState(() => new Set());

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFormTemplates();
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load form templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleEdit = (row) => {
    setEditingId(row.uuid || row.id);
    setEditingFirmName(row.firmName || "");
    setFormConfig(normalizeFormConfig(row.config));
    setStatus(row.status || "Active");
    setEditorTab("general");
    setExpandedSectionIds(new Set());
    setMobileMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSectionExpanded = (sectionId) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleDiscard = () => {
    if (editingId) {
      const existing = templates.find((t) => (t.uuid || t.id) === editingId);
      if (existing) {
        setFormConfig(normalizeFormConfig(existing.config));
        setStatus(existing.status || "Active");
        return;
      }
    }
    setEditingId(null);
    setEditingFirmName("");
    setFormConfig(null);
    setStatus("Active");
    setExpandedSectionIds(new Set());
    setMobileMode("list");
  };

  const updateConfig = (key, value) => {
    setFormConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateTheme = (key, value) => {
    setFormConfig((prev) => ({
      ...prev,
      theme: { ...(prev.theme || {}), [key]: value },
    }));
  };

  const updateLayout = (key, checked) => {
    setFormConfig((prev) => ({
      ...prev,
      layout: { ...(prev.layout || {}), [key]: checked },
    }));
  };

  const updateSection = (sectionId, patch) => {
    setFormConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) =>
        s.id === sectionId ? { ...s, ...patch } : s
      ),
    }));
  };

  const updateSectionField = (sectionId, fieldId, patch) => {
    setFormConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          fields: (s.fields || []).map((f) =>
            f.id === fieldId ? { ...f, ...patch } : f
          ),
        };
      }),
    }));
  };

  const reorderSections = (nextSections) => {
    setFormConfig((prev) => ({ ...prev, sections: nextSections }));
  };

  const reorderSectionFields = (sectionId, nextFields) => {
    setFormConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) =>
        s.id === sectionId ? { ...s, fields: nextFields } : s
      ),
    }));
  };

  const updateSignatureLabel = (key, value) => {
    setFormConfig((prev) => ({
      ...prev,
      signatureLabels: { ...(prev.signatureLabels || {}), [key]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId || !formConfig) {
      toast.error("Select a firm template from the list to edit");
      return;
    }

    setSaving(true);
    try {
      const payload = normalizeFormConfig(formConfig);
      await updateFormTemplate(editingId, { config: payload, status });
      toast.success("Form template updated");
      setFormConfig(payload);
      setMobileMode("preview");
      await loadTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const handlePdfPreview = () => {
    if (!formConfig) return;
    try {
      openFormTemplatePdfPreview(normalizeFormConfig(formConfig), editingFirmName);
    } catch (err) {
      toast.error(err.message || "Could not open PDF preview");
    }
  };

  const handlePdfDownload = () => {
    if (!formConfig) return;
    try {
      downloadFormTemplatePdf(normalizeFormConfig(formConfig), editingFirmName);
    } catch (err) {
      toast.error(err.message || "Could not download PDF");
    }
  };

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((a, b) =>
        (a.firmName || "").localeCompare(b.firmName || "")
      ),
    [templates]
  );

  const sortedSections = useMemo(
    () => (formConfig ? getSortedSections(formConfig) : []),
    [formConfig]
  );

  const columns = [
    { title: "Firm Name", key: "firmName", orderable: true, searchable: true },
    { title: "Reg. No.", key: "firmRegNo", orderable: true, searchable: true },
    {
      title: "Form Title",
      key: "title",
      orderable: true,
      searchable: true,
      render: (_val, _type, row) => row?.config?.title || row?.title || "FORM 8",
    },
    {
      title: "Last Updated",
      key: "updatedAt",
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

  const renderGeneralTab = () => (
    <>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-title">Form Title</label>
        <input
          id="fc-title"
          type="text"
          className="form-control"
          value={formConfig.title || ""}
          onChange={(e) => updateConfig("title", e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-subtitle">Subtitle</label>
        <input
          id="fc-subtitle"
          type="text"
          className="form-control"
          value={formConfig.subtitle || ""}
          onChange={(e) => updateConfig("subtitle", e.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-status">Status</label>
        <select
          id="fc-status"
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-page-size">Page Size</label>
        <select
          id="fc-page-size"
          className="form-select"
          value={formConfig.pageSize || "A4"}
          onChange={(e) => updateConfig("pageSize", e.target.value)}
        >
          {PAGE_SIZES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-orientation">Orientation</label>
        <select
          id="fc-orientation"
          className="form-select"
          value={formConfig.orientation || "portrait"}
          onChange={(e) => updateConfig("orientation", e.target.value)}
        >
          {ORIENTATIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="fc-font">Font Size</label>
        <select
          id="fc-font"
          className="form-select"
          value={formConfig.fontSize || "medium"}
          onChange={(e) => updateConfig("fontSize", e.target.value)}
        >
          {FONT_SIZES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="col-12">
        <div className="form-custom-section-card">
          <h5>Layout & Branding</h5>
          <div className="form-custom-toggle-grid">
            {LAYOUT_FIELDS.map(({ key, label }) => (
              <label key={key} className="form-custom-toggle-item">
                <input
                  type="checkbox"
                  checked={Boolean(formConfig.layout?.[key])}
                  onChange={(e) => updateLayout(key, e.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
            <label className="form-custom-toggle-item">
              <input
                type="checkbox"
                checked={Boolean(formConfig.showPageNumbers)}
                onChange={(e) => updateConfig("showPageNumbers", e.target.checked)}
              />
              <span>Show page numbers</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );

  const renderColorsTab = () => (
    <div className="col-12">
      <div className="form-custom-section-card">
        <h5>Form Colors & Theme</h5>
        <p className="form-custom-form-hint mb-3">
          All colors are saved in the template and applied to the live preview and PDF.
        </p>
        <div className="form-custom-color-grid">
          {THEME_FIELDS.map(({ key, label }) => (
            <div key={key} className="form-custom-color-field">
              <label className="form-label" htmlFor={`theme-${key}`}>{label}</label>
              <div className="form-custom-color-input-row">
                <input
                  id={`theme-${key}`}
                  type="color"
                  value={formConfig.theme?.[key] || "#000000"}
                  onChange={(e) => updateTheme(key, e.target.value)}
                />
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formConfig.theme?.[key] || ""}
                  onChange={(e) => updateTheme(key, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSectionsTab = () => (
    <div className="col-12">
      <p className="form-custom-form-hint">
        Drag sections to reorder. Expand a section to edit fields and drag them into order.
        Set each field to Full (1 row), Half (2 per row), or Small (3 per row).
      </p>
      <DraggableList
        items={sortedSections}
        onReorder={reorderSections}
        itemKey="id"
        renderItem={(section) => {
          const isExpanded = expandedSectionIds.has(section.id);
          const fields = getSortedFields(section);
          const enabledFieldCount = fields.filter((field) => field.enabled).length;

          return (
            <div
              className={`form-custom-section-editor ${isExpanded ? "is-expanded" : "is-collapsed"}`}
            >
              <div className="form-custom-section-toolbar">
                <button
                  type="button"
                  className="form-custom-section-collapse-toggle"
                  onClick={() => toggleSectionExpanded(section.id)}
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? `Collapse ${section.label || "section"}`
                      : `Expand ${section.label || "section"} to edit`
                  }
                >
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {!isExpanded ? (
                  <button
                    type="button"
                    className="form-custom-section-collapse-summary"
                    onClick={() => toggleSectionExpanded(section.id)}
                  >
                    <span className="form-custom-section-collapse-title">
                      {section.label || "Untitled section"}
                    </span>
                    <span className="form-custom-section-collapse-meta">
                      <span
                        className={`form-custom-section-status ${section.enabled ? "is-enabled" : "is-disabled"}`}
                      >
                        {section.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <span className="form-custom-section-field-count">
                        {enabledFieldCount}/{fields.length} fields
                      </span>
                    </span>
                  </button>
                ) : (
                  <span className="form-custom-section-expanded-label">
                    {section.label || "Untitled section"}
                  </span>
                )}
              </div>

              {isExpanded ? (
                <div className="form-custom-section-body">
                  <div className="form-custom-section-head">
                    <label className="form-custom-toggle-item mb-0">
                      <input
                        type="checkbox"
                        checked={Boolean(section.enabled)}
                        onChange={(e) =>
                          updateSection(section.id, { enabled: e.target.checked })
                        }
                      />
                      <span>Enabled</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm form-custom-section-label-input"
                      value={section.label || ""}
                      onChange={(e) =>
                        updateSection(section.id, { label: e.target.value })
                      }
                      placeholder="Section title"
                    />
                    <div className="form-custom-section-bg">
                      <label
                        className="form-label visually-hidden"
                        htmlFor={`sec-bg-${section.id}`}
                      >
                        Section background
                      </label>
                      <input
                        id={`sec-bg-${section.id}`}
                        type="color"
                        title="Section background color"
                        value={section.backgroundColor || "#ffffff"}
                        onChange={(e) =>
                          updateSection(section.id, { backgroundColor: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DraggableList
                    items={fields}
                    onReorder={(nextFields) => reorderSectionFields(section.id, nextFields)}
                    itemKey="id"
                    renderItem={(field) => (
                      <div className="form-custom-field-editor">
                        <div className="form-custom-field-row">
                          <label className="form-custom-toggle-item">
                            <input
                              type="checkbox"
                              checked={Boolean(field.enabled)}
                              onChange={(e) =>
                                updateSectionField(section.id, field.id, {
                                  enabled: e.target.checked,
                                })
                              }
                            />
                            <span className="visually-hidden">Enable {field.label}</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={field.label || ""}
                            onChange={(e) =>
                              updateSectionField(section.id, field.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Field label"
                          />
                        </div>
                        <div className="form-custom-field-options">
                          <select
                            className="form-select form-select-sm"
                            value={field.fieldLayout || "half"}
                            onChange={(e) =>
                              updateSectionField(section.id, field.id, {
                                fieldLayout: e.target.value,
                              })
                            }
                            title="Field layout width"
                          >
                            {FIELD_LAYOUT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="color"
                            className="form-custom-field-bg-picker"
                            title="Field background color"
                            value={field.backgroundColor || "#ffffff"}
                            onChange={(e) =>
                              updateSectionField(section.id, field.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-link form-custom-clear-bg"
                            onClick={() =>
                              updateSectionField(section.id, field.id, {
                                backgroundColor: "",
                              })
                            }
                          >
                            Clear bg
                          </button>
                        </div>
                      </div>
                    )}
                  />
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );

  const renderContentTab = () => (
    <>
      <div className="col-12">
        <label className="form-label" htmlFor="fc-compliance">Act / Compliance Reference</label>
        <textarea
          id="fc-compliance"
          className="form-control"
          rows={2}
          value={formConfig.complianceReference || ""}
          onChange={(e) => updateConfig("complianceReference", e.target.value)}
          placeholder="Statutory act and form reference shown below the title"
        />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="fc-header-note">Header Note</label>
        <textarea
          id="fc-header-note"
          className="form-control"
          rows={2}
          value={formConfig.headerNote || ""}
          onChange={(e) => updateConfig("headerNote", e.target.value)}
        />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="fc-footer-note">Footer Note</label>
        <textarea
          id="fc-footer-note"
          className="form-control"
          rows={2}
          value={formConfig.footerNote || ""}
          onChange={(e) => updateConfig("footerNote", e.target.value)}
        />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="fc-terms">Terms & Conditions</label>
        <textarea
          id="fc-terms"
          className="form-control"
          rows={4}
          value={formConfig.termsAndConditions || ""}
          onChange={(e) => updateConfig("termsAndConditions", e.target.value)}
        />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="fc-declaration">Declaration Text</label>
        <textarea
          id="fc-declaration"
          className="form-control"
          rows={2}
          value={formConfig.declarationText || ""}
          onChange={(e) => updateConfig("declarationText", e.target.value)}
        />
      </div>
      <div className="col-12">
        <h5 className="mb-2">Signature Labels</h5>
        <div className="row g-2">
          {Object.entries(formConfig.signatureLabels || {}).map(([key, label]) => (
            <div className="col-12 col-md-4" key={key}>
              <label className="form-label text-capitalize" htmlFor={`sig-${key}`}>{key}</label>
              <input
                id={`sig-${key}`}
                type="text"
                className="form-control"
                value={label}
                onChange={(e) => updateSignatureLabel(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      {formConfig.variables?.length ? (
        <div className="col-12">
          <label className="form-label">Available Variables</label>
          <div className="form-custom-variables">
            {formConfig.variables.map((v) => (
              <span key={v.key} className="form-custom-variable-chip" title={v.label}>
                {v.key}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <div className={`form-custom-page mobile-mode-${mobileMode}`}>
      <div className="form-custom-page-header">
        <div>
          <h2 className="form-custom-page-title">Form Customization</h2>
          <p className="form-custom-page-subtitle">
            Default template follows government pledge-book format (Maharashtra &amp; TN Acts).
            Customize layout, colors, section order, and statutory wording per firm.
          </p>
        </div>
      </div>

      {!templates.length && !loading ? (
        <div className="alert alert-warning">
          Add at least one firm to manage form templates.
        </div>
      ) : null}

      <div className="form-custom-mobile-mode-tabs" role="tablist" aria-label="Mobile sections">
        <button type="button" role="tab" aria-selected={mobileMode === "list"}
          className={`form-custom-mobile-mode-tab ${mobileMode === "list" ? "active" : ""}`}
          onClick={() => setMobileMode("list")}>
          <FiList size={16} /><span>Firm List</span>
        </button>
        <button type="button" role="tab" aria-selected={mobileMode === "edit"}
          className={`form-custom-mobile-mode-tab ${mobileMode === "edit" ? "active" : ""}`}
          onClick={() => editingId && setMobileMode("edit")} disabled={!editingId}>
          <FiEdit3 size={16} /><span>Edit</span>
        </button>
        <button type="button" role="tab" aria-selected={mobileMode === "preview"}
          className={`form-custom-mobile-mode-tab ${mobileMode === "preview" ? "active" : ""}`}
          onClick={() => setMobileMode("preview")}>
          <FiEye size={16} /><span>Preview</span>
        </button>
      </div>

      <div className="form-custom-workspace">
        <div className="form-custom-workspace-body">
          {editingId && formConfig ? (
            <div className="form-custom-form-card">
              <div className="form-custom-form-card-head">
                <div>
                  <h4>
                    <FiFileText size={16} className="me-1" />
                    Edit Form — {editingFirmName}
                  </h4>
                </div>
                <span className="form-custom-edit-badge">Editing</span>
              </div>

              <div className="form-custom-editor-tabs" role="tablist">
                {EDITOR_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={editorTab === tab.id}
                    className={`form-custom-editor-tab ${editorTab === tab.id ? "active" : ""}`}
                    onClick={() => setEditorTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form noValidate onSubmit={handleSubmit}>
                <div className="row g-3">
                  {editorTab === "general" && renderGeneralTab()}
                  {editorTab === "colors" && renderColorsTab()}
                  {editorTab === "sections" && renderSectionsTab()}
                  {editorTab === "content" && renderContentTab()}
                </div>

                <div className="form-custom-form-actions">
                  <button type="button" className="btn btn-form-custom-discard" onClick={handleDiscard}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-form-custom-save" disabled={saving}>
                    <FiSave size={16} className="me-1" />
                    {saving ? "Saving…" : "Save Template"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="form-custom-form-card form-custom-form-empty">
              <FiFileText size={28} className="form-custom-form-empty-icon" />
              <h4>Select a firm template to customize</h4>
              <p className="form-custom-form-hint mb-0">
                Click edit on any firm below. Drag sections, set colors, and preview as A4 PDF.
              </p>
            </div>
          )}

          <aside className="form-custom-preview-panel">
            <div className="form-custom-preview-panel-head">
              <div>
                <h5>A4 PDF Preview</h5>
                <p>Sample loan test data · {editingFirmName || "select firm"}</p>
              </div>
              {formConfig ? (
                <div className="form-custom-preview-actions">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={handlePdfPreview}>
                    <FiExternalLink size={14} className="me-1" /> Open PDF
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handlePdfDownload}>
                    <FiDownload size={14} className="me-1" /> Download
                  </button>
                </div>
              ) : null}
            </div>
            <div className="form-custom-preview-wrap">
              <FormTemplatePreview
                config={formConfig ? normalizeFormConfig(formConfig) : null}
                firmName={editingFirmName}
                scale={0.55}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="form-custom-list-card card shadow-sm border-0 border-md-1 border-secondary">
        <List
          data={sortedTemplates}
          columns={columns}
          title={`Firm-wise Form Templates${loading ? " (loading…)" : ""}`}
          primaryKey="firmName"
          subtitleKey="updatedAt"
          hasDelete={false}
          hasEdit={true}
          onEdit={handleEdit}
          showFooter={false}
          showSearch={true}
        />
      </div>
    </div>
  );
};

export default FormCustomizationPage;
