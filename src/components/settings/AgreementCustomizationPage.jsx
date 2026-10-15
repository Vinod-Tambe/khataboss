import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { FiEdit3, FiEye, FiList } from "react-icons/fi";
import { toast } from "react-hot-toast";
import List from "../common/List";
import { getAgreementTemplates, updateAgreementTemplate } from "../../api/agreementTemplateApi";
import { getFirms } from "../../api/firmApi";
import AgreementBuilderWorkspace from "./agreementBuilder/AgreementBuilderWorkspace";
import {
  normalizeAgreementConfig,
  AGREEMENT_TYPES,
} from "../../utils/agreementBuilder/templateConfig";
import {
  prepareFormTemplateConfigForSave,
  syncForm8LogoBlocks,
} from "../../utils/formTemplate/formTemplateConfig";
import {
  clampForm8BlockLayoutHorizontal,
  isForm8FreeCanvasLayout,
} from "../../utils/formTemplate/formCanvasLayout";
import { buildFormTemplatePrintHtml } from "../../utils/formTemplate/buildFormTemplatePrintHtml";
import { openFormTemplateHtmlPdf as openFormTemplatePdfPreview } from "../../utils/formTemplate/renderFormTemplateHtmlPdf";
import { buildPreviewFormTemplatePdfOptions } from "../../utils/formTemplate/buildFormTemplatePdfOptions";
import {
  ensureLogoBandOnAdd,
  getAddBlockPatches,
  getRemoveBlockPatches,
  insertBlockInOrder,
  isAgreementBlockOnCanvas,
} from "../../utils/agreementBuilder/agreementPalette";
import { sectionBlockId } from "../../utils/formTemplate/formBuilderCatalog";
import { FORM_TEMPLATE_ASSET_KEYS } from "../../utils/formTemplate/formTemplateImageAssets";
import {
  canRemoveAgreementBlock,
  canToggleAgreementBlockOnCanvas,
  getAgreementBlockOrder,
  LOAN_AGREEMENT_BLOCK_ORDER,
  normalizeBuilderBlockOrder,
} from "../../utils/agreementBuilder/agreementBlocks";
import {
  createEmptyForm8DividerLayout,
  createNextForm8DividerBlockId,
  isForm8DividerBlockId,
  isForm8DividerPaletteId,
} from "../../utils/formTemplate/formDividerBlocks";
import {
  AGREEMENT_STOCK_BLOCK_ID,
  getAgreementLoanTypeLabel,
  isAgreementSecuredTemplate,
  normalizeAgreementLoanType,
} from "../../utils/agreementBuilder/loanType";
import {
  resolveActiveFirmFilterId,
  rowMatchesFirmFilter,
} from "../../store/slices/firmSlice";
import {
  getAgreementTestData,
  getAgreementTransactionRows,
} from "../../utils/agreementBuilder/testData";
import usePermissions from "../../hooks/usePermissions";
import {
  canAccessAgreementBuilder,
  canEditAgreementBuilder,
} from "../../utils/builderPermissions";
import "../../css/FormCustomization.css";

const agreementTypeLabel = (type) =>
  AGREEMENT_TYPES.find((t) => t.id === type)?.label || type || "Agreement";

