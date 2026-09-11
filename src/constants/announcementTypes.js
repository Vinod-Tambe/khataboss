export const ANNOUNCEMENT_TYPE_ORDER = [
  'Notice',
  'Alert',
  'Warning',
  'Celebration',
  'Congratulation',
];

export const ANNOUNCEMENT_TYPE_CONFIG = {
  Notice: {
    label: 'Notice',
    icon: 'bi-info-circle-fill',
    color: '#0d6efd',
    bg: '#e7f1ff',
    border: '#b6d4fe',
    badgeClass: 'bg-primary',
    subtleClass: 'bg-primary-subtle text-primary',
  },
  Alert: {
    label: 'Alert',
    icon: 'bi-exclamation-octagon-fill',
    color: '#dc3545',
    bg: '#fde8ea',
    border: '#f1aeb5',
    badgeClass: 'bg-danger',
    subtleClass: 'bg-danger-subtle text-danger',
  },
  Warning: {
    label: 'Warning',
    icon: 'bi-exclamation-triangle-fill',
    color: '#b45309',
    bg: '#fff4d6',
    border: '#ffda6a',
    badgeClass: 'bg-warning text-dark',
    subtleClass: 'bg-warning-subtle text-warning-emphasis',
  },
  Celebration: {
    label: 'Celebration',
    icon: 'bi-balloon-heart-fill',
    color: '#7c3aed',
    bg: '#f3e8ff',
    border: '#d8b4fe',
    badgeClass: 'text-white',
    badgeStyle: { background: '#7c3aed' },
    subtleClass: 'text-white',
    subtleStyle: { background: '#ede9fe', color: '#6d28d9' },
  },
  Congratulation: {
    label: 'Congratulation',
    icon: 'bi-trophy-fill',
    color: '#198754',
    bg: '#d1e7dd',
    border: '#a3cfbb',
    badgeClass: 'bg-success',
    subtleClass: 'bg-success-subtle text-success',
  },
};

export const getAnnouncementTypeConfig = (type) =>
  ANNOUNCEMENT_TYPE_CONFIG[type] || ANNOUNCEMENT_TYPE_CONFIG.Notice;

export const DEFAULT_ANNOUNCEMENT_TYPE = 'Notice';
