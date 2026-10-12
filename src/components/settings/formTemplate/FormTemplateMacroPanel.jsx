import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { FORM_TEMPLATE_MACRO_GROUPS } from '../../../utils/formTemplate/formTemplateMacros';

const FormTemplateMacroPanel = ({ onInsert }) => {
  const copyMacro = useCallback(async (macro) => {
    try {
      await navigator.clipboard.writeText(macro.key);
      toast.success(`Copied ${macro.key}`);
      onInsert?.(macro.key);
    } catch {
      toast.error('Could not copy macro');
    }
  }, [onInsert]);

  return (
    <div className="form-custom-macro-panel form-custom-macro-panel--compact">
      <p className="form-custom-form-hint mb-2">
        Click a macro to copy it. Paste into <strong>Header Note</strong>,{' '}
        <strong>Footer Note</strong>, terms, or declaration. Values are filled from loan
        data when printing Form 8.
      </p>
      {FORM_TEMPLATE_MACRO_GROUPS.map((group) => (
        <div key={group.id} className="form-custom-macro-group">
          <h6 className="form-custom-macro-group-title">{group.label}</h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered form-custom-macro-table mb-0">
              <thead>
                <tr>
                  <th>Macro</th>
                  <th>Meaning</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {group.macros.map((macro) => (
                  <tr key={macro.key}>
                    <td>
                      <code className="form-custom-macro-code">{macro.key}</code>
                    </td>
                    <td>
                      <span className="fw-semibold">{macro.label}</span>
                      {macro.hint ? (
                        <span className="d-block small text-muted">{macro.hint}</span>
                      ) : null}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => copyMacro(macro)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormTemplateMacroPanel;
