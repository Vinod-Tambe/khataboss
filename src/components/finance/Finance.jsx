import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import FinanceInfo from './FinanceInfo'
import FinanceHistory from './FinanceHistory'
import PaymentForm from './PaymentForm'
import CommonModal from '../common/CommonModal'
import { getFinanceDetails } from '../../api/financeApi'
import { toast } from 'react-toastify'

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

    if (!initialFinance) {
        return <div className="alert alert-warning">No finance record selected. Please go back and select a record.</div>;
    }

    return (
        <>
            <div className="row g-3">
                {view === 'info' ? (
                    <div className="col-md-12 py-3 px-3">
                        <div className="d-flex justify-content-between align-items-center mb-1 px-2">
                            <h5 className="text-primary fw-bold mb-0">Finance Information</h5>
                        </div>
                        <FinanceInfo
                            data={financeData?.finance_trans || []}
                            onPayment={handlePayment}
                            onRollback={handleRollback}
                            onHistory={handleHistory}
                            isLoading={loading}
                            financeData={financeData}
                            initialFinance={initialFinance}
                        />
                    </div>
                ) : (
                    <div className="col-md-12 py-3 px-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="text-primary fw-bold mb-0">Finance History</h5>
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={handleBackToInfo}>
                                <i className="bi bi-arrow-left me-1"></i> Back to Info
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
