export const getCustomerPhone = (user) => {
  const mobile = String(user?.user_mobile_no || '').trim();
  const phone = String(user?.user_phone_no || '').trim();

  if (mobile && phone) {
    if (mobile === phone) return mobile;
    return `${mobile}, ${phone}`;
  }
  if (mobile) return mobile;
  if (phone) return phone;
  return '-';
};

export const getCustomerEmail = (user) => {
  const email = String(user?.user_email_id || user?.user_email || '').trim();
  return email || '-';
};

export const getCustomerAddress = (user) => {
  const city = String(user?.user_city || '').trim();
  const state = String(user?.user_state || '').trim();

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return '-';
};

export const getCustomerFullAddress = (user) => {
  if (!user) return '-';

  const street = String(user.user_curr_address || user.user_per_address || '').trim();
  const city = String(user.user_city || '').trim();
  const state = String(user.user_state || '').trim();
  const country = String(user.user_country || '').trim();
  const pincode = String(user.user_pincode || '').trim();

  const locality = [city, state, country].filter(Boolean).join(', ');
  const withPin = [locality, pincode].filter(Boolean).join(' - ');
  const formatted = [street, withPin].filter(Boolean).join(', ');

  if (formatted) return formatted;
  const short = getCustomerAddress(user);
  return short === '-' ? '-' : short;
};

export const getCustomerPhoneParts = (user) => {
  const mobile = String(user?.user_mobile_no || '').trim();
  const phone = String(user?.user_phone_no || '').trim();

  if (mobile && phone && mobile === phone) {
    return { mobile, phone: '' };
  }

  return { mobile, phone };
};

/** WhatsApp number for messaging; falls back to mobile if not set. */
export const getCustomerWhatsAppNo = (user) => {
  const whatsapp = String(user?.user_whatsapp_no || '').trim();
  const mobile = String(user?.user_mobile_no || '').trim();
  return whatsapp || mobile || '';
};

export const getCustomerFirmInfo = (user, firms = []) => {
  if (user?.firm && typeof user.firm === 'object') return user.firm;

  const firmId = user?.user_firm_id;
  if (firmId && Array.isArray(firms) && firms.length) {
    return firms.find((f) => String(f.firm_id) === String(firmId)) || null;
  }

  return null;
};

export const getCustomerFirmName = (user, firms = []) => {
  const firm = getCustomerFirmInfo(user, firms);
  if (firm?.firm_name) return String(firm.firm_name).trim();

  const fromRelation = String(user?.firm?.firm_name || '').trim();
  if (fromRelation) return fromRelation;

  return '';
};

/** Plain customer label for lists/search (name + father when present). */
export const formatCustomerListName = (user) => {
  if (!user) return "-";
  const fullName = [user.user_first_name, user.user_last_name].filter(Boolean).join(" ").trim();
  const father = String(user.user_father_name || "").trim();
  if (!fullName && !father) return "-";
  if (!father) return fullName;
  if (!fullName) return `F/O ${father}`;
  return `${fullName} (F/O ${father})`;
};

/** HTML for list tables: name with father on second line. */
export const formatCustomerListNameHtml = (user, { linkClass = "text-brown fw-bold" } = {}) => {
  if (!user) return "-";
  const fullName = [user.user_first_name, user.user_last_name].filter(Boolean).join(" ").trim();
  const father = String(user.user_father_name || "").trim();
  if (!fullName && !father) return "-";
  const nameLine = fullName
    ? `<span class="${linkClass}">${fullName}</span>`
    : "";
  const fatherLine = father
    ? `<div class="small text-muted">F/O ${father}</div>`
    : "";
  if (!nameLine) return `<span class="${linkClass}">F/O ${father}</span>`;
  return `<div class="lh-sm">${nameLine}${fatherLine}</div>`;
};

/** Lines for customer name hover tooltip (home, grid, etc.). */
export const buildCustomerHoverDetails = (user, firms = []) => {
  if (!user) return [];

  const lines = [];
  const push = (label, value) => {
    const text = String(value || '').trim();
    if (text) lines.push({ label, value: text });
  };

  const fullName = [user.user_first_name, user.user_last_name].filter(Boolean).join(' ').trim();
  push('Name', fullName);
  push('Customer ID', user.user_unique_code || (user.user_id != null ? String(user.user_id) : ''));

  const firm = getCustomerFirmInfo(user, firms);
  push('Firm', firm?.firm_name || getCustomerFirmName(user, firms));
  push('Firm Phone', firm?.firm_phone_no);
  push('Firm City', firm?.firm_city);

  const mobile = String(user.user_mobile_no || '').trim();
  const phone = String(user.user_phone_no || '').trim();
  const whatsapp = String(user.user_whatsapp_no || '').trim();

  push('Mobile', mobile);
  if (phone && phone !== mobile) push('Phone', phone);
  if (whatsapp) push('WhatsApp', whatsapp);

  const email = getCustomerEmail(user);
  if (email !== '-') push('Email', email);

  push('Father', user.user_father_name);

  const address = getCustomerFullAddress(user);
  if (address !== '-') push('Address', address);

  return lines;
};

