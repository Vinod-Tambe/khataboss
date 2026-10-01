import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GLOBAL_SEARCH_INPUT_ID,
  KEYBOARD_SHORTCUT_EVENTS,
  STOCK_SEARCH_INPUT_ID,
  shouldIgnoreShortcut,
} from '../config/keyboardShortcuts';
import { useKeyboardShortcutsOptional } from '../context/KeyboardShortcutsContext';

const dispatchAppEvent = (name) => {
  window.dispatchEvent(new CustomEvent(name));
};

const focusById = (id) => {
  const el = document.getElementById(id);
  if (el && typeof el.focus === 'function') {
    el.focus();
    if (typeof el.select === 'function' && el.tagName === 'INPUT') {
      el.select();
    }
    return true;
  }
  return false;
};

/**
 * Global shortcuts — skipped while typing in inputs/selects/textareas.
 * Does not block browser shortcuts (Ctrl+T, Ctrl+W, F5, etc.) except where noted.
 */
const useAppKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const shortcuts = useKeyboardShortcutsOptional();

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;
      const lower = key.length === 1 ? key.toLowerCase() : key;

      if (key === 'Escape' && shortcuts?.helpOpen) {
        event.preventDefault();
        shortcuts.closeShortcutsHelp();
        event.stopPropagation();
        return;
      }

      if (shouldIgnoreShortcut(event)) {
        return;
      }

      const ctrlOrMeta = event.ctrlKey || event.metaKey;

      if (ctrlOrMeta && lower === 'k') {
        event.preventDefault();
        if (!focusById(GLOBAL_SEARCH_INPUT_ID)) {
          dispatchAppEvent(KEYBOARD_SHORTCUT_EVENTS.FOCUS_GLOBAL_SEARCH);
        }
        return;
      }

      if (key === '/' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        if (!focusById(GLOBAL_SEARCH_INPUT_ID)) {
          dispatchAppEvent(KEYBOARD_SHORTCUT_EVENTS.FOCUS_GLOBAL_SEARCH);
        }
        return;
      }

      if (event.shiftKey && key === '?') {
        event.preventDefault();
        shortcuts?.openShortcutsHelp?.();
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const navMap = {
          h: '/home',
          s: '/stock/grid',
          c: '/user/grid',
          l: '/loan/active-list',
          f: '/finance/active-list',
        };
        const path = navMap[lower];
        if (path) {
          event.preventDefault();
          navigate(path);
        }
        return;
      }

      const onStockList =
        location.pathname.startsWith('/stock/grid') ||
        location.pathname.startsWith('/stock/list');

      if (onStockList && ctrlOrMeta && lower === 'f') {
        event.preventDefault();
        if (!focusById(STOCK_SEARCH_INPUT_ID)) {
          dispatchAppEvent(KEYBOARD_SHORTCUT_EVENTS.FOCUS_STOCK_SEARCH);
        }
        return;
      }

      if (onStockList && key === 'ArrowLeft' && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        dispatchAppEvent(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_PREV);
        return;
      }

      if (onStockList && key === 'ArrowRight' && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        dispatchAppEvent(KEYBOARD_SHORTCUT_EVENTS.STOCK_PAGE_NEXT);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown, false);
    return () => window.removeEventListener('keydown', onKeyDown, false);
  }, [location.pathname, navigate, shortcuts]);
};

export default useAppKeyboardShortcuts;
