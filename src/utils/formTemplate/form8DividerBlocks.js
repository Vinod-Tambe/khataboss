/** Palette type id — always adds a new divider instance. */
export const FORM8_DIVIDER_PALETTE_ID = 'form_divider';

const DIVIDER_INSTANCE_RE = /^form_divider:(\d+)$/;

export const isForm8DividerPaletteId = (blockId) => blockId === FORM8_DIVIDER_PALETTE_ID;

export const isForm8DividerInstanceId = (blockId) =>
  blockId === FORM8_DIVIDER_PALETTE_ID || DIVIDER_INSTANCE_RE.test(blockId || '');

export const isForm8DividerBlockId = isForm8DividerInstanceId;

const instanceNumber = (blockId) => {
  if (blockId === FORM8_DIVIDER_PALETTE_ID) return 1;
  const match = DIVIDER_INSTANCE_RE.exec(blockId || '');
  return match ? Number(match[1]) : 0;
};

export const createNextForm8DividerBlockId = (order = []) => {
  const used = new Set(
    (order || []).map(instanceNumber).filter((n) => n > 0)
  );
  let n = 1;
  while (used.has(n)) n += 1;
  return `${FORM8_DIVIDER_PALETTE_ID}:${n}`;
};

/** Fresh layout so each divider keeps its own Advance styles. */
export const createEmptyForm8DividerLayout = () => ({
  widthPct: 100,
  heightMm: 6,
  heightMode: 'fixed',
  dividerColor: '',
  dividerWidth: '',
  dividerStyle: 'solid',
});

export const readForm8DividerOwnStyle = (config, blockId) => {
  const own = config?.blockLayouts?.[blockId] || {};
  return {
    dividerColor: own.dividerColor ?? '',
    dividerWidth: own.dividerWidth ?? '',
    dividerStyle: own.dividerStyle || 'solid',
  };
};

export const listForm8DividerBlockIds = (order = []) =>
  (order || []).filter((id) => DIVIDER_INSTANCE_RE.test(id || ''));

export const getForm8DividerLabel = (blockId, order = []) => {
  const ids = listForm8DividerBlockIds(order);
  const index = ids.indexOf(blockId);
  const n = index >= 0 ? index + 1 : instanceNumber(blockId) || 1;
  return n <= 1 ? 'Divider' : `Divider ${n}`;
};

/** Legacy single `form_divider` becomes `form_divider:1`. */
export const migrateForm8DividerBlocks = (config = {}) => {
  const order = Array.isArray(config.builderBlockOrder)
    ? [...config.builderBlockOrder]
    : [];
  const layouts = { ...(config.blockLayouts || {}) };
  let changed = false;
  const nextOrder = order.map((id) => {
    if (id !== FORM8_DIVIDER_PALETTE_ID) return id;
    changed = true;
    if (layouts[FORM8_DIVIDER_PALETTE_ID] && !layouts['form_divider:1']) {
      layouts['form_divider:1'] = layouts[FORM8_DIVIDER_PALETTE_ID];
    }
    delete layouts[FORM8_DIVIDER_PALETTE_ID];
    return 'form_divider:1';
  });
  if (!changed) return config;
  return {
    ...config,
    builderBlockOrder: nextOrder,
    blockLayouts: layouts,
  };
};