const AgreementCustomizationPage = () => {
  const { can } = usePermissions();
  const canOpenBuilder = canAccessAgreementBuilder(can);
  const builderReadOnly = !canEditAgreementBuilder(can);

  const { selectedFirmId, firms: reduxFirms, selectedFirm } = useSelector(
    (state) => state.firm
  );
  const [templates, setTemplates] = useState([]);
  const [firmsById, setFirmsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preparingPdf, setPreparingPdf] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFirmId, setEditingFirmId] = useState(null);
  const [editingFirmName, setEditingFirmName] = useState("");
  const [editingAgreementType, setEditingAgreementType] = useState("Loan");
  const [editingLoanType, setEditingLoanType] = useState("secured");
  const [formConfig, setFormConfig] = useState(null);
  const [, setSavedSnapshot] = useState(null);
  const [status, setStatus] = useState("Active");
  const [mobileMode, setMobileMode] = useState("list");

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAgreementTemplates();
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load agreement templates");
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
        if (firm?.firm_id != null) map[String(firm.firm_id)] = firm;
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
    if (!reduxFirms?.length) return;
    setFirmsById((prev) => {
      const next = { ...prev };
      reduxFirms.forEach((firm) => {
        if (firm?.firm_id == null) return;
        const key = String(firm.firm_id);
        next[key] = { ...next[key], ...firm };
      });
      return next;
    });
  }, [reduxFirms]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!editingFirmId) return;
    if (!rowMatchesFirmFilter(editingFirmId, selectedFirmId)) {
      setEditingId(null);
      setEditingFirmId(null);
      setEditingFirmName("");
      setEditingAgreementType("Loan");
      setEditingLoanType("secured");
      setFormConfig(null);
      setSavedSnapshot(null);
      setStatus("Active");
      setMobileMode("list");
    }
  }, [selectedFirmId, editingFirmId]);

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
    if (!canOpenBuilder) {
      toast.error("You do not have permission to open Agreement Builder.");
      return;
    }
    const id = row.uuid || row.id;
    if (!id) {
      toast.error("This template cannot be opened. Refresh the list and try again.");
      return;
    }
    const agreementType = row.type === "Finance" ? "Finance" : "Loan";
    const loanType = normalizeAgreementLoanType(row.loanType || row.config?.loanType);
    const nextConfig = normalizeAgreementConfig(
      {
        ...parseTemplateConfig(row.config),
        loanType,
        agreementDocumentType: agreementType,
      },
      agreementType,
      loanType
    );
    const nextStatus = row.status || "Active";
    setEditingId(id);
    setEditingFirmId(row.firmId ?? null);
    setEditingFirmName(row.firmName || "");
    setEditingAgreementType(agreementType);
    setEditingLoanType(loanType);
    setFormConfig(nextConfig);
    setSavedSnapshot({ config: nextConfig, status: nextStatus });
    setStatus(nextStatus);
    setMobileMode("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setEditingId(null);
    setEditingFirmId(null);
    setEditingFirmName("");
    setEditingAgreementType("Loan");
    setEditingLoanType("secured");
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
        : normalizeBuilderBlockOrder(LOAN_AGREEMENT_BLOCK_ORDER);

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
      : getAgreementBlockOrder(prev);

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
      if (
        blockId === AGREEMENT_STOCK_BLOCK_ID &&
        (editingAgreementType === "Finance" || !isAgreementSecuredTemplate(prev))
      ) {
        return prev;
      }
      const baseOrder = currentBlockOrder(prev);
      let order = insertBlockInOrder(baseOrder, blockId, insertBeforeBlockId);
      order = ensureLogoBandOnAdd(order, blockId);
      const patches = getAddBlockPatches(prev, blockId);
      return { ...prev, ...patches, builderBlockOrder: order };
    });
    return blockId;
  };

  const removeBlockFromCanvas = (blockId) => {
    if (!canRemoveAgreementBlock(blockId)) return;
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
    if (!canToggleAgreementBlockOnCanvas(blockId)) return blockId;
    if (isAgreementBlockOnCanvas(formConfig, blockId)) {
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
    setFormConfig((prev) => {
      const next = {
        ...prev,
        assets: { ...(prev.assets || {}), [key]: value || "" },
      };
      if (key !== FORM_TEMPLATE_ASSET_KEYS.footerImage) return next;
      const hasImage = Boolean(String(value || "").trim());
      next.layout = { ...(prev.layout || {}), showFooterImage: hasImage };
      if (!hasImage) {
        next.builderBlockOrder = currentBlockOrder(prev).filter(
          (id) => id !== "layout_footer_image"
        );
        return next;
      }
      const order = currentBlockOrder(prev);
      if (!order.includes("layout_footer_image")) {
        next.builderBlockOrder = insertBlockInOrder(
          order,
          "layout_footer_image",
          order.includes("signature_lines") ? "signature_lines" : null
        );
      }
      return next;
    });
  };

  const persistTemplate = async () => {
    if (!editingId || !formConfig) {
      throw new Error("Select a firm template from the list to edit");
    }
    const payload = await prepareFormTemplateConfigForSave({
      ...formConfig,
      loanType: editingLoanType,
      agreementDocumentType: editingAgreementType,
    });
    const html = buildFormTemplatePrintHtml(payload, {
      firmName: editingFirmName,
    });
    const res = await updateAgreementTemplate(editingId, { config: payload, html, status });
    setFormConfig(payload);
    setSavedSnapshot({ config: payload, status });
    return {
      config: payload,
      html: res?.data?.html || html,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditAgreementBuilder(can)) {
      toast.error("You do not have permission to save agreement templates.");
      return;
    }
    if (!editingId || !formConfig) {
      toast.error("Select a firm template from the list to edit");
      return;
    }

    setSaving(true);
    try {
      await persistTemplate();
      toast.success("Agreement template updated");
      setMobileMode("edit");
      await loadTemplates();
    } catch (err) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const editingFirm =
    editingFirmId != null ? firmsById[String(editingFirmId)] : null;

  const previewFormData = useMemo(
    () => getAgreementTestData(editingAgreementType, editingFirmName),
    [editingAgreementType, editingFirmName]
  );

  const previewTransactionRows = useMemo(
    () => getAgreementTransactionRows(editingAgreementType),
    [editingAgreementType]
  );

  const handlePdfPreview = async () => {
    if (!formConfig) return;
    setSaving(true);
    setPreparingPdf(true);
    const toastId = toast.loading("Preparing PDF…");
    try {
      const saved = await persistTemplate();
      const pdfOptions = await buildPreviewFormTemplatePdfOptions({
        firm: editingFirm,
        config: saved.config,
        formData: previewFormData,
        transactionRows: previewTransactionRows,
      });
      await openFormTemplatePdfPreview(saved.html, saved.config, {
        ...pdfOptions,
        displayFirmName: editingFirmName,
      });
      toast.success("PDF ready", { id: toastId });
      await loadTemplates();
    } catch (err) {
      toast.error(err.message || "Could not open PDF preview", { id: toastId });
    } finally {
      setPreparingPdf(false);
      setSaving(false);
    }
  };

  const sortedTemplates = useMemo(
    () =>
      [...templates]
        .filter((row) => rowMatchesFirmFilter(row?.firmId, selectedFirmId))
        .sort((a, b) => {
          const firmCmp = (a.firmName || "").localeCompare(b.firmName || "");
          if (firmCmp !== 0) return firmCmp;
          const typeCmp = (a.type || "").localeCompare(b.type || "");
          if (typeCmp !== 0) return typeCmp;
          return normalizeAgreementLoanType(a.loanType).localeCompare(
            normalizeAgreementLoanType(b.loanType)
          );
        }),
    [templates, selectedFirmId]
  );

  const listTitleSuffix = useMemo(() => {
    const filterId = resolveActiveFirmFilterId(selectedFirmId);
    if (!filterId) return "";
    const name =
      selectedFirm?.firm_name ||
      sortedTemplates[0]?.firmName ||
      "selected firm";
    return ` — ${name}`;
  }, [selectedFirmId, selectedFirm, sortedTemplates]);

  const showBuilder = Boolean(editingId && formConfig);

  const columns = [
    { title: "Firm Name", key: "firmName", orderable: true, searchable: true },
    { title: "Reg. No.", key: "firmRegNo", orderable: true, searchable: true },
    {
      title: "Agreement",
      key: "type",
      orderable: true,
      searchable: true,
      render: (_val, _type, row) => {
        const t = row?.type === "Finance" ? "Finance" : "Loan";
        const cls =
          t === "Finance"
            ? "bg-info-subtle text-info-emphasis"
            : "bg-secondary-subtle text-secondary-emphasis";
        return `<span class="badge ${cls}">${agreementTypeLabel(t)}</span>`;
      },
    },
    {
      title: "Loan Type",
      key: "loanType",
      orderable: true,
      searchable: true,
      render: (_val, _type, row) => {
        if (row?.type === "Finance") return "—";
        const type = normalizeAgreementLoanType(row?.loanType);
        const label = getAgreementLoanTypeLabel(type);
        const cls =
          type === "secured"
            ? "bg-primary-subtle text-primary"
            : "bg-warning-subtle text-warning-emphasis";
        return `<span class="badge ${cls}">${label}</span>`;
      },
    },
    {
      title: "Title",
      key: "title",
      orderable: true,
      searchable: true,
      render: (_val, _type, row) => row?.config?.title || row?.title || "Agreement",
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
          <h2 className="form-custom-page-title">Agreement Builder</h2>
        </div>
      </div>

      {!sortedTemplates.length && !loading ? (
        <div className="alert alert-warning">
          {resolveActiveFirmFilterId(selectedFirmId)
            ? "No agreement templates for the firm selected in the header. Choose another firm or switch to All Firm."
            : "Add at least one firm to manage agreement templates."}
        </div>
      ) : null}

      <div className="form-custom-mobile-mode-tabs" role="tablist" aria-label="Mobile sections">
        <button
          type="button"
          role="tab"
          aria-selected={mobileMode === "list"}
          className={`form-custom-mobile-mode-tab ${mobileMode === "list" ? "active" : ""}`}
          onClick={() => {
            if (showBuilder) return;
            setMobileMode("list");
          }}
          disabled={showBuilder}
        >
          <FiList size={16} />
          <span>Firm List</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileMode === "edit"}
          className={`form-custom-mobile-mode-tab ${mobileMode === "edit" ? "active" : ""}`}
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
          className={`form-custom-mobile-mode-tab ${mobileMode === "preview" ? "active" : ""}`}
          onClick={() => setMobileMode("preview")}
        >
          <FiEye size={16} />
          <span>Preview</span>
        </button>
      </div>

      {showBuilder ? (
        <div className="form-custom-workspace">
          <AgreementBuilderWorkspace
            agreementType={editingAgreementType}
            firmName={editingFirmName}
            loanType={editingLoanType}
            firm={editingFirm}
            formConfig={formConfig}
            status={status}
            saving={saving}
            preparingPdf={preparingPdf}
            onStatusChange={setStatus}
            onSave={() => handleSubmit({ preventDefault: () => {} })}
            onBackToList={handleBackToList}
            onPdfPreview={handlePdfPreview}
            updateConfig={updateConfig}
            updateTheme={updateTheme}
            updateLayout={updateLayout}
            updateSection={updateSection}
            updateSectionField={updateSectionField}
            reorderSectionFields={reorderSectionFields}
            updateSignatureLabel={updateSignatureLabel}
            reorderBuilderBlocks={reorderBuilderBlocks}
            addBlockFromPalette={addBlockFromPalette}
            removeBlockFromCanvas={removeBlockFromCanvas}
            toggleBlockOnCanvas={toggleBlockOnCanvas}
            updateBlockLayout={updateBlockLayout}
            updateFormAsset={updateFormAsset}
            previewFormData={previewFormData}
            previewTransactionRows={previewTransactionRows}
            readOnly={builderReadOnly}
          />
        </div>
      ) : null}

      {!showBuilder ? (
        <div className="form-custom-list-card card shadow-sm border-0 border-md-1 border-secondary">
          <List
            data={sortedTemplates}
            columns={columns}
            title={`Agreement Template List${listTitleSuffix}${loading ? " (loading…)" : ""}`}
            primaryKey="uuid"
            subtitleKey="updatedAt"
            hasDelete={false}
            hasEdit={canOpenBuilder}
            onEdit={handleEdit}
            showFooter={false}
            showSearch={true}
            applyDefaultDateFilter={false}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AgreementCustomizationPage;
