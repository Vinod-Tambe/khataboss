import React, { useMemo } from 'react';
import moment from 'moment';
import {
  getSortedSections,
  getSortedFields,
  getPageStyle,
  replaceTemplateVariables,
  getFieldLayoutClass,
  groupFieldsByLayout,
} from '../../../utils/formTemplate/formTemplateConfig';
import {
  buildFormTemplateTestData,
  getFieldTestValue,
  TRANSACTION_TEST_ROWS,
} from '../../../utils/formTemplate/formTemplateTestData';
import {
  SAMPLE_CUSTOMER_PHOTO_DATA_URL,
  SAMPLE_FIRM_LOGO_DATA_URL,
} from '../../../utils/formTemplate/formTemplatePreviewAssets';

const CUSTOMER_PHOTO_FIELD_ID = 'customer_photo';

const FormTemplatePreview = ({
  config,
  firmName,
  scale = 0.72,
  testData: testDataProp,
  transactionRows: transactionRowsProp,
  leftLogoUrl = null,
  rightLogoUrl = null,
  customerPhotoUrl = null,
  firmFormHeader = '',
  firmFormFooter = '',
  useSampleAssets = true,
}) => {
  const page = useMemo(() => getPageStyle(config), [config]);
  const testData = useMemo(
    () => testDataProp || buildFormTemplateTestData(firmName),
    [testDataProp, firmName]
  );
  const transactionRows = transactionRowsProp || TRANSACTION_TEST_ROWS;

  if (!config) {
    return <div className="form-custom-a4-empty">Select a template to preview</div>;
  }

  const sections = getSortedSections(config).filter((s) => s.enabled);
  const showLogos = config.layout?.showLeftLogo || config.layout?.showRightLogo;
  const layout = config.layout || {};
  const showCustomerPhoto = layout.showCustomerPhoto !== false;
  const resolvedLeftLogo =
    leftLogoUrl || (useSampleAssets && layout.showLeftLogo ? SAMPLE_FIRM_LOGO_DATA_URL : null);
  const resolvedRightLogo =
    rightLogoUrl || (useSampleAssets && layout.showRightLogo ? SAMPLE_FIRM_LOGO_DATA_URL : null);
  const resolvedCustomerPhoto =
    showCustomerPhoto && (customerPhotoUrl || (useSampleAssets ? SAMPLE_CUSTOMER_PHOTO_DATA_URL : null));

  const renderFieldValue = (field) => {
    if (field.id === CUSTOMER_PHOTO_FIELD_ID) {
      if (!showCustomerPhoto) {
        return '—';
      }
      if (!resolvedCustomerPhoto) {
        return getFieldTestValue(field.id, testData);
      }
      return (
        <img
          src={resolvedCustomerPhoto}
          alt="Customer"
          className="form-custom-a4-customer-photo"
        />
      );
    }
    return getFieldTestValue(field.id, testData);
  };

  return (
    <div className="form-custom-a4-viewport">
      <div
        className="form-custom-a4-page"
        style={{
          ...page.cssVars,
          width: `${page.widthMm}mm`,
          minHeight: `${page.heightMm}mm`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {showLogos ? (
          <div className="form-custom-a4-logos">
            {config.layout?.showLeftLogo ? (
              resolvedLeftLogo ? (
                <img src={resolvedLeftLogo} alt="Left logo" className="form-custom-a4-logo-img" />
              ) : (
                <div className="form-custom-a4-logo-placeholder">LOGO</div>
              )
            ) : (
              <span />
            )}
            {config.layout?.showRightLogo ? (
              resolvedRightLogo ? (
                <img src={resolvedRightLogo} alt="Right logo" className="form-custom-a4-logo-img" />
              ) : (
                <div className="form-custom-a4-logo-placeholder">LOGO</div>
              )
            ) : null}
          </div>
        ) : null}

        {layout.useFirmFormHeader && firmFormHeader ? (
          <div className="form-custom-a4-firm-header">
            {replaceTemplateVariables(firmFormHeader, testData)}
          </div>
        ) : null}

        <header className="form-custom-a4-header">
          <h1>{config.title || 'FORM 8'}</h1>
          {config.subtitle ? <p className="subtitle">{config.subtitle}</p> : null}
          {config.complianceReference ? (
            <p className="compliance">{config.complianceReference}</p>
          ) : null}
          {config.headerNote ? (
            <p className="note">{replaceTemplateVariables(config.headerNote, testData)}</p>
          ) : null}
        </header>

        <div className="form-custom-a4-meta">
          <span>Firm: {firmName || testData.firm_name}</span>
          <span>Date: {testData.today_date}</span>
        </div>

        {sections.map((section) => (
          <section
            key={section.id}
            className="form-custom-a4-section"
            style={
              section.backgroundColor
                ? { backgroundColor: section.backgroundColor }
                : undefined
            }
          >
            <h3>{section.label}</h3>

            {section.id === 'transaction_history' || section.id === 'emi_schedule' ? (
              <table className="form-custom-a4-table">
                <thead>
                  <tr>
                    {getSortedFields(section)
                      .filter((f) => f.enabled)
                      .map((field) => (
                        <th key={field.id}>{field.label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {transactionRows.map((row, idx) => (
                    <tr key={idx}>
                      {getSortedFields(section)
                        .filter((f) => f.enabled)
                        .map((field) => (
                          <td key={field.id}>{row[field.id] ?? '—'}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="form-custom-a4-fields">
                {groupFieldsByLayout(section.fields).map((group, gIdx) => (
                  <div
                    key={`${section.id}-row-${gIdx}`}
                    className={`form-custom-a4-field-row row-${group.layout}`}
                  >
                    {group.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`form-custom-a4-field ${getFieldLayoutClass(field.fieldLayout)}`}
                        style={
                          field.backgroundColor
                            ? { backgroundColor: field.backgroundColor }
                            : undefined
                        }
                      >
                        <span className="label">{field.label}</span>
                        <span className="value">{renderFieldValue(field)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {config.termsAndConditions ? (
          <section className="form-custom-a4-section form-custom-a4-terms">
            <h3>Terms & Conditions</h3>
            <p>{replaceTemplateVariables(config.termsAndConditions, testData)}</p>
          </section>
        ) : null}

        {config.declarationText ? (
          <p className="form-custom-a4-declaration">
            {replaceTemplateVariables(config.declarationText, testData)}
          </p>
        ) : null}

        <div className="form-custom-a4-signatures">
          {Object.entries(config.signatureLabels || {}).map(([key, label]) => (
            <div key={key} className="form-custom-a4-sign-box">
              {config.layout?.showOwnerSign && key === 'owner' ? (
                <div className="sign-placeholder">Sign</div>
              ) : (
                <div className="sign-line" />
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>

        {config.layout?.showQrCode ? (
          <div className="form-custom-a4-qr">QR</div>
        ) : null}

        {layout.useFirmFormFooter && firmFormFooter ? (
          <footer className="form-custom-a4-footer">
            {replaceTemplateVariables(firmFormFooter, testData)}
          </footer>
        ) : config.footerNote ? (
          <footer className="form-custom-a4-footer">
            {replaceTemplateVariables(config.footerNote, testData)}
          </footer>
        ) : null}

        {config.showPageNumbers ? (
          <div className="form-custom-a4-pagenum">Page 1 of 1 · {config.pageSize || 'A4'}</div>
        ) : null}
      </div>
      <p className="form-custom-a4-size-label">
        {config.pageSize || 'A4'} · {config.orientation || 'portrait'} · Test data preview ·{' '}
        {moment().format('DD-MM-YYYY')}
      </p>
    </div>
  );
};

export default FormTemplatePreview;
