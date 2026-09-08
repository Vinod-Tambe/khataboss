/**
 * Channel-specific template body helpers (mirrors backend message-format.service.js).
 */

/** Single-width divider — fits one line on WhatsApp mobile (avoid heavy ━ wrap). */
export const WHATSAPP_HORIZONTAL_LINE = "──────────────────";

export const KHATABOSS_BRAND = {
  name: "KhataBoss",
  siteUrl: "https://khataboss.com",
  supportPhone: "9579082528",
  accent: "#70016e",
};

const escapeHtmlLite = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Footer block appended when message is sent (mirrors backend). */
export const buildWhatsAppFooterText = (firmName = "") => {
  const firm = firmName || "Your Firm";
  return `\n\n${WHATSAPP_HORIZONTAL_LINE}\n*${firm}*\n🌐 ${KHATABOSS_BRAND.siteUrl}\n📞 Help: ${KHATABOSS_BRAND.supportPhone}\nPowered by *${KHATABOSS_BRAND.name}*`;
};

/** Branded email footer preview (mirrors sent email wrapper footer). */
export const buildEmailFooterPreviewHtml = (firmName = "") => {
  const firm = escapeHtmlLite(firmName || "Your Firm");
  const site = KHATABOSS_BRAND.siteUrl.replace(/^https?:\/\//, "");
  const year = new Date().getFullYear();
  return `
    <div class="email-preview-footer">
      <div class="email-preview-divider" role="presentation"></div>
      <p class="email-preview-firm"><strong>${firm}</strong></p>
      <p class="email-preview-meta">🌐 <span>${site}</span></p>
      <p class="email-preview-meta">📞 Help: ${KHATABOSS_BRAND.supportPhone}</p>
      <p class="email-preview-powered">Powered by <strong>${KHATABOSS_BRAND.name}</strong> · © ${year}</p>
    </div>
  `;
};

/** Preview body + auto footer (same as sent message). */
export const appendWhatsAppFooterForPreview = (body = "", firmName = "") => {
  let text = String(body || "").trimEnd();
  if (!text) return buildWhatsAppFooterText(firmName).trimStart();
  if (text.includes(KHATABOSS_BRAND.siteUrl)) return text;
  text = stripTrailingHorizontalLines(text);
  return `${text}${buildWhatsAppFooterText(firmName)}`;
};

export const stripTrailingHorizontalLines = (text = "") => {
  const lines = String(text || "").split("\n");
  while (lines.length) {
    const last = lines[lines.length - 1];
    if (last.trim() === "") {
      lines.pop();
      continue;
    }
    if (isWhatsAppHorizontalLine(last)) {
      lines.pop();
      while (lines.length && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }
      break;
    }
    break;
  }
  return lines.join("\n").trimEnd();
};

/** Render one WhatsApp line to HTML for preview bubbles. */
export const renderWhatsAppLineHtml = (line = "") => {
  if (!String(line).trim()) {
    return '<div class="wa-preview-gap"></div>';
  }
  if (isWhatsAppHorizontalLine(line)) {
    return '<div class="wa-preview-hr" role="presentation"></div>';
  }
  const escaped = String(line)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div class="wa-preview-line">${escaped
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")}</div>`;
};

/** Full WhatsApp preview HTML including optional auto-footer. */
export const whatsAppTextToPreviewHtml = (
  text = "",
  { includeFooter = false, firmName = "" } = {}
) => {
  let source = String(text || "");
  if (includeFooter) {
    source = appendWhatsAppFooterForPreview(source, firmName);
  }
  return source.split("\n").map((line) => renderWhatsAppLineHtml(line)).join("");
};

/** True if a line is only horizontal rule characters. */
export const isWhatsAppHorizontalLine = (line = "") =>
  /^[\s━─\-_=~•·.]{4,}$/.test(String(line || "").trim());

/** Insert horizontal line at cursor with surrounding newlines. */
export const buildWhatsAppLineInsert = (text = "", cursor = 0) => {
  const before = String(text || "").slice(0, cursor);
  const after = String(text || "").slice(cursor);
  const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
  const suffix = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
  const insert = `${prefix}${WHATSAPP_HORIZONTAL_LINE}${suffix}`;
  return {
    text: before + insert + after,
    cursor: before.length + insert.length,
  };
};

export const stripHtml = (html = "") => {
  if (typeof document === "undefined") {
    return String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\u00a0/g, " ");
};

export const htmlToWhatsAppMarkdown = (html = "") => {
  let text = String(html || "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<p[^>]*>/gi, "");
  text = text.replace(/<strong>([\s\S]*?)<\/strong>/gi, "*$1*");
  text = text.replace(/<b>([\s\S]*?)<\/b>/gi, "*$1*");
  text = text.replace(/<em>([\s\S]*?)<\/em>/gi, "_$1_");
  text = text.replace(/<i>([\s\S]*?)<\/i>/gi, "_$1_");
  text = text.replace(/<li[^>]*>/gi, "\n• ");
  text = text.replace(/<\/li>/gi, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
};

export const htmlToPlainText = (html = "") =>
  htmlToWhatsAppMarkdown(html).replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1");

export const plainToHtml = (text = "") => {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
};

export const hasHtmlTags = (text = "") => /<[a-z][\s\S]*>/i.test(String(text || ""));

/** Normalize stored body when opening editor by channel. */
export const normalizeBodyForChannel = (body = "", channel = "email") => {
  const raw = String(body || "");
  if (channel === "email") {
    return hasHtmlTags(raw) ? raw : plainToHtml(raw);
  }
  if (channel === "whatsapp") {
    return hasHtmlTags(raw) ? htmlToWhatsAppMarkdown(raw) : raw;
  }
  return hasHtmlTags(raw) ? htmlToPlainText(raw) : raw;
};

export const getBodyPlainLength = (body = "", channel = "email") => {
  if (channel === "email") return stripHtml(body).length;
  return String(body || "").length;
};

export const sanitizeBodyForSave = (body = "", channel = "email") => {
  const raw = String(body || "").trim();
  if (!raw) return "";

  if (channel === "email") {
    return hasHtmlTags(raw) ? raw : plainToHtml(raw);
  }
  if (channel === "whatsapp") {
    const md = hasHtmlTags(raw) ? htmlToWhatsAppMarkdown(raw) : raw;
    if (hasHtmlTags(md)) {
      throw new Error("WhatsApp templates cannot contain HTML. Use *bold* and _italic_ only.");
    }
    return md
      .split("\n")
      .map((line) => (isWhatsAppHorizontalLine(line) ? WHATSAPP_HORIZONTAL_LINE : line))
      .join("\n");
  }
  const plain = hasHtmlTags(raw) ? htmlToPlainText(raw) : raw.replace(/\*([^*]+)\*/g, "$1").replace(/_([^_]+)_/g, "$1");
  if (hasHtmlTags(plain)) {
    throw new Error("SMS templates must be plain text only.");
  }
  return plain;
};
