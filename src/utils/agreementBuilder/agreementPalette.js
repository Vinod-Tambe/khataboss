import {
  AGREEMENT_BLOCK_META,
  getAgreementBlockOrder,
  getAgreementDefaultBlockOrder,
  isAgreementBlockEnabled,
  isAgreementRequiredBlock,
  normalizeBuilderBlockOrder,
} from './agreementBlocks';
import {
  FORM8_OPTIONAL_SECTION_IDS,
  FORM8_SPECIAL_BLOCKS,
  isForm8PaletteBlockHidden,
  parseSectionBlockId,
  sectionBlockId,
} from '../formTemplate/formBuilderCatalog';
import {
  getForm8DividerLabel,
  isForm8DividerInstanceId,
  isForm8DividerPaletteId,
  listForm8DividerBlockIds,
} from '../formTemplate/formDividerBlocks';
import { AGREEMENT_STOCK_BLOCK_ID, isAgreementSecuredTemplate } from './loanType';
import { isFinanceAgreementConfig } from './financeCanvas';

export const AGREEMENT_PALETTE_DRAG_MIME = 'application/x-agreement-palette-block';
export const AGREEMENT_CANVAS_BLOCK_DRAG_MIME = 'application/x-agreement-block-id';

export const isAgreementBlockOnCanvas = (config, blockId) => {
  const order = config?.builderBlockOrder || [];
  if (!order.includes(blockId)) return false;
  return isAgreementBlockEnabled(config, blockId);
};

const blockCategory = (blockId, sectionId) => {
  if (sectionId && FORM8_OPTIONAL_SECTION_IDS.has(sectionId)) return 'optional';
  const special = FORM8_SPECIAL_BLOCKS.find((b) => b.id === blockId);
  if (special?.category === 'optional') return 'optional';
  if (!isAgreementRequiredBlock(blockId)) return 'optional';
  return 'required';
};

const blockLabel = (blockId, sections, order = []) => {
  if (isForm8DividerInstanceId(blockId) && !isForm8DividerPaletteId(blockId)) {
    return getForm8DividerLabel(blockId, order);
  }
  if (isForm8DividerPaletteId(blockId)) {
    return AGREEMENT_BLOCK_META.form_divider?.label || 'Divider';
  }
  if (AGREEMENT_BLOCK_META[blockId]?.label) {
    return AGREEMENT_BLOCK_META[blockId].label;
  }
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = sections.find((s) => s.id === sectionId);
    return section?.label || blockId;
  }
  const special = FORM8_SPECIAL_BLOCKS.find((b) => b.id === blockId);
  return special?.label || blockId;
};

