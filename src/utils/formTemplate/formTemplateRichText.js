/** Basic HTML → plain text for pdfMake (firm header/footer may contain simple HTML). */
export const templateHtmlToPlain = (html) => {
  if (html == null || html === '') return '';
  const s = String(html);
  if (!/<[a-z][\s\S]*>/i.test(s)) return s;

  const withBreaks = s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n');

  const doc = typeof DOMParser !== 'undefined' ? new DOMParser().parseFromString(withBreaks, 'text/html') : null;
  const text = doc?.body?.textContent ?? withBreaks.replace(/<[^>]+>/g, '');

  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const templateLooksLikeHtml = (value) => /<[a-z][\s\S]*>/i.test(String(value || ''));
