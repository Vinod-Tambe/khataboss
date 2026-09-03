import React, { useId } from "react";

const AppBrandLogo = ({ size = 36, className = "", alt = "KhataBoss" }) => {
  const gradId = useId().replace(/:/g, "");

  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
    maxWidth: `${size}px`,
    maxHeight: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
  };

  return (
    <svg
      className={`app-brand-logo ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label={alt}
      style={sizeStyle}
    >
      <defs>
        <linearGradient id={`kb-brand-grad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-logo-bg-start, #70016e)" />
          <stop offset="55%" stopColor="var(--brand-logo-bg-mid, #a1005b)" />
          <stop offset="100%" stopColor="var(--brand-logo-bg-end, #e60000)" />
        </linearGradient>
      </defs>

      <rect
        width="512"
        height="512"
        rx="112"
        fill={`url(#kb-brand-grad-${gradId})`}
      />

      <rect
        x="148"
        y="118"
        width="216"
        height="276"
        rx="24"
        fill="var(--brand-logo-paper, #ffffff)"
        opacity="0.96"
      />

      <rect
        x="176"
        y="156"
        width="160"
        height="18"
        rx="9"
        fill={`url(#kb-brand-grad-${gradId})`}
      />

      <rect x="176" y="196" width="132" height="14" rx="7" fill="var(--brand-logo-line, #c4a8b8)" />
      <rect x="176" y="228" width="148" height="14" rx="7" fill="var(--brand-logo-line, #c4a8b8)" />
      <rect x="176" y="260" width="120" height="14" rx="7" fill="var(--brand-logo-line, #c4a8b8)" />
      <rect x="176" y="292" width="140" height="14" rx="7" fill="var(--brand-logo-line, #c4a8b8)" />
      <rect x="176" y="324" width="108" height="14" rx="7" fill="var(--brand-logo-line, #c4a8b8)" />

      <circle cx="332" cy="156" r="10" fill="var(--brand-logo-accent, #a1005b)" />
    </svg>
  );
};

export default AppBrandLogo;
