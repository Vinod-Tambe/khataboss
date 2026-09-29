import React from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import { formatDateOnly } from '../../utils/dateFormat';

const LoginSoftwareNotice = ({ notices = [], blockLogin = false }) => {
  if (!notices.length) return null;

  const primary = notices[0];
  const config = getAnnouncementTypeConfig(primary.ann_type);
  const endLabel = primary.ann_expires_at
    ? formatDateOnly(primary.ann_expires_at)
    : null;

  return (
    <div
      className={`login-software-notice ${blockLogin ? 'login-software-notice--blocking' : ''}`}
      role="alert"
      style={{
        '--ann-type-color': config.color,
        '--ann-type-bg': config.bg,
        '--ann-type-border': config.border,
      }}
    >
      <div className="login-software-notice__icon" aria-hidden="true">
        <i className={`bi ${config.icon}`} />
      </div>
      <div className="login-software-notice__content">
        <div className="login-software-notice__label">{config.label}</div>
        <div className="login-software-notice__title">{primary.ann_title}</div>
        <p className="login-software-notice__body mb-2">{primary.ann_body}</p>
        {blockLogin ? (
          <p className="login-software-notice__hint login-software-notice__hint--block mb-0">
            Sign-in is temporarily unavailable on this screen during this period.
            {endLabel ? ` Please try again after ${endLabel}.` : ' Please try again later.'}
          </p>
        ) : (
          <p className="login-software-notice__hint mb-0">
            You can still sign in and use KhataBoss during this period.
          </p>
        )}
        {notices.length > 1 && (
          <p className="login-software-notice__more mb-0">
            {notices.length - 1} additional active notice{notices.length - 1 > 1 ? 's' : ''}.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginSoftwareNotice;
