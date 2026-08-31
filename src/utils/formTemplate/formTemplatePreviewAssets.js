/** Inline SVG placeholders for form/agreement customization preview and test PDFs. */

const encodeSvg = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const SAMPLE_CUSTOMER_PHOTO_DATA_URL = encodeSvg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150">
    <rect width="120" height="150" fill="#f3f4f6" stroke="#9ca3af" stroke-width="2"/>
    <circle cx="60" cy="52" r="24" fill="#d1d5db"/>
    <path d="M24 132c8-24 24-36 36-36s28 12 36 36" fill="#d1d5db"/>
    <text x="60" y="142" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#6b7280">Sample Photo</text>
  </svg>`
);

export const SAMPLE_FIRM_LOGO_DATA_URL = encodeSvg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="8" fill="#f9fafb" stroke="#9ca3af" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="48" y="54" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#6b7280">LOGO</text>
  </svg>`
);
