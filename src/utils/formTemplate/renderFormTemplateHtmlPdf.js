import { fillFormTemplatePrintHtml } from './fillFormTemplatePrintHtml';
import { resolveFormTemplatePrintHtml } from './buildFormTemplatePrintHtml';
import {
  downloadFormTemplatePdf as downloadPdfMake,
  getFormTemplatePdfBlob as getPdfMakeBlob,
  getFormTemplatePdfFileName,
  openFormTemplatePdfPreview as openPdfMakePreview,
} from './buildFormTemplatePdf';

const A4_PX = Math.round(210 * (96 / 25.4));
const A4_HEIGHT_MM = 297;
const PX_PER_MM = 96 / 25.4;
const CAPTURE_SCALE = 2;

const pageCaptureSize = (page) => ({
  width: A4_PX,
  height: Math.max(Math.round(page?.offsetHeight || 0), Math.round(page?.scrollHeight || 0), 1123),
});

const canvasOptions = (page) => {
  const size = pageCaptureSize(page);
  const win = page?.ownerDocument?.defaultView;
  return {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    letterRendering: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: -(win?.scrollX || 0),
    scrollY: -(win?.scrollY || 0),
    windowWidth: size.width,
    windowHeight: size.height,
    onclone: (doc) => {
      const root = doc.documentElement;
      const body = doc.body;
      const el = doc.querySelector('.form-custom-a4-page, .f8-page') || body?.firstElementChild;
      if (root) {
        root.style.margin = '0';
        root.style.padding = '0';
      }
      if (body) {
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.width = `${size.width}px`;
      }
      if (el) {
        el.style.margin = '0';
        el.style.left = '0';
        el.style.right = 'auto';
        el.style.transform = 'none';
        el.style.width = `${size.width}px`;
        el.style.maxWidth = `${size.width}px`;
        el.style.boxSizing = 'border-box';
      }
    },
  };
};

const pdfOptions = (config, fileName) => ({
  margin: 0,
  filename: fileName,
  image: { type: 'jpeg', quality: 0.92 },
  html2canvas: canvasOptions(),
  jsPDF: {
    unit: 'mm',
    format: config?.pageSize === 'A5' ? 'a5' : 'a4',
    orientation: config?.orientation === 'landscape' ? 'landscape' : 'portrait',
  },
  pagebreak: { mode: [] },
});

const expectedPdfPages = (page) => {
  const heightPx = Math.max(page?.offsetHeight || 0, page?.scrollHeight || 0);
  const heightMm = heightPx / PX_PER_MM;
  return Math.max(1, Math.round(heightMm / A4_HEIGHT_MM) || Math.ceil(heightMm / A4_HEIGHT_MM));
};

const loadHtml2Pdf = async () => {
  try {
    const mod = await import('html2pdf.js');
    return mod.default || mod;
  } catch {
    return null;
  }
};

const filledDocument = (html, config, options) =>
  fillFormTemplatePrintHtml(
    resolveFormTemplatePrintHtml(html, config, {
      firmName: options.displayFirmName || '',
      firmFormHeader: options.firmFormHeader || options.formHeader || '',
      firmFormFooter: options.firmFormFooter || options.formFooter || '',
    }),
    options
  );

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForImages = async (root) => {
  const images = [...(root?.querySelectorAll?.('img') || [])];
  if (!images.length) return;
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 1500);
        })
    )
  );
};

const coverCropImage = (img) =>
  new Promise((resolve) => {
    const src = img.getAttribute('src');
    if (!src) {
      resolve();
      return;
    }
    const box = img.getBoundingClientRect();
    const destW = Math.max(2, Math.round(box.width || img.clientWidth || 0));
    const destH = Math.max(2, Math.round(box.height || img.clientHeight || 0));
    if (destW < 4 || destH < 4) {
      resolve();
      return;
    }
    const loader = new Image();
    loader.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = destW;
      canvas.height = destH;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(destW / loader.width, destH / loader.height);
      const drawW = loader.width * scale;
      const drawH = loader.height * scale;
      ctx.drawImage(loader, (destW - drawW) / 2, (destH - drawH) / 2, drawW, drawH);
      img.setAttribute('src', canvas.toDataURL('image/jpeg', 0.92));
      img.style.objectFit = 'fill';
      img.style.width = '100%';
      img.style.height = '100%';
      resolve();
    };
    loader.onerror = () => resolve();
    loader.src = src;
  });

