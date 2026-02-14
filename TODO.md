# Authentication Implementation TODO

## Tasks:
- [x] 1. Create static user data with status, password, and OTP in authApi.js
- [x] 2. Update authApi.js to use static user data for authentication
- [ ] 3. Update LoginForm.jsx to use AuthContext for login/logout
- [ ] 4. Update App.js to use AuthContext for route protection
- [ ] 5. Add ProtectedRoute component for route security

## Implementation Details:

### 1. Static User Data Structure:
```
javascript
{
  id: string,
  loginId: string,
  password: string,
  name: string,
  email: string,
  role: 'admin' | 'user',
  status: 'active' | 'inactive',
  otp: string
}
```

### 2. Files Modified:
- src/api/authApi.js - Added static user data and updated authentication logic

### 3. Files to Modify Next:
- src/components/authentication/LoginForm.jsx - Integrate with AuthContext
- src/App.js - Use AuthContext for route protection

### 4. Next Steps:
- Test the authentication flow
- Update LoginForm.jsx
- Update App.js

## Test Credentials (Static):
| Login ID | Password | OTP | Role | Status |
|----------|----------|-----|------|--------|
| admin | admin123 | 123456 | admin | active |
| user | user123 | 654321 | user | active |
| demo | demo123 | 111111 | admin | active |
| inactive | inactive123 | 222222 | user | inactive |
