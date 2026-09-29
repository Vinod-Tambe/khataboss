import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useIdleSessionGuard } from '../../hooks/useIdleSessionGuard';
import { signOutUser } from '../../utils/signOut';
import IdleSessionModal from './IdleSessionModal';

/** Idle timeout + countdown for authenticated owner/staff app shell. */
const IdleSessionGuard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await signOutUser(dispatch);
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  const { showWarning, secondsLeft, continueSession } = useIdleSessionGuard({
    enabled: true,
    onLogout: handleLogout,
  });

  return (
    <IdleSessionModal show={showWarning} secondsLeft={secondsLeft} onContinue={continueSession} />
  );
};

export default IdleSessionGuard;
