import { setSelectedUser } from '../store/slices/userSlice';

/**
 * Navigate to customer home → loan info (same as loan list).
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {import('redux').Dispatch} dispatch
 * @param {object} loan - girvi row (must include girv_id when possible)
 * @param {object} [user] - optional customer; falls back to loan.user
 */
export function openLoanDetailsPage(navigate, dispatch, loan, user) {
  if (!loan?.girv_id) {
    return false;
  }

  const customer = user || loan.user;
  if (customer?.user_id) {
    dispatch(
      setSelectedUser({
        ...customer,
        user_id: customer.user_id,
        user_uuid: customer.user_uuid,
        user_first_name: customer.user_first_name || '',
        user_last_name: customer.user_last_name || '',
        user_mobile_no: customer.user_mobile_no || '',
      })
    );
  }

  navigate('/user/home/loan-info', {
    state: { loan },
  });
  return true;
}
