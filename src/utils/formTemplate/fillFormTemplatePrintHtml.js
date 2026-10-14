import { getForm8StockCellValue, getForm8StockFooterCellValue } from './form8StockTable';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fillMacros = (html, data = {}) =>
  String(html || '').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    if (value == null || value === '') return '';
    return esc(value);
  });

const setAssetSrc = (root, attr, src) => {
  if (!src) return;
  root.querySelectorAll(`img[data-asset="${attr}"]`).forEach((img) => {
    img.setAttribute('src', src);
    img.style.display = 'block';
    if (attr === 'customerPhoto') {
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center center';
    }
  });
};

const fillStockTable = (root, rows = []) => {
  const body = root.querySelector('[data-role="stock-body"]');
  const template = body?.querySelector('[data-role="stock-row-template"]');
  if (!body || !template) return;

  const columns = [...template.querySelectorAll('[data-col]')].map((cell) => cell.getAttribute('data-col'));
  body.querySelectorAll('tr:not([data-role="stock-row-template"])').forEach((row) => row.remove());

  const list = Array.isArray(rows) && rows.length ? rows : [{}];
  list.forEach((row) => {
    const tr = template.cloneNode(true);
    tr.removeAttribute('hidden');
    tr.removeAttribute('data-role');
    columns.forEach((col) => {
      const cell = tr.querySelector(`[data-col="${col}"]`);
      if (!cell) return;
      if (col === 'image') {
        if (row.imageDataUrl || row.imageUrl) {
          cell.innerHTML = `<img src="${esc(row.imageDataUrl || row.imageUrl)}" alt="" style="max-width:12mm;max-height:12mm;object-fit:cover" />`;
        } else {
          cell.textContent = '';
        }
        return;
      }
      cell.textContent = getForm8StockCellValue(row, col) || '';
    });
    body.appendChild(tr);
  });

  if (rows?.length) {
    const foot = template.cloneNode(true);
    foot.removeAttribute('hidden');
    foot.removeAttribute('data-role');
    columns.forEach((col) => {
      const cell = foot.querySelector(`[data-col="${col}"]`);
      if (!cell) return;
      cell.textContent = getForm8StockFooterCellValue(rows, col, columns.map((id) => ({ id }))) || '';
      cell.style.fontWeight = '700';
    });
    body.appendChild(foot);
  }
};

/**
 * Fill stored Form 8 HTML with live or preview data before HTML→PDF.
 */
export const fillFormTemplatePrintHtml = (html, options = {}) => {
  if (!html) return '';
  const formData = options.formData || {};
  const filled = fillMacros(html, formData);
  const firmFormHeader = options.firmFormHeader || options.formHeader || '';
  const firmFormFooter = options.firmFormFooter || options.formFooter || '';

  if (typeof DOMParser === 'undefined') return filled;

  const parser = new DOMParser();
  const doc = parser.parseFromString(filled, 'text/html');
  const root = doc.body;

  setAssetSrc(root, 'leftLogo', options.leftLogoDataUrl);
  setAssetSrc(root, 'rightLogo', options.rightLogoDataUrl);
  setAssetSrc(root, 'footerImage', options.footerImageDataUrl);
  setAssetSrc(root, 'customerPhoto', options.customerPhotoDataUrl);

  if (firmFormHeader) {
    root.querySelectorAll('[data-role="firm-header"]').forEach((el) => {
      el.innerHTML = firmFormHeader;
    });
  }
  if (firmFormFooter) {
    root.querySelectorAll('[data-role="footer-body"]').forEach((el) => {
      el.innerHTML = /<[a-z][\s\S]*>/i.test(firmFormFooter)
        ? firmFormFooter
        : esc(firmFormFooter);
    });
  }

  fillStockTable(root, options.stockItemRows || []);

  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
};
