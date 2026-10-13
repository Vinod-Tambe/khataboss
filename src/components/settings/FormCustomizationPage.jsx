import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import {
  FiEdit3,
  FiEye,
  FiList,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import List from "../common/List";
import { getFormTemplates, updateFormTemplate } from "../../api/formTemplateApi";
import { getFirms } from "../../api/firmApi";
import Form8BuilderWorkspace from "./formTemplate/Form8BuilderWorkspace";
import {
  normalizeFormConfig,
  prepareFormTemplateConfigForSave,
  syncForm8LogoBlocks,
} from "../../utils/formTemplate/formTemplateConfig";
import {
  clampForm8BlockLayoutHorizontal,
  isForm8FreeCanvasLayout,
} from "../../utils/formTemplate/form8CanvasLayout";
import {
  openFormTemplatePdfPreview,
  downloadFormTemplatePdf,
} from "../../utils/formTemplate/buildFormTemplatePdf";
import { buildPreviewFormTemplatePdfOptions } from "../../utils/formTemplate/buildFormTemplatePdfOptions";
import {
  ensureLogoBandOnAdd,
  getAddBlockPatches,
  getRemoveBlockPatches,
  insertBlockInOrder,
  isForm8BlockOnCanvas,
} from "../../utils/formTemplate/form8BuilderPalette";
import { sectionBlockId } from "../../utils/formTemplate/form8BuilderCatalog";
import {
  canRemoveForm8Block,
  canToggleForm8BlockOnCanvas,
  FORM8_DEFAULT_BLOCK_ORDER,
  getForm8BlockOrder,
  normalizeBuilderBlockOrder,
} from "../../utils/formTemplate/form8BuilderBlocks";
import {
  createEmptyForm8DividerLayout,
  createNextForm8DividerBlockId,
  isForm8DividerBlockId,
  isForm8DividerPaletteId,
} from "../../utils/formTemplate/form8DividerBlocks";
import "../../css/FormCustomization.css";

const FormCustomizationPage = () => {
  const [templates, setTemplates] = useState([]);
  const [firmsById, setFirmsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFirmId, setEditingFirmId] = useState(null);
  const [editingFirmName, setEditingFirmName] = useState("");
  const [formConfig, setFormConfig] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [status, setStatus] = useState("Active");
  const [mobileMode, setMobileMode] = useState("list");

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

  const loadFirms = useCallback(async () => {
    try {
      const res = await getFirms();
      const map = {};
      (Array.isArray(res?.data) ? res.data : []).forEach((firm) => {
        if (firm?.firm_id != null) map[firm.firm_id] = firm;
      });
      setFirmsById(map);
    } catch {
      setFirmsById({});
    }
  }, []);

  useEffect(() => {
    loadFirms();
  }, [loadFirms]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const parseTemplateConfig = (raw) => {
    if (raw == null) return {};
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    return typeof raw === "object" ? raw : {};
  };

  const handleEdit = (row) => {
    const id = row.uuid || row.id;
    if (!id) {
      toast.error("This template cannot be opened. Refresh the list and try again.");
      return;
    }
    const nextConfig = normalizeFormConfig(parseTemplateConfig(row.config));
    const nextStatus = row.status || "Active";
    setEditingId(id);
    setEditingFirmId(row.firmId ?? null);
    setEditingFirmName(row.firmName || "");
    setFormConfig(nextConfig);
    setSavedSnapshot({ config: nextConfig, status: nextStatus });
    setStatus(nextStatus);
    setMobileMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiscard = () => {
    if (savedSnapshot?.config) {
      setFormConfig(savedSnapshot.config);
      setStatus(savedSnapshot.status || "Active");
      setMobileMode("edit");
      toast.success("Unsaved changes discarded");
      return;
    }
    handleBackToList();
  };

  const handleBackToList = () => {
    setEditingId(null);
    setEditingFirmId(null);
    setEditingFirmName("");
    setFormConfig(null);
    setSavedSnapshot(null);
    setStatus("Active");
    setMobileMode("list");
  };

  const updateConfig = (key, value) => {
    setFormConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateTheme = (key, value) => {
    setFormConfig((prev) => {
      const patch =
        key && typeof key === "object" && !Array.isArray(key)
          ? key
          : { [key]: value };
      return {
        ...prev,
        theme: { ...(prev.theme || {}), ...patch },
      };
    });
  };

  const updateLayout = (key, checked) => {
    setFormConfig((prev) => {
      const next = {
        ...prev,
        layout: { ...(prev.layout || {}), [key]: checked },
      };
      if (key === "showRightLogo" && checked) {
        return syncForm8LogoBlocks(next);
      }
      return next;
    });
  };

  const updateSection = (sectionId, patch) => {
    setFormConfig((prev) => {
      const blockId = sectionBlockId(sectionId);
      const sections = (prev.sections || []).map((s) =>
        s.id === sectionId ? { ...s, ...patch } : s
      );
      let builderBlockOrder = prev.builderBlockOrder?.length
        ? normalizeBuilderBlockOrder(prev.builderBlockOrder)
        : normalizeBuilderBlockOrder(FORM8_DEFAULT_BLOCK_ORDER);

      if (patch.enabled === true && !builderBlockOrder.includes(blockId)) {
        builderBlockOrder = insertBlockInOrder(builderBlockOrder, blockId, null);
      }
      if (patch.enabled === false && builderBlockOrder.includes(blockId)) {
        builderBlockOrder = builderBlockOrder.filter((id) => id !== blockId);
      }

      let next = { ...prev, sections, builderBlockOrder };
      if (patch.enabled === true) {
        next = { ...next, ...getAddBlockPatches(prev, blockId) };
      }
      if (patch.enabled === false) {
        next = { ...next, ...getRemoveBlockPatches(next, blockId) };
      }
      return next;
    });
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

  const reorderBuilderBlocks = (blockIds) => {
    setFormConfig((prev) => ({
      ...prev,
      builderBlockOrder: normalizeBuilderBlockOrder(blockIds),
    }));
  };

  const currentBlockOrder = (prev) =>
    prev.builderBlockOrder?.length
      ? normalizeBuilderBlockOrder(prev.builderBlockOrder)
      : getForm8BlockOrder(prev);

  const addBlockFromPalette = (blockId, insertBeforeBlockId = null) => {
    if (isForm8DividerPaletteId(blockId)) {
      let addedId = null;
      setFormConfig((prev) => {
        addedId = createNextForm8DividerBlockId(currentBlockOrder(prev));
        const order = insertBlockInOrder(currentBlockOrder(prev), addedId, insertBeforeBlockId);
        return {
          ...prev,
          builderBlockOrder: order,
          blockLayouts: {
            ...(prev.blockLayouts || {}),
            [addedId]: createEmptyForm8DividerLayout(),
          },
        };
      });
      return addedId;
    }
    setFormConfig((prev) => {
      const baseOrder = currentBlockOrder(prev);
      let order = insertBlockInOrder(baseOrder, blockId, insertBeforeBlockId);
      order = ensureLogoBandOnAdd(order, blockId);
      const patches = getAddBlockPatches(prev, blockId);
      return { ...prev, ...patches, builderBlockOrder: order };
    });
    return blockId;
  };

  const removeBlockFromCanvas = (blockId) => {
    if (!canRemoveForm8Block(blockId)) return;
    setFormConfig((prev) => {
      const patches = getRemoveBlockPatches(prev, blockId);
      const baseOrder = currentBlockOrder(prev);
      const order = baseOrder.filter((id) => id !== blockId);
      const next = { ...prev, ...patches, builderBlockOrder: order };
      if (isForm8DividerBlockId(blockId) && next.blockLayouts?.[blockId]) {
        const blockLayouts = { ...next.blockLayouts };
        delete blockLayouts[blockId];
        next.blockLayouts = blockLayouts;
      }
      return next;
    });
  };

  const toggleBlockOnCanvas = (blockId) => {
    if (isForm8DividerPaletteId(blockId)) {
      return addBlockFromPalette(blockId);
    }
    if (!canToggleForm8BlockOnCanvas(blockId)) return blockId;
    if (isForm8BlockOnCanvas(formConfig, blockId)) {
      removeBlockFromCanvas(blockId);
      return blockId;
    }
    return addBlockFromPalette(blockId);
  };

  const updateBlockLayout = (blockId, patch) => {
    if (isForm8DividerPaletteId(blockId)) return;
    setFormConfig((prev) => {
      const merged = { ...(prev.blockLayouts?.[blockId] || {}), ...patch };
      const layout =
        prev.singlePageLayout && isForm8FreeCanvasLayout(prev)
          ? clampForm8BlockLayoutHorizontal(blockId, merged)
          : merged;
      return {
        ...prev,
        blockLayouts: {
          ...(prev.blockLayouts || {}),
          [blockId]: layout,
        },
      };
    });
  };

  const updateFormAsset = (key, value) => {
    setFormConfig((prev) => ({
      ...prev,
      assets: { ...(prev.assets || {}), [key]: value || "" },
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
      const payload = await prepareFormTemplateConfigForSave(formConfig);
      await updateFormTemplate(editingId, { config: payload, status });
      toast.success("Form template updated");
      setFormConfig(payload);
      setSavedSnapshot({ config: payload, status });
      setMobileMode("edit");
      await loadTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const editingFirm = editingFirmId != null ? firmsById[editingFirmId] : null;

  const handlePdfPreview = async () => {
    if (!formConfig) return;
    try {
      const pdfOptions = await buildPreviewFormTemplatePdfOptions({
        firm: editingFirm,
        config: normalizeFormConfig(formConfig),
      });
      openFormTemplatePdfPreview(normalizeFormConfig(formConfig), editingFirmName, pdfOptions);
    } catch (err) {
      toast.error(err.message || "Could not open PDF preview");
    }
  };

  const handlePdfDownload = async () => {
    if (!formConfig) return;
    try {
      const pdfOptions = await buildPreviewFormTemplatePdfOptions({
        firm: editingFirm,
        config: normalizeFormConfig(formConfig),
      });
      downloadFormTemplatePdf(normalizeFormConfig(formConfig), editingFirmName, pdfOptions);
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

  const showBuilder = Boolean(editingId && formConfig);

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

  return (
    <div
      className={`form-custom-page mobile-mode-${mobileMode}${
        showBuilder ? " form-custom-page--editing" : ""
      }`}
    >
      <div className="form-custom-page-header">
        <div>
          <h2 className="form-custom-page-title">Form Customization</h2>
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
          onClick={() => {
            if (showBuilder) return;
            setMobileMode("list");
          }}
          disabled={showBuilder}>
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

      {showBuilder ? (
        <div className="form-custom-workspace">
          <Form8BuilderWorkspace
            firmName={editingFirmName}
            firm={editingFirm}
            formConfig={formConfig}
            status={status}
            saving={saving}
            onStatusChange={setStatus}
            onSave={() => handleSubmit({ preventDefault: () => {} })}
            onDiscard={handleDiscard}
            onBackToList={handleBackToList}
            onPdfPreview={handlePdfPreview}
            onPdfDownload={handlePdfDownload}
            updateConfig={updateConfig}
            updateTheme={updateTheme}
            updateLayout={updateLayout}
            updateSection={updateSection}
            updateSectionField={updateSectionField}
            reorderSections={reorderSections}
            reorderSectionFields={reorderSectionFields}
            updateSignatureLabel={updateSignatureLabel}
            reorderBuilderBlocks={reorderBuilderBlocks}
            addBlockFromPalette={addBlockFromPalette}
            removeBlockFromCanvas={removeBlockFromCanvas}
            toggleBlockOnCanvas={toggleBlockOnCanvas}
            updateBlockLayout={updateBlockLayout}
            updateFormAsset={updateFormAsset}
          />
        </div>
      ) : null}

      {!showBuilder ? (
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
      ) : null}
    </div>
  );
};

export default FormCustomizationPage;
