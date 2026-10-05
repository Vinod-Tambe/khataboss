import { formatListDate } from "../../utils/listFormatters";
import { getCustomerFirmName, getCustomerFullAddress } from "../../utils/customerFormatters";

const displayOrDash = (value) => {
  if (value == null || value === "") return "-";
  return String(value).trim() || "-";
};

const makeTextColumn = (key, title, options = {}) => ({
  key,
  title,
  orderable: true,
  searchable: true,
  ...options,
  render: (data, type, row) => {
    const plain = displayOrDash(data ?? row?.[key]);
    if (type !== "display" && type !== "export") {
      return plain === "-" ? "" : plain;
    }
    if (options.displayClass) {
      return `<span class="${options.displayClass}">${plain}</span>`;
    }
    return plain;
  },
});

const makeDateColumn = (key, title) => ({
  key,
  title,
  orderable: true,
  searchable: true,
  dateFilter: key === "user_add_date",
  render: (data, type, row) => {
    const raw = data ?? row?.[key];
    const formatted = formatListDate(raw);
    if (type !== "display" && type !== "export") {
      return raw || "";
    }
    return formatted;
  },
});

export const customerFirmColumn = {
  key: "firm_name",
  title: "Firm",
  orderable: true,
  searchable: true,
  cardCorner: true,
  render: (data, type, row) => {
    const name = getCustomerFirmName(row) || displayOrDash(data);
    if (type !== "display" && type !== "export") return name === "-" ? "" : name;
    return name;
  },
};

/** Desktop / mobile-expand columns for customer normal list (not grid). */
export const buildCustomerListColumns = ({ includeFirm = false } = {}) => {
  const cols = [
    {
      key: "user_unique_code",
      title: "Unique Code",
      orderable: true,
      searchable: true,
      render: (data, type, row) => {
        const value = displayOrDash(data ?? row?.user_unique_code ?? row?.user_id);
        if (type !== "display" && type !== "export") {
          return value === "-" ? "" : value;
        }
        return value === "-"
          ? "-"
          : `<span class="text-brown fw-bold">${value}</span>`;
      },
    },
  ];

  if (includeFirm) {
    cols.push(customerFirmColumn);
  }

  cols.push(
    makeTextColumn("user_first_name", "First Name"),
    makeTextColumn("user_last_name", "Last Name"),
    makeTextColumn("user_father_name", "Father Name"),
    makeTextColumn("user_mother_name", "Mother Name"),
    makeTextColumn("user_spouse_name", "Spouse Name"),
    makeTextColumn("user_mobile_no", "Mobile No"),
    makeTextColumn("user_phone_no", "Phone No"),
    makeTextColumn("user_whatsapp_no", "WhatsApp No"),
    makeTextColumn("user_email_id", "Email"),
    makeTextColumn("user_gender", "Gender"),
    makeTextColumn("user_cast", "Caste"),
    makeTextColumn("user_marital_status", "Marital Status"),
    makeTextColumn("user_occupation", "Occupation"),
    makeDateColumn("user_birth_date", "Date of Birth"),
    makeTextColumn("user_adhaar_no", "Aadhaar No"),
    makeTextColumn("user_pan_no", "PAN No"),
    makeTextColumn("user_gstin", "GSTIN"),
    makeTextColumn("user_tax_no", "Tax No"),
    makeTextColumn("user_bank_name", "Bank Name"),
    makeTextColumn("user_bank_acc_no", "Bank A/C No"),
    makeTextColumn("user_ifsc_code", "IFSC"),
    {
      key: "user_curr_address",
      title: "Current Address",
      orderable: true,
      searchable: true,
      render: (data, type, row) => {
        const plain = displayOrDash(data ?? row?.user_curr_address);
        if (type !== "display" && type !== "export") return plain === "-" ? "" : plain;
        return plain;
      },
    },
    {
      key: "user_per_address",
      title: "Permanent Address",
      orderable: true,
      searchable: true,
      render: (data, type, row) => {
        const plain = displayOrDash(data ?? row?.user_per_address);
        if (type !== "display" && type !== "export") return plain === "-" ? "" : plain;
        return plain;
      },
    },
    makeTextColumn("user_village", "Village"),
    makeTextColumn("user_ward_no", "Ward No"),
    makeTextColumn("user_tehsil", "Tehsil"),
    makeTextColumn("user_city", "City"),
    makeTextColumn("user_state", "State"),
    makeTextColumn("user_country", "Country"),
    makeTextColumn("user_pincode", "Pincode"),
    {
      key: "user_full_address",
      title: "Full Address",
      orderable: false,
      searchable: true,
      render: (_data, type, row) => {
        const plain = getCustomerFullAddress(row);
        if (type !== "display" && type !== "export") return plain === "-" ? "" : plain;
        return plain;
      },
    },
    makeTextColumn("user_other_info", "Other Info"),
    makeTextColumn("user_nominee_name", "Nominee Name"),
    makeTextColumn("user_nominee_relation", "Nominee Relation"),
    makeTextColumn("user_nominee_mobile", "Nominee Mobile"),
    makeTextColumn("user_nominee_address", "Nominee Address"),
    makeDateColumn("user_add_date", "Added On")
  );

  return cols;
};
