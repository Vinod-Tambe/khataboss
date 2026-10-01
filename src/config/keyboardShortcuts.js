/**
 * Keyboard shortcut catalog (for help UI) and app events.
 * Shortcuts are optional helpers — they never replace normal UI flow.
 */

export const KEYBOARD_SHORTCUT_EVENTS = {
  FOCUS_GLOBAL_SEARCH: 'khataboss:focus-global-search',
  FOCUS_STOCK_SEARCH: 'khataboss:focus-stock-search',
  STOCK_PAGE_PREV: 'khataboss:stock-page-prev',
  STOCK_PAGE_NEXT: 'khataboss:stock-page-next',
};

export const GLOBAL_SEARCH_INPUT_ID = 'app-global-search-input';
export const STOCK_SEARCH_INPUT_ID = 'app-stock-search-input';

export const isEditableTarget = (target) => {
  if (!target || typeof target !== 'object') return false;
  const el = target;
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest('[contenteditable="true"]'));
};

/** True when user is typing in a field — do not steal normal keys. */
export const shouldIgnoreShortcut = (event) => {
  if (event.defaultPrevented) return true;
  if (isEditableTarget(event.target)) return true;
  return false;
};

export const KEYBOARD_SHORTCUT_GROUPS = [
  {
    id: 'general',
    title: 'General',
    items: [
      {
        keys: ['Ctrl', 'K'],
        description: 'Focus top search bar (customers, loans, finance)',
      },
      {
        keys: ['/'],
        description: 'Focus top search (when not typing in a field)',
      },
      {
        keys: ['Shift', '?'],
        description: 'Open this keyboard shortcuts help',
      },
      {
        keys: ['Esc'],
        description: 'Close help panel or dialog (browser & app dialogs)',
      },
    ],
  },
  {
    id: 'navigation',
    title: 'Quick navigation',
    items: [
      { keys: ['Alt', 'H'], description: 'Go to Home' },
      { keys: ['Alt', 'S'], description: 'Go to Stock inventory' },
      { keys: ['Alt', 'C'], description: 'Go to Customer list' },
      { keys: ['Alt', 'L'], description: 'Go to Active loan list' },
      { keys: ['Alt', 'F'], description: 'Go to Finance list' },
    ],
  },
  {
    id: 'stock',
    title: 'Stock inventory page',
    items: [
      {
        keys: ['Ctrl', 'F'],
        description: 'Focus stock search box (on Stock page)',
      },
      {
        keys: ['←'],
        description: 'Previous page (when pagination is shown)',
      },
      {
        keys: ['→'],
        description: 'Next page (when pagination is shown)',
      },
    ],
  },
  {
    id: 'stock-details',
    title: 'Stock item image viewer',
    items: [
      { keys: ['+'], description: 'Zoom in' },
      { keys: ['-'], description: 'Zoom out' },
      { keys: ['0'], description: 'Reset zoom (fit)' },
      { keys: ['Esc'], description: 'Close image viewer' },
      {
        keys: ['Mouse wheel'],
        description: 'Zoom in / out on the image area',
      },
      {
        keys: ['Drag'],
        description: 'Move image when zoomed above 100%',
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms (existing behavior)',
    items: [
      { keys: ['Enter'], description: 'Move to next field in many forms' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit form from any field' },
    ],
  },
];