/** Label/value rows for header search and compact customer previews (always shows core fields). */
export const buildCustomerSearchDetailRows = (user, firms = []) => {
  if (!user) return [];

  const dash = '—';
  const rows = [];

  const customerId =
    String(user.user_unique_code || '').trim() ||
    (user.user_id != null ? `CST-${user.user_id}` : '');
  rows.push({ label: 'Customer ID', shortLabel: 'ID', value: customerId || dash });

  const { mobile, phone } = getCustomerPhoneParts(user);
  rows.push({ label: 'Mobile', shortLabel: 'Mobile', value: mobile || dash });
  if (phone) {
    rows.push({ label: 'Alt. phone', shortLabel: 'Phone', value: phone });
  }

  const whatsapp = String(user.user_whatsapp_no || '').trim();
  if (whatsapp && whatsapp !== mobile) {
    rows.push({ label: 'WhatsApp', shortLabel: 'WA', value: whatsapp });
  }

  const email = getCustomerEmail(user);
  rows.push({ label: 'Email', shortLabel: 'Email', value: email === '-' ? dash : email });

  const father = String(user.user_father_name || '').trim();
  rows.push({ label: 'Father name', shortLabel: 'Father', value: father || dash });

  const address = getCustomerFullAddress(user);
  rows.push({
    label: 'Address',
    shortLabel: 'Address',
    value: address === '-' ? dash : address,
  });

  const firm = getCustomerFirmName(user, firms);
  rows.push({ label: 'Firm', shortLabel: 'Firm', value: firm || dash });

  return rows;
};

export const formatCustomerSearchDetailLine = (user, firms = []) =>
  buildCustomerSearchDetailRows(user, firms)
    .map((row) => `${row.shortLabel || row.label}: ${row.value}`)
    .join(' · ');

const dashCell = (value) => {
  const text = String(value ?? '').trim();
  return text || '—';
};

/** Customer list / header-search table columns (matches Customers List layout). */
export const HEADER_SEARCH_CUSTOMER_COLUMNS = [
  { key: 'userCode', title: 'Customer ID' },
  { key: 'customerName', title: 'Customer Name' },
  { key: 'locality', title: 'Village / City / State' },
  { key: 'address', title: 'Address' },
  { key: 'mobile', title: 'Mobile No' },
  { key: 'aadhaar', title: 'Adhaar Number' },
  { key: 'firm', title: 'Firm Name' },
  { key: 'status', title: 'Status' },
];

export const formatCustomerTableName = (user) =>
  dashCell([user?.user_first_name, user?.user_last_name].filter(Boolean).join(' '));

export const formatCustomerFatherSpouseName = (user) => {
  const father = String(user?.user_father_name || '').trim();
  const spouse = String(user?.user_spouse_name || '').trim();
  if (father && spouse) return `${father} / ${spouse}`;
  return dashCell(father || spouse);
};

export const formatCustomerVillageCityState = (user) => {
  const parts = [user?.user_village, user?.user_city, user?.user_state]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return parts.length ? parts.join(' / ') : '—';
};

export const formatCustomerStreetAddress = (user) => {
  const curr = String(user?.user_curr_address || '').trim();
  const perm = String(user?.user_per_address || '').trim();
  if (curr && perm && curr !== perm) return `${curr} / ${perm}`;
  return dashCell(curr || perm);
};

export const formatCustomerAadhaarNo = (user) => dashCell(user?.user_adhaar_no);

export const formatCustomerSearchUserCode = (user) =>
  dashCell(
    user?.user_unique_code || (user?.user_id != null ? `CST-${user.user_id}` : '')
  );

export const formatCustomerRecordStatus = (user) =>
  user?.user_is_deleted ? 'Deleted' : 'Active';

export const buildCustomerSearchTableRow = (user, firms = []) => ({
  customerName: formatCustomerTableName(user),
  locality: formatCustomerVillageCityState(user),
  address: formatCustomerStreetAddress(user),
  mobile: dashCell(user?.user_mobile_no),
  aadhaar: formatCustomerAadhaarNo(user),
  firm: dashCell(getCustomerFirmName(user, firms)),
  userCode: formatCustomerSearchUserCode(user),
  status: formatCustomerRecordStatus(user),
});