const fitCustomerPhotosToBoxes = async (page) => {
  const photos = [...(page?.querySelectorAll?.('img.form-custom-a4-customer-photo, img[data-asset="customerPhoto"]') || [])];
  await Promise.all(photos.map((img) => coverCropImage(img)));
};

const renderFilledHtmlInIframe = async (filled) => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Form 8 print');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${A4_PX}px`,
    'height:1123px',
    'margin:0',
    'padding:0',
    'opacity:0.01',
    'pointer-events:none',
    'border:0',
    'background:#fff',
    'z-index:1',
    'overflow:hidden',
  ].join(';');
  document.body.appendChild(iframe);

  await new Promise((resolve) => {
    const finish = () => resolve();
    iframe.onload = finish;
    iframe.srcdoc = filled;
    setTimeout(finish, 400);
  });
  await wait(80);

  return iframe;
};

const clonePrintPageIntoParent = (iframe) => {
  const srcDoc = iframe.contentDocument;
  if (!srcDoc) return { host: null, page: null };
  const sourcePage = srcDoc.querySelector('.form-custom-a4-page, .f8-page') || srcDoc.body;
  const host = document.createElement('div');
  host.setAttribute('data-f8-html-pdf', '1');
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${A4_PX}px`,
    'margin:0',
    'padding:0',
    'background:#fff',
    'opacity:0.01',
    'pointer-events:none',
    'z-index:2',
    'overflow:hidden',
  ].join(';');
  const styleEl = document.createElement('style');
  styleEl.textContent = [...srcDoc.querySelectorAll('style')].map((node) => node.textContent).join('\n');
  host.appendChild(styleEl);
  const page = sourcePage.cloneNode(true);
  page.style.margin = '0';
  page.style.width = `${A4_PX}px`;
  page.style.maxWidth = `${A4_PX}px`;
  page.style.left = '0';
  page.style.transform = 'none';
  page.style.boxSizing = 'border-box';
  host.appendChild(page);
  document.body.appendChild(host);
  return { host, page };
};

const cropCanvasToA4 = (canvas) => {
  const targetW = A4_PX * CAPTURE_SCALE;
  if (!canvas || canvas.width <= targetW + 1) return canvas;
  const cropped = document.createElement('canvas');
  cropped.width = targetW;
  cropped.height = canvas.height;
  const sx = Math.max(0, canvas.width - targetW);
  cropped.getContext('2d').drawImage(canvas, sx, 0, targetW, canvas.height, 0, 0, targetW, canvas.height);
  return cropped;
};

const trimExtraPdfPages = (pdf, keepPages) => {
  if (!pdf) return;
  const keep = Math.max(1, keepPages || 1);
  while (pdf.internal.getNumberOfPages() > keep) {
    pdf.deletePage(pdf.internal.getNumberOfPages());
  }
};

const sliceCanvasToA4Pdf = async (page, config, fileName) => {
  const html2canvasMod = await import('html2canvas');
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jspdfMod = await import('jspdf');
  const JsPdf = jspdfMod.jsPDF || jspdfMod.default?.jsPDF || jspdfMod.default;
  if (!html2canvas || !JsPdf) return null;

  const rawCanvas = await html2canvas(page, canvasOptions(page));
  const canvas = cropCanvasToA4(rawCanvas);
  const pdf = new JsPdf({
    unit: 'mm',
    format: config?.pageSize === 'A5' ? 'a5' : 'a4',
    orientation: config?.orientation === 'landscape' ? 'landscape' : 'portrait',
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;
  const pageCount = Math.max(1, Math.round(imgH / pageH) || Math.ceil(imgH / pageH));
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  for (let i = 0; i < pageCount; i += 1) {
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -i * pageH, imgW, imgH);
  }
  pdf.setProperties({ title: fileName || 'FORM 8' });
  return pdf;
};

const htmlToPdfBlob = async (filled, config, fileName) => {
  const iframe = await renderFilledHtmlInIframe(filled);
  let host = null;
  try {
    await waitForImages(iframe.contentDocument);
    const srcPage = iframe.contentDocument?.querySelector('.form-custom-a4-page, .f8-page');
    if (srcPage) {
      const fullH = Math.max(srcPage.scrollHeight, srcPage.offsetHeight, 1123);
      iframe.style.height = `${fullH}px`;
      iframe.style.width = `${A4_PX}px`;
      srcPage.style.margin = '0';
      srcPage.style.width = `${A4_PX}px`;
      await wait(40);
    }
    await waitForImages(srcPage || iframe.contentDocument);
    if (srcPage) await fitCustomerPhotosToBoxes(srcPage);

    if (srcPage) {
      try {
        const sliced = await sliceCanvasToA4Pdf(srcPage, config, fileName);
        if (sliced) {
          const blob = sliced.output('blob');
          if (blob && blob.size >= 800) return blob;
        }
      } catch {
        /* fall back */
      }
    }

    const cloned = clonePrintPageIntoParent(iframe);
    host = cloned.host;
    const page = cloned.page;
    if (!page) return null;
    await waitForImages(page);
    await fitCustomerPhotosToBoxes(page);
    page.style.overflow = 'hidden';
    page.style.boxSizing = 'border-box';
    page.style.margin = '0';
    page.style.width = `${A4_PX}px`;
    const html2pdf = await loadHtml2Pdf();
    if (!html2pdf) return null;
    const keepPages = expectedPdfPages(page);
    const worker = html2pdf().set(pdfOptions(config, fileName)).from(page);
    const pdf = await worker.toPdf().get('pdf');
    trimExtraPdfPages(pdf, keepPages);
    const blob = pdf.output('blob');
    if (!blob || blob.size < 800) return null;
    return blob;
  } catch {
    return null;
  } finally {
    iframe.remove();
    host?.remove();
  }
};

const pdfMakeOptions = (options) => ({
  ...options,
  firmName: options.displayFirmName,
});

export const getFormTemplateHtmlPdfBlob = async (html, config, options = {}) => {
  const filled = filledDocument(html, config, options);
  const fileName = getFormTemplatePdfFileName(config, options.displayFirmName || '', options);
  if (filled) {
    const blob = await htmlToPdfBlob(filled, config, fileName);
    if (blob) return { blob, fileName };
  }
  const fallback = await getPdfMakeBlob(config, options.displayFirmName || '', pdfMakeOptions(options));
  return { blob: fallback, fileName };
};

const redirectToPdf = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener,noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const openFormTemplateHtmlPdf = async (html, config, options = {}) => {
  const filled = filledDocument(html, config, options);
  const fileName = getFormTemplatePdfFileName(config, options.displayFirmName || '', options);
  if (filled) {
    const blob = await htmlToPdfBlob(filled, config, fileName);
    if (blob) {
      const url = URL.createObjectURL(blob);
      redirectToPdf(url);
      return url;
    }
  }
  await openPdfMakePreview(config, options.displayFirmName || '', pdfMakeOptions(options));
  return null;
};

export const downloadFormTemplateHtmlPdf = async (html, config, options = {}) => {
  const filled = filledDocument(html, config, options);
  const fileName = getFormTemplatePdfFileName(config, options.displayFirmName || '', options);
  if (filled) {
    const blob = await htmlToPdfBlob(filled, config, fileName);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return fileName;
    }
  }
  await downloadPdfMake(config, options.displayFirmName || '', pdfMakeOptions(options));
  return fileName;
};
