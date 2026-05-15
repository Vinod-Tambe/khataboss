import { useEffect } from 'react';

/**
 * Hook to handle premium form keyboard navigation:
 * - Enter: Move to next field (or submit if last field)
 * - Backspace: Move to previous field if current is empty/at start
 * - Ctrl+Enter: Submit form from any field
 * - AutoFocus: Automatically focus the first field on load
 * 
 * @param {React.RefObject} formRef Ref to the form element
 * @param {boolean} autoFocus Whether to focus the first field automatically
 */
const useFormNavigation = (formRef, autoFocus = true) => {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Helper to get focusable elements
    const getFocusableElements = () => {
        const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
        return Array.from(form.querySelectorAll(selector)).filter(el => {
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        });
    };

    // Auto-focus the first element on mount
    if (autoFocus) {
        setTimeout(() => {
            const elements = getFocusableElements();
            if (elements.length > 0) {
                elements[0].focus();
            }
        }, 100);
    }

    const handleKeyDown = (e) => {
      const focusableElements = getFocusableElements();

      const currentIndex = focusableElements.indexOf(document.activeElement);

      // 1. Handle Ctrl + Enter (Global Submit)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
        return;
      }

      // 2. Handle Enter (Next Field)
      if (e.key === 'Enter') {
        // Let default behavior handle submit buttons (which is to submit)
        if (document.activeElement.type === 'submit') return;

        // Skip for textareas if Shift is pressed (allow new line)
        if (document.activeElement.tagName === 'TEXTAREA' && e.shiftKey) return;

        e.preventDefault();

        if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
          // Focus next element
          focusableElements[currentIndex + 1].focus();
          
          // If it's a text input, select the content for better UX
          if (focusableElements[currentIndex + 1].select) {
            focusableElements[currentIndex + 1].select();
          }
        }
        return;
      }

      // 3. Handle Backspace (Previous Field)
      if (e.key === 'Backspace') {
        const activeEl = document.activeElement;
        const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
        
        // Define input types that don't support selectionStart
        const noSelectionSupport = ['email', 'number', 'date', 'month', 'week', 'time', 'datetime-local'];
        
        let shouldGoBack = false;
        if (!isInput) {
            shouldGoBack = true;
        } else {
            const isEntryField = isInput && !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(activeEl.type);
            
            if (isEntryField) {
                // If it's a text-entry field, only go back if it's empty
                // We check selectionStart for supported types, otherwise just check value
                let isAtStart = false;
                if (!noSelectionSupport.includes(activeEl.type)) {
                    try {
                        isAtStart = activeEl.selectionStart === 0;
                    } catch (e) {
                        isAtStart = true;
                    }
                } else {
                    isAtStart = true; // For email/number, we only care if it's empty
                }
                
                shouldGoBack = isAtStart && activeEl.value === "";
            } else {
                // For checkboxes, radios, buttons, backspace always goes back
                shouldGoBack = true;
            }
        }

        if (shouldGoBack && currentIndex > 0) {
          e.preventDefault();
          const prevEl = focusableElements[currentIndex - 1];
          prevEl.focus();
          
          // If it's a text input, select the content
          if (prevEl.select) {
              prevEl.select();
          }
        }
      }
    };

    form.addEventListener('keydown', handleKeyDown);
    return () => form.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRef, autoFocus]);
};

export default useFormNavigation;
