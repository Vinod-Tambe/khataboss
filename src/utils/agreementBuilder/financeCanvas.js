import { normalizeBuilderBlockOrder } from '../formTemplate/formBuilderBlocks';
import { AGREEMENT_STOCK_BLOCK_ID } from './loanType';

export const FINANCE_AGREEMENT_BLOCK_ORDER = [
  'layout_left_logo',
  'layout_right_logo',
  'form_header',
  'section:firm_details',
  'section:customer_details',
  'customer_photo',
  'section:finance_details',
  'section:emi_schedule',
  'section:payment_summary',
  'form_terms',
  'form_footer',
  'signature_lines',
];

const FINANCE_SECTION_IDS = new Set(['finance_details', 'emi_schedule', 'payment_summary']);
const LOAN_CANVAS_BLOCK_IDS = new Set(['section:loan_details', AGREEMENT_STOCK_BLOCK_ID]);

const FINANCE_BLOCK_LAYOUT_DEFAULTS = {
  'section:finance_details': {
    widthPct: 100,
    heightMm: 52,
    heightMode: 'fixed',
    posXPct: 0,
    posYPct: 58,
    freePosition: true,
  },
  'section:emi_schedule': {
    widthPct: 100,
    heightMm: 48,
    heightMode: 'fixed',
    posXPct: 0,
    posYPct: 72,
    freePosition: true,
  },
  'section:payment_summary': {
    widthPct: 100,
    heightMm: 36,
    heightMode: 'fixed',
    posXPct: 0,
    posYPct: 86,
    freePosition: true,
  },
};

export const applyFinanceAgreementCanvas = (config) => {
  if (!config || config.agreementDocumentType !== 'Finance') return config;

  const next = structuredClone(config);
  next.layout = { ...(next.layout || {}), showStockItemImages: false };

  let order = normalizeBuilderBlockOrder(next.builderBlockOrder || []);
  const hadLoanCanvas = order.some((id) => LOAN_CANVAS_BLOCK_IDS.has(id));
  order = order.filter((id) => !LOAN_CANVAS_BLOCK_IDS.has(id));

  const financeBlocks = FINANCE_AGREEMENT_BLOCK_ORDER.filter((id) => id.startsWith('section:'));
  const missingFinance = financeBlocks.some((id) => !order.includes(id));
  if (hadLoanCanvas || missingFinance || !order.length) {
    order = [...FINANCE_AGREEMENT_BLOCK_ORDER];
  }

  next.builderBlockOrder = normalizeBuilderBlockOrder(order);

  const layouts = { ...(next.blockLayouts || {}) };
  delete layouts['section:loan_details'];
  delete layouts[AGREEMENT_STOCK_BLOCK_ID];
  Object.entries(FINANCE_BLOCK_LAYOUT_DEFAULTS).forEach(([blockId, defaults]) => {
    layouts[blockId] = { ...defaults, ...(layouts[blockId] || {}) };
  });
  next.blockLayouts = layouts;

  if (Array.isArray(next.sections)) {
    next.sections = next.sections.map((section) => {
      if (section.id === 'loan_details') {
        return { ...section, enabled: false };
      }
      if (FINANCE_SECTION_IDS.has(section.id)) {
        return { ...section, enabled: true };
      }
      return section;
    });
  }

  return next;
};

export const isFinanceAgreementConfig = (config) =>
  String(config?.agreementDocumentType || '').trim() === 'Finance';
