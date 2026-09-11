import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import {
  formatExpiryCountdown,
  getSubscriptionStatusFromUser,
  userNeedsSubscriptionRefresh,
} from '../utils/subscriptionExpiry';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TICK_MS = 1000;
const PROFILE_REFRESH_MS = 2 * 60 * 1000;

const useSubscriptionExpiry = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token || !userNeedsSubscriptionRefresh(user)) return;
    dispatch(fetchCurrentUser());
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token) return;

    const refreshProfile = () => dispatch(fetchCurrentUser());
    const interval = setInterval(refreshProfile, PROFILE_REFRESH_MS);
    const onFocus = () => refreshProfile();

    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch, token]);

  const status = useMemo(
    () => getSubscriptionStatusFromUser(user, now),
    [user, now]
  );

  const countdownLabel = useMemo(
    () => formatExpiryCountdown(status, now),
    [status, now]
  );

  const showCountdown = Boolean(
    status.showWarning && !status.expired && countdownLabel
  );

  return useMemo(
    () => ({
      status,
      showCountdown,
      countdownLabel,
      isUrgent:
        status.msRemaining !== null &&
        status.msRemaining <= MS_PER_DAY,
    }),
    [status, countdownLabel, showCountdown]
  );
};

export default useSubscriptionExpiry;