export const buildAgreementPaletteCatalog = (config, sections = []) => {
  const sectionIds = new Set(sections.map((s) => sectionBlockId(s.id)));
  const ids = new Set();
  const seedOrder = getAgreementDefaultBlockOrder(config);

  seedOrder.forEach((id) => ids.add(id));
  (config?.builderBlockOrder || []).forEach((id) => ids.add(id));
  FORM8_SPECIAL_BLOCKS.forEach((b) => ids.add(b.id));
  sections.forEach((s) => ids.add(sectionBlockId(s.id)));

  const items = [];
  const order = config?.builderBlockOrder || [];

  ids.forEach((blockId) => {
    if (blockId === 'layout_logo') return;
    if (
      isFinanceAgreementConfig(config) &&
      (blockId === AGREEMENT_STOCK_BLOCK_ID || blockId === 'section:loan_details')
    ) {
      return;
    }
    if (blockId === AGREEMENT_STOCK_BLOCK_ID && !isAgreementSecuredTemplate(config)) return;
    if (isForm8PaletteBlockHidden(blockId)) return;
    if (isForm8DividerInstanceId(blockId) && !isForm8DividerPaletteId(blockId)) return;
    const sectionId = parseSectionBlockId(blockId);
    if (sectionId && !sectionIds.has(blockId)) return;
    if (!AGREEMENT_BLOCK_META[blockId] && !sectionId) {
      if (!FORM8_SPECIAL_BLOCKS.some((b) => b.id === blockId)) return;
    }

    const category = blockCategory(blockId, sectionId);
    const repeatable = isForm8DividerPaletteId(blockId);
    const onCanvas = repeatable ? false : isAgreementBlockOnCanvas(config, blockId);
    const inOrder = order.includes(blockId);

    items.push({
      id: blockId,
      label: blockLabel(blockId, sections, order),
      category,
      onCanvas,
      inOrder,
      repeatable,
      placed: repeatable ? false : onCanvas || (inOrder && isAgreementRequiredBlock(blockId)),
    });
  });

  listForm8DividerBlockIds(order).forEach((blockId) => {
    items.push({
      id: blockId,
      label: getForm8DividerLabel(blockId, order),
      category: 'optional',
      onCanvas: true,
      inOrder: true,
      repeatable: false,
      placed: true,
    });
  });

  const sortKey = (id) => {
    if (isForm8DividerPaletteId(id)) {
      const stock = seedOrder.indexOf(AGREEMENT_STOCK_BLOCK_ID);
      return (stock >= 0 ? stock : 8) + 0.4;
    }
    if (isForm8DividerInstanceId(id)) {
      const stock = seedOrder.indexOf(AGREEMENT_STOCK_BLOCK_ID);
      const n = Number(String(id).split(':')[1] || 1);
      return (stock >= 0 ? stock : 8) + 0.5 + n / 100;
    }
    if (id === 'layout_footer_image') {
      const signatures = seedOrder.indexOf('signature_lines');
      return (signatures >= 0 ? signatures : 10) - 0.1;
    }
    const idx = seedOrder.indexOf(id);
    return idx >= 0 ? idx : 999;
  };

  items.sort((a, b) => {
    const orderDiff = sortKey(a.id) - sortKey(b.id);
    if (orderDiff !== 0) return orderDiff;
    return String(a.label).localeCompare(String(b.label));
  });

  return { items };
};

export const insertBlockInOrder = (order, blockId, insertBeforeBlockId = null) => {
  const next = normalizeBuilderBlockOrder(order.filter((id) => id !== blockId));
  if (!insertBeforeBlockId) {
    next.push(blockId);
    return next;
  }
  const idx = next.indexOf(insertBeforeBlockId);
  if (idx < 0) {
    next.push(blockId);
    return next;
  }
  next.splice(idx, 0, blockId);
  return next;
};

export const getAddBlockPatches = (config, blockId) => {
  const patches = {};
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    patches.sections = (config.sections || []).map((s) =>
      s.id === sectionId ? { ...s, enabled: true } : s
    );
  }
  const layout = { ...(config.layout || {}) };
  switch (blockId) {
    case 'layout_left_logo':
      layout.showLeftLogo = true;
      break;
    case 'layout_right_logo':
      layout.showRightLogo = true;
      break;
    case 'customer_photo':
      layout.showCustomerPhoto = true;
      break;
    case AGREEMENT_STOCK_BLOCK_ID:
      layout.showStockItemImages = true;
      break;
    case 'layout_footer_image':
      layout.showFooterImage = true;
      break;
    default:
      break;
  }
  patches.layout = layout;
  return patches;
};

export const getRemoveBlockPatches = (config, blockId) => {
  const patches = {};
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    patches.sections = (config.sections || []).map((s) =>
      s.id === sectionId ? { ...s, enabled: false } : s
    );
  }
  const layout = { ...(config.layout || {}) };
  switch (blockId) {
    case 'layout_left_logo':
      layout.showLeftLogo = false;
      break;
    case 'layout_right_logo':
      layout.showRightLogo = false;
      break;
    case 'customer_photo':
      layout.showCustomerPhoto = false;
      break;
    case 'layout_footer_image':
      layout.showFooterImage = false;
      break;
    case AGREEMENT_STOCK_BLOCK_ID:
      layout.showStockItemImages = false;
      break;
    default:
      break;
  }
  patches.layout = layout;
  return patches;
};

export const ensureLogoBandOnAdd = (order) => order;

export { getAgreementBlockOrder };
