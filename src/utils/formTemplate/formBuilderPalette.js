import {
  FORM8_BLOCK_META,
  FORM8_DEFAULT_BLOCK_ORDER,
  getForm8BlockOrder,
  isForm8BlockEnabled,
  isForm8RequiredBlock,
  normalizeBuilderBlockOrder,
} from './formBuilderBlocks';
import {
  FORM8_OPTIONAL_SECTION_IDS,
  FORM8_SPECIAL_BLOCKS,
  isForm8PaletteBlockHidden,
  parseSectionBlockId,
  sectionBlockId,
} from './formBuilderCatalog';
import {
  FORM8_DIVIDER_PALETTE_ID,
  getForm8DividerLabel,
  isForm8DividerInstanceId,
  isForm8DividerPaletteId,
  listForm8DividerBlockIds,
} from './formDividerBlocks';
import { FORM8_STOCK_BLOCK_ID, isForm8SecuredTemplate } from './formLoanType';

export const F8_PALETTE_DRAG_MIME = 'application/x-f8-palette-block';
export const F8_CANVAS_BLOCK_DRAG_MIME = 'application/x-f8-block-id';

export const isForm8BlockOnCanvas = (config, blockId) => {
  const order = config?.builderBlockOrder || [];
  if (!order.includes(blockId)) return false;
  return isForm8BlockEnabled(config, blockId);
};

const blockCategory = (blockId, sectionId) => {
  if (sectionId && FORM8_OPTIONAL_SECTION_IDS.has(sectionId)) return 'optional';
  const special = FORM8_SPECIAL_BLOCKS.find((b) => b.id === blockId);
  if (special?.category === 'optional') return 'optional';
  if (!isForm8RequiredBlock(blockId)) return 'optional';
  return 'required';
};

const blockLabel = (blockId, sections, order = []) => {
  if (isForm8DividerInstanceId(blockId) && !isForm8DividerPaletteId(blockId)) {
    return getForm8DividerLabel(blockId, order);
  }
  if (isForm8DividerPaletteId(blockId)) {
    return FORM8_BLOCK_META[FORM8_DIVIDER_PALETTE_ID]?.label || 'Divider';
  }
  if (FORM8_BLOCK_META[blockId]?.label) {
    return FORM8_BLOCK_META[blockId].label;
  }
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = sections.find((s) => s.id === sectionId);
    return section?.label || blockId;
  }
  const special = FORM8_SPECIAL_BLOCKS.find((b) => b.id === blockId);
  return special?.label || blockId;
};

/** All palette entries (required + optional), PO-builder style. */
export const buildForm8PaletteCatalog = (config, sections = []) => {
  const sectionIds = new Set(sections.map((s) => sectionBlockId(s.id)));
  const ids = new Set();

  FORM8_DEFAULT_BLOCK_ORDER.forEach((id) => ids.add(id));
  (config?.builderBlockOrder || []).forEach((id) => ids.add(id));
  FORM8_SPECIAL_BLOCKS.forEach((b) => ids.add(b.id));
  sections.forEach((s) => ids.add(sectionBlockId(s.id)));

  const items = [];
  const order = config?.builderBlockOrder || [];

  ids.forEach((blockId) => {
    if (blockId === 'layout_logo') return;
    if (blockId === FORM8_STOCK_BLOCK_ID && !isForm8SecuredTemplate(config)) return;
    if (isForm8PaletteBlockHidden(blockId)) return;
    if (isForm8DividerInstanceId(blockId) && !isForm8DividerPaletteId(blockId)) return;
    const sectionId = parseSectionBlockId(blockId);
    if (sectionId && !sectionIds.has(blockId)) return;
    if (!FORM8_BLOCK_META[blockId] && !sectionId) {
      if (!FORM8_SPECIAL_BLOCKS.some((b) => b.id === blockId)) return;
    }

    const category = blockCategory(blockId, sectionId);
    const repeatable = isForm8DividerPaletteId(blockId);
    const onCanvas = repeatable ? false : isForm8BlockOnCanvas(config, blockId);
    const inOrder = order.includes(blockId);

    items.push({
      id: blockId,
      label: blockLabel(blockId, sections, order),
      category,
      onCanvas,
      inOrder,
      repeatable,
      placed: repeatable ? false : onCanvas || (inOrder && isForm8RequiredBlock(blockId)),
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
      const stock = FORM8_DEFAULT_BLOCK_ORDER.indexOf('stock_line_items');
      return (stock >= 0 ? stock : 8) + 0.4;
    }
    if (isForm8DividerInstanceId(id)) {
      const stock = FORM8_DEFAULT_BLOCK_ORDER.indexOf('stock_line_items');
      const n = Number(String(id).split(':')[1] || 1);
      return (stock >= 0 ? stock : 8) + 0.5 + n / 100;
    }
    if (id === 'layout_footer_image') {
      const signatures = FORM8_DEFAULT_BLOCK_ORDER.indexOf('signature_lines');
      return (signatures >= 0 ? signatures : 10) - 0.1;
    }
    const idx = FORM8_DEFAULT_BLOCK_ORDER.indexOf(id);
    return idx >= 0 ? idx : 999;
  };

  items.sort((a, b) => {
    const orderDiff = sortKey(a.id) - sortKey(b.id);
    if (orderDiff !== 0) return orderDiff;
    return String(a.label).localeCompare(String(b.label));
  });

  return { items };
};

export const buildForm8OnCanvasItems = (config, sections = []) => {
  const order = getForm8BlockOrder(config);
  return order
    .filter((blockId) => {
      if (blockId === 'layout_logo') return false;
      const sectionId = parseSectionBlockId(blockId);
      if (sectionId) {
        return sections.some((s) => s.id === sectionId);
      }
      if (isForm8DividerInstanceId(blockId)) return true;
      return Boolean(FORM8_BLOCK_META[blockId]);
    })
    .map((blockId) => ({
      id: blockId,
      label: blockLabel(blockId, sections, order),
      onCanvas: isForm8BlockOnCanvas(config, blockId),
    }));
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

/** Patches to apply when adding a block to the canvas (enable flags). */
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
    case 'stock_line_items':
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

/** Patches when removing an optional block from canvas. */
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
    case 'stock_line_items':
      layout.showStockItemImages = false;
      break;
    default:
      break;
  }
  patches.layout = layout;
  return patches;
};

/** Do not auto-insert paired logos — user places each logo where they want. */
export const ensureLogoBandOnAdd = (order) => order;
