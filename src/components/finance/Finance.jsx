import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import FinanceInfo from './FinanceInfo'
import FinanceHistory from './FinanceHistory'
import PaymentForm from './PaymentForm'
import CommonModal from '../common/CommonModal'
import { getFinanceDetails } from '../../api/financeApi'
import { toast } from 'react-toastify'
import '../../css/Finance.css'

const Finance = () => {
    const location = useLocation();
    const initialFinance = location.state?.finance;

    const [view, setView] = useState('info'); // 'info' or 'history'
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', type: '' });
    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!initialFinance?.fin_id) return;
        try {
            setLoading(true);
            const response = await getFinanceDetails(initialFinance.fin_id);
            setFinanceData(response.data);
        } catch (error) {
            console.error("Error fetching finance details:", error);
            toast.error("Failed to load finance details");
        } finally {
            setLoading(false);
        }
    }, [initialFinance?.fin_id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handlePayment = () => {
        setModalConfig({ title: 'Finance Payment', type: 'PAID' });
        setShowModal(true);
    };

    const handleRollback = () => {
        setModalConfig({ title: 'Finance Rollback', type: 'ROLLBACK' });
        setShowModal(true);
    };

    const handleClosePayment = () => {
        setModalConfig({ title: 'Close Finance', type: 'CLOSE' });
        setShowModal(true);
    };

    const handleHistory = () => {
        setView('history');
    };

    const handleBackToInfo = () => {
        setView('info');
    };

    const handlePaymentSuccess = () => {
        setShowModal(false);
        fetchDetails(); // Refresh data after payment
    };

    const customerName = initialFinance?.user?.user_first_name
        ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ''}`.trim()
        : '';

    if (!initialFinance) {
        return <div className="alert alert-warning">No finance record selected. Please go back and select a record.</div>;
    }

    return (
        <>
            <div className="row g-3 finance-page">
                {view === 'info' ? (
                    <div className="col-md-12 py-2 py-md-3 px-2 px-md-3">
                        <div className="finance-page__header d-flex justify-content-between align-items-start mb-1 px-1 px-md-2">
                            <div>
                                <h5 className="finance-page__title text-primary fw-bold mb-0">Finance Information</h5>
                                {(customerName || initialFinance?.fin_id) && (
                                    <p className="finance-page__subtitle d-md-none">
                                        {customerName && <span>{customerName}</span>}
                                        {customerName && initialFinance?.fin_id ? ' · ' : ''}
                                        {initialFinance?.fin_id ? `Fin #${initialFinance.fin_id}` : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                            <FinanceInfo
                                data={financeData?.finance_trans || []}
                                onPayment={handlePayment}
                                onRollback={handleRollback}
                                onClose={handleClosePayment}
                                onHistory={handleHistory}
                            isLoading={loading}
                            financeData={financeData}
                            initialFinance={initialFinance}
                        />
                    </div>
                ) : (
                    <div className="col-md-12 py-2 py-md-3 px-2 px-md-3">
                        <div className="finance-page__header d-flex justify-content-between align-items-start mb-2 gap-2 px-1 px-md-0">
                            <div>
                                <h5 className="finance-page__title text-primary fw-bold mb-0">Finance History</h5>
                                {(customerName || initialFinance?.fin_id) && (
                                    <p className="finance-page__subtitle d-md-none">
                                        {customerName && <span>{customerName}</span>}
                                        {customerName && initialFinance?.fin_id ? ' · ' : ''}
                                        {initialFinance?.fin_id ? `Fin #${initialFinance.fin_id}` : ''}
                                    </p>
                                )}
                            </div>
                            <button className="btn btn-sm btn-outline-secondary px-3 finance-page__back" onClick={handleBackToInfo}>
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        </div>
                        <FinanceHistory
                            data={financeData?.finance_money_trans || []}
                            isLoading={loading}
                            financeData={financeData}
                            initialFinance={initialFinance}
                        />
                    </div>
                )}
            </div>

            <CommonModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title={modalConfig.title}
                size="lg"
            >
                <PaymentForm
                    initialType={modalConfig.type}
                    finance={financeData}
                    onSuccess={handlePaymentSuccess}
                />
            </CommonModal>
        </>
    )
}

export default Finance
