import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { openLoanDetailsPage } from '../utils/openLoanDetails';

const useOpenLoanDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useCallback(
    (loan, user) => {
      if (!loan?.girv_id) {
        toast.error('Loan reference not found');
        return;
      }
      openLoanDetailsPage(navigate, dispatch, loan, user);
    },
    [navigate, dispatch]
  );
};

export default useOpenLoanDetails;
