import { useCallback, useEffect, useRef, useState } from 'react';
import appConfig from '../config/appConfig';

const DEFAULT_IDLE_MS = (appConfig.idleSessionIdleMinutes ?? 2) * 60 * 1000;
const DEFAULT_WARNING_SEC = appConfig.idleSessionWarningSeconds ?? 10;

/**
 * After idleMs without pointer/keyboard activity, show warning and count down.
 * onLogout runs when countdown reaches zero unless continueSession is called.
 */
export function useIdleSessionGuard({
  enabled = true,
  idleMs = DEFAULT_IDLE_MS,
  warningSeconds = DEFAULT_WARNING_SEC,
  onLogout,
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);

  const lastActivityRef = useRef(Date.now());
  const warningActiveRef = useRef(false);
  const logoutTriggeredRef = useRef(false);
  const lastMoveThrottleRef = useRef(0);

  const continueSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningActiveRef.current = false;
    logoutTriggeredRef.current = false;
    setShowWarning(false);
    setSecondsLeft(warningSeconds);
  }, [warningSeconds]);

  const triggerLogout = useCallback(() => {
    if (logoutTriggeredRef.current) return;
    logoutTriggeredRef.current = true;
    setShowWarning(false);
    onLogout?.();
  }, [onLogout]);

  useEffect(() => {
    if (!enabled) return undefined;

    lastActivityRef.current = Date.now();
    warningActiveRef.current = false;
    logoutTriggeredRef.current = false;
    setShowWarning(false);
    setSecondsLeft(warningSeconds);

    const markActivity = () => {
      if (warningActiveRef.current) return;
      lastActivityRef.current = Date.now();
    };

    const onMouseMove = () => {
      const now = Date.now();
      if (now - lastMoveThrottleRef.current < 800) return;
      lastMoveThrottleRef.current = now;
      markActivity();
    };

    const onKeyDown = () => markActivity();
    const onMouseDown = () => markActivity();
    const onTouchStart = () => markActivity();
    const onScroll = () => markActivity();
    const onClick = () => markActivity();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    const tick = window.setInterval(() => {
      if (logoutTriggeredRef.current) return;

      if (warningActiveRef.current) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerLogout();
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      if (Date.now() - lastActivityRef.current >= idleMs) {
        warningActiveRef.current = true;
        setShowWarning(true);
        setSecondsLeft(warningSeconds);
      }
    }, 1000);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
    };
  }, [enabled, idleMs, warningSeconds, triggerLogout]);

  return { showWarning, secondsLeft, continueSession };
}
