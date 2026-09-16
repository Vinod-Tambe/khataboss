import { SUPPORT_COMMENT_KIND_HISTORY } from '../constants/supportTicket';

const ACTIVITY_LINE_PATTERN =
  /^\s*•\s*(Status:|Owner status:|Support progress:|Board column:|Priority changed:|Title updated|Description updated|Expected delivery:|Ticket created|Screenshots added)/m;

export const isSupportActivityHistory = (comment) => {
  if (!comment) return false;
  if (comment.stc_kind === SUPPORT_COMMENT_KIND_HISTORY) return true;

  const body = String(comment.stc_body || '').trim();
  if (body.startsWith('[Ticket update]')) return true;
  if (ACTIVITY_LINE_PATTERN.test(body) && !(comment.stc_images?.length > 0)) {
    return true;
  }
  return false;
};

/** Owner-facing labels; one simple line per activity entry */
export const formatSupportActivityBody = (body, { forOwner = false, forAdmin = false } = {}) => {
  let text = String(body || '').trim();
  if (text.startsWith('[Ticket update]')) {
    text = text.replace(/^\[Ticket update\]\n?/, '').trim();
  }
  if (forOwner) {
    text = text
      .replace(/Owner status:/g, 'Status:')
      .replace(/Board column:/g, 'Support progress:');
  }
  if (forAdmin) {
    text = text
      .replace(/Support progress:/g, 'Admin status:')
      .replace(/Board column:/g, 'Admin status:')
      .replace(/Owner status:/g, 'Owner status:');
  }
  const lines = text
    .split('\n')
    .map((line) => line.replace(/^\s*•\s*/, '').trim())
    .filter(Boolean);
  if (lines.length === 0) return text;
  if (lines.length === 1) return `• ${lines[0]}`;
  return `• ${lines.join(' · ')}`;
};

const stripActivityBullet = (text) => String(text || '').replace(/^\s*•\s*/, '').trim();

/** Single-line preview for collapsed activity rows */
export const getSupportActivityPreview = (formattedBody, maxLen = 80) => {
  const plain = stripActivityBullet(formattedBody);
  if (!plain) return 'Activity update';
  const oneLine = plain.replace(/\s+/g, ' ');
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1).trim()}…`;
};

export const supportActivityNeedsExpand = (formattedBody) => {
  const plain = stripActivityBullet(formattedBody);
  if (!plain) return false;
  if (plain.includes('\n')) return true;
  if (plain.length > 72) return true;
  if (plain.includes(' · ')) return true;
  return false;
};
