import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import HomeRoutes from '../pages/home/HomeRoutes';
import FirmRoutes from '../pages/firm/FirmRoutes';
import UserRoutes from '../pages/user/UserRoutes';
import StaffRoutes from '../pages/staff/StaffRoutes';
import AccountRoutes from '../pages/account/AccountRoutes';
import Footer from '../layouts/Footer';
import DayBookRoutes from '../pages/daybook/DayBookRoutes';
import BookRoutes from '../pages/book/BookRoutes';
import TrialBalanceRoutes from '../pages/trial-balance/TrialBalanceRoutes';
import BalanceSheetRoutes from '../pages/balance-sheet/BalanceSheetRoutes';
import ProfitLossRoutes from '../pages/profit-loss/ProfitLossRoutes';
import LogsRoutes from '../pages/logs/LogsRoutes';
import RateRoutes from '../pages/rate/RateRoutes';
import PurityPage from '../components/purity/PurityPage';
import SmsPage from '../components/sms/SmsPage';
import MoneyLenderRoutes from '../pages/money-lender/MoneyLenderRoutes';
import FinanceRoutes from '../pages/finance/FinanceRoutes';
import LoanRoutes from '../pages/loan/LoanRoutes';
import BackupRoutes from '../pages/backup/BackupRoutes';
import OwnerProfile from '../components/owner/OwnerProfile';
import UpdatePassword from '../components/owner/UpdatePassword';
import PermissionRoute from './PermissionRoute';
import usePermissions from '../hooks/usePermissions';

const MainRoutes = () => {
  const { isOwner } = usePermissions();

  return (
    <div className="layout-wrapper">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area mt-0 mt-md-3 d-flex flex-column" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="container-fluid flex-grow-1 pb-3 pb-md-4">
            <Routes>
              <Route
                path="/firm/*"
                element={
                  <PermissionRoute anyOf={["firm.view", "firm.create", "firm.edit"]}>
                    <FirmRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/user/*"
                element={
                  <PermissionRoute anyOf={["user.view", "user.create", "user.edit", "loan.auction"]}>
                    <UserRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/staff/*"
                element={
                  <PermissionRoute anyOf={["staff.view", "staff.create", "staff.edit"]}>
                    <StaffRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/account/*"
                element={
                  <PermissionRoute anyOf={["account.view", "account.create", "account.edit"]}>
                    <AccountRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/finance/*"
                element={
                  <PermissionRoute permission="finance.view">
                    <FinanceRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/loan/*"
                element={
                  <PermissionRoute anyOf={["loan.view", "loan.release", "loan.auction", "loan.transfer"]}>
                    <LoanRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/daybook"
                element={
                  <PermissionRoute permission="reports.daybook">
                    <DayBookRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/book"
                element={
                  <PermissionRoute permission="account.view">
                    <BookRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/trial-balance"
                element={
                  <PermissionRoute permission="reports.trialBalance">
                    <TrialBalanceRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/balance-sheet"
                element={
                  <PermissionRoute permission="reports.balanceSheet">
                    <BalanceSheetRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/profit-loss"
                element={
                  <PermissionRoute permission="reports.profitLoss">
                    <ProfitLossRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/logs"
                element={
                  <PermissionRoute permission="reports.logs">
                    <LogsRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/rate"
                element={
                  <PermissionRoute permission="settings.manage">
                    <RateRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/purity"
                element={
                  <PermissionRoute permission="settings.manage">
                    <PurityPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="/sms"
                element={isOwner ? <SmsPage /> : <Navigate to="/home" replace />}
              />
              <Route
                path="/backup"
                element={
                  <PermissionRoute permission="settings.manage">
                    <BackupRoutes />
                  </PermissionRoute>
                }
              />
              <Route
                path="/money-lender/*"
                element={
                  <PermissionRoute anyOf={["moneyLender.view", "moneyLender.create", "moneyLender.edit"]}>
                    <MoneyLenderRoutes />
                  </PermissionRoute>
                }
              />
              <Route path="/profile" element={<OwnerProfile />} />
              <Route path="/settings/update-password" element={<UpdatePassword />} />
              <Route path="/*" element={< HomeRoutes />} />

            </Routes>
          </div>
          <div className="mt-auto w-100">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainRoutes;
