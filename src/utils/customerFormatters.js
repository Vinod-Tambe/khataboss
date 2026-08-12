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
