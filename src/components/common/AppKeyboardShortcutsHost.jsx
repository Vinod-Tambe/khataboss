import useAppKeyboardShortcuts from '../../hooks/useAppKeyboardShortcuts';

/** Mount once inside KeyboardShortcutsProvider to register global shortcuts. */
const AppKeyboardShortcutsHost = () => {
  useAppKeyboardShortcuts();
  return null;
};

export default AppKeyboardShortcutsHost;
