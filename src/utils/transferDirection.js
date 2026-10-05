export const TRANSFER_DIRECTION = {
  CR_TO_DR: 'CR_TO_DR',
  DR_TO_CR: 'DR_TO_CR',
  CR_TO_CR: 'CR_TO_CR',
  DR_TO_DR: 'DR_TO_DR',
};

const CONFIG = {
  [TRANSFER_DIRECTION.CR_TO_DR]: {
    fromLabel: 'CR',
    toLabel: 'DR',
    topPanelClass: 'bg-red',
    bottomPanelClass: 'bg-green',
    fromJournalWord: 'credit',
    toJournalWord: 'debit',
  },
  [TRANSFER_DIRECTION.DR_TO_CR]: {
    fromLabel: 'DR',
    toLabel: 'CR',
    topPanelClass: 'bg-green',
    bottomPanelClass: 'bg-red',
    fromJournalWord: 'debit',
    toJournalWord: 'credit',
  },
  [TRANSFER_DIRECTION.CR_TO_CR]: {
    fromLabel: 'CR',
    toLabel: 'CR',
    topPanelClass: 'bg-red',
    bottomPanelClass: 'bg-red',
    fromJournalWord: 'debit',
    toJournalWord: 'credit',
  },
  [TRANSFER_DIRECTION.DR_TO_DR]: {
    fromLabel: 'DR',
    toLabel: 'DR',
    topPanelClass: 'bg-green',
    bottomPanelClass: 'bg-green',
    fromJournalWord: 'credit',
    toJournalWord: 'debit',
  },
};

export function normalizeTransferDirection(direction) {
  const d = String(direction || TRANSFER_DIRECTION.CR_TO_DR).toUpperCase();
  return CONFIG[d] ? d : TRANSFER_DIRECTION.CR_TO_DR;
}

export function getTransferDirectionUiConfig(direction) {
  const key = normalizeTransferDirection(direction);
  return { direction: key, ...CONFIG[key] };
}

export function formatTransferDirectionLabel(direction) {
  const key = normalizeTransferDirection(direction);
  return key.split('_').join(' → ');
}
