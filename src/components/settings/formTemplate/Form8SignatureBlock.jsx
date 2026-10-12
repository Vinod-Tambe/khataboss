import React from 'react';

const Form8SignatureBlock = ({ entries = [] }) => {
  if (!entries.length) return null;

  const columnClass =
    entries.length === 1
      ? 'form-custom-a4-signatures form-custom-a4-signatures--row form-custom-a4-signatures--cols-1'
      : 'form-custom-a4-signatures form-custom-a4-signatures--row form-custom-a4-signatures--cols-2';

  return (
    <div className={columnClass}>
      {entries.map(({ id, caption }) => (
        <div key={id} className="form-custom-a4-sign-cell">
          <div className="form-custom-a4-sign-cell__space" aria-hidden="true" />
          <div className="form-custom-a4-sign-cell__line" aria-hidden="true" />
          <div className="form-custom-a4-sign-cell__caption">{caption}</div>
        </div>
      ))}
    </div>
  );
};

export default Form8SignatureBlock;
