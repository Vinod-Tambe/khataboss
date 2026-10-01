import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import KeyboardShortcutsModal from '../components/common/KeyboardShortcutsModal';

const KeyboardShortcutsContext = createContext(null);

export const KeyboardShortcutsProvider = ({ children }) => {
  const [helpOpen, setHelpOpen] = useState(false);

  const openShortcutsHelp = useCallback(() => setHelpOpen(true), []);
  const closeShortcutsHelp = useCallback(() => setHelpOpen(false), []);

  const value = useMemo(
    () => ({
      helpOpen,
      openShortcutsHelp,
      closeShortcutsHelp,
    }),
    [helpOpen, openShortcutsHelp, closeShortcutsHelp]
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <KeyboardShortcutsModal show={helpOpen} onHide={closeShortcutsHelp} />
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const ctx = useContext(KeyboardShortcutsContext);
  if (!ctx) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return ctx;
};

export const useKeyboardShortcutsOptional = () => useContext(KeyboardShortcutsContext);
