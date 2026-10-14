import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useIdleSessionGuard } from '../../hooks/useIdleSessionGuard';
import { signOutUser } from '../../utils/signOut';
import { parseIdleTimeoutMinutes } from '../../utils/idleSession';
import IdleSessionModal from './IdleSessionModal';

/** Idle timeout + countdown for authenticated owner/staff app shell. */
const IdleSessionGuard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const idleMinutes = useMemo(
    () => parseIdleTimeoutMinutes(user?.own_idle_timeout_min),
    [user?.own_idle_timeout_min]
  );

  const handleLogout = useCallback(async () => {
    await signOutUser(dispatch);
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  const { showWarning, secondsLeft, continueSession } = useIdleSessionGuard({
    enabled: true,
    idleMs: idleMinutes * 60 * 1000,
    onLogout: handleLogout,
  });

  return (
    <IdleSessionModal
      show={showWarning}
      secondsLeft={secondsLeft}
      idleMinutes={idleMinutes}
      onContinue={continueSession}
    />
  );
};

export default IdleSessionGuard;
