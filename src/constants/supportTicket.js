export const SUPPORT_TITLE_MIN = 3;
export const SUPPORT_TITLE_MAX = 50;
export const SUPPORT_BODY_MIN = 10;
export const SUPPORT_BODY_MAX = 1000;

export const SUPPORT_COMMENT_MAX_IMAGES = 3;

export const SUPPORT_COMMENT_KIND_HISTORY = 'History';

export const SUPPORT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const OWNER_TICKET_STATUSES = [
  'Sent',
  'Review',
  'InDiscussion',
  'Development',
  'Testing',
  'Done',
  'Delivered',
];

export const ADMIN_TICKET_STATUSES = [
  'Backlog',
  'Todo',
  'InProgress',
  'DoneOnLocal',
  'ReadyForTesting',
  'Done',
  'Delivered',
  'Cancelled',
];

export const OWNER_STATUS_LABELS = {
  Sent: 'Sent',
  Review: 'Review',
  InDiscussion: 'In discussion',
  Development: 'Development',
  Testing: 'Testing',
  Done: 'Done',
  Delivered: 'Delivered',
};

/** CSS slug for owner status colors (cards, stepper) */
export const OWNER_STATUS_SLUG = {
  Sent: 'sent',
  Review: 'review',
  InDiscussion: 'discussion',
  Development: 'development',
  Testing: 'testing',
  Done: 'done',
  Delivered: 'delivered',
};

export const getOwnerStatusSlug = (status) => OWNER_STATUS_SLUG[status] || 'default';

export const ADMIN_STATUS_SLUG = {
  Backlog: 'backlog',
  Todo: 'todo',
  InProgress: 'inprogress',
  DoneOnLocal: 'done-local',
  ReadyForTesting: 'ready-test',
  Done: 'done',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

export const getAdminStatusSlug = (status) => ADMIN_STATUS_SLUG[status] || 'default';

export const ADMIN_STATUS_LABELS = {
  Backlog: 'Backlog',
  Todo: 'To do',
  InProgress: 'In progress',
  DoneOnLocal: 'Done on local',
  ReadyForTesting: 'Ready for testing',
  Done: 'Done',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

export const PRIORITY_LABELS = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Urgent: 'Urgent',
};

/** Owner may edit title, description, and priority until delivered or cancelled. */
export const canOwnerEditSupportTicket = (ticket) => {
  if (!ticket) return false;
  if (ticket.st_owner_status === 'Delivered') return false;
  if (ticket.st_admin_status === 'Cancelled') return false;
  return true;
};

export const formatTicketNo = (ticketNo) => {
  const n = Number(ticketNo);
  if (!Number.isFinite(n) || n <= 0) return 'T-—';
  return `T-${n}`;
};

export const truncateText = (text, max = 72) => {
  const value = String(text || '').trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
};
