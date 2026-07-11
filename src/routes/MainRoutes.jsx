import { Routes, Route } from 'react-router-dom';
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
const MainRoutes = () => {

  return (
    <div className="layout-wrapper">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area mt-0 mt-md-3 d-flex flex-column" style={{ minHeight: 'calc(100vh - 50px)' }}>
          <div className="container-fluid flex-grow-1 pb-4">
            <Routes>
              <Route path="/firm/*" element={< FirmRoutes />} />
              <Route path="/user/*" element={< UserRoutes />} />
              <Route path="/staff/*" element={< StaffRoutes />} />
              <Route path="/account/*" element={< AccountRoutes />} />
              <Route path="/daybook" element={< DayBookRoutes />} />
              <Route path="/book" element={< BookRoutes />} />
              <Route path="/trial-balance" element={< TrialBalanceRoutes />} />
              <Route path="/balance-sheet" element={< BalanceSheetRoutes />} />
              <Route path="/profit-loss" element={< ProfitLossRoutes />} />
              <Route path="/logs" element={< LogsRoutes />} />
              <Route path="/rate" element={< RateRoutes />} />
              <Route path="/*" element={< HomeRoutes />} />
            </Routes>
          </div >
          <div className="mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainRoutes;