/** Channel-scoped SMS permissions (mirrors backend smsChannelPermissions). */

export const SMS_CHANNEL_VIEW = {
  whatsapp: "sms.whatsappView",
  sms: "sms.textView",
  email: "sms.emailView",
};

export const SMS_CHANNEL_MANAGE = {
  whatsapp: "sms.whatsappManage",
  sms: "sms.textManage",
  email: "sms.emailManage",
};

export const ALL_SMS_PAGE_KEYS = [
  "sms.view",
  "sms.manage",
  "sms.whatsappView",
  "sms.whatsappManage",
  "sms.textView",
  "sms.textManage",
  "sms.emailView",
  "sms.emailManage",
];

export const KYC_PAGE_KEYS = ["kyc.view", "kyc.manage"];

export const BACKUP_PAGE_KEYS = ["backup.view", "backup.manage"];

export const canViewSmsChannel = (can, channel) =>
  can(SMS_CHANNEL_VIEW[channel]) || can("sms.view");

export const canManageSmsChannel = (can, channel) =>
  can(SMS_CHANNEL_MANAGE[channel]) || can("sms.manage");

export const canAccessKyc = (can) =>
  KYC_PAGE_KEYS.some((key) => can(key));

export const canAccessBackup = (can) =>
  BACKUP_PAGE_KEYS.some((key) => can(key));
