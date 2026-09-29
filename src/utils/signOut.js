import { logoutApi } from '../api/authApi';
import { logout } from '../store/slices/authSlice';

/** Clear server session token, then local Redux/storage. */
export async function signOutUser(dispatch) {
  try {
    await logoutApi();
  } catch {
    // Session may already be invalid
  }
  dispatch(logout());
}
