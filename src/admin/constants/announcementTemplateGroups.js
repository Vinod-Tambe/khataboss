/** National-day template keys (fixed list). */
export const NATIONAL_ANNOUNCEMENT_TEMPLATE_KEYS = new Set([
  'republic_day',
  'independence_day',
  'gandhi_jayanti',
]);

/** Software / maintenance system templates (prefix). */
export const SOFTWARE_ANNOUNCEMENT_TEMPLATE_PREFIX = 'software_';

export const getAnnouncementTemplateGroup = (templateKey) => {
  const key = String(templateKey || '').trim();
  if (!key) return 'custom';
  if (key.startsWith(SOFTWARE_ANNOUNCEMENT_TEMPLATE_PREFIX)) return 'software';
  if (NATIONAL_ANNOUNCEMENT_TEMPLATE_KEYS.has(key)) return 'national';
  return 'festival';
};

export const ANNOUNCEMENT_TEMPLATE_GROUP_META = {
  festival: {
    title: 'Festival greetings',
    description:
      'Diwali, Holi, Navratri, Dussehra, Janmashtami, Ganesh Chaturthi, Ram Navami, Maha Shivaratri, Raksha Bandhan, Makar Sankranti, Pongal, and Onam — set start and end dates only.',
  },
  national: {
    title: 'National days',
    description: 'Republic Day, Independence Day, and Gandhi Jayanti — set start and end dates only.',
  },
  software: {
    title: 'Software & maintenance',
    description:
      'Scheduled maintenance, updates, known issues, downtime, security, and performance notices — set when owners should see each message.',
  },
};

export const partitionAnnouncementTemplates = (items = []) => {
  const templates = items.filter((row) => row.ann_template_key);
  const sort = (a, b) => (a.ann_sort_order ?? 0) - (b.ann_sort_order ?? 0);

  return {
    festival: templates
      .filter((row) => getAnnouncementTemplateGroup(row.ann_template_key) === 'festival')
      .sort(sort),
    national: templates
      .filter((row) => getAnnouncementTemplateGroup(row.ann_template_key) === 'national')
      .sort(sort),
    software: templates
      .filter((row) => getAnnouncementTemplateGroup(row.ann_template_key) === 'software')
      .sort(sort),
    custom: items.filter((row) => !row.ann_template_key),
  };
};
