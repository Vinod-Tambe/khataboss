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
