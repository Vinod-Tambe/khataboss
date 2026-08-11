import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FinanceInfo from './FinanceInfo'
import FinanceHistory from './FinanceHistory'
import PaymentForm from './PaymentForm'
import CommonModal from '../common/CommonModal'
import { getFinanceDetails } from '../../api/financeApi'
import { toast } from 'react-toastify'
import { getStatusBadgeMeta } from '../../utils/listFormatters'
import '../../css/Finance.css'

const Finance = () => {
    const location = useLocation();
    const navigate = useNavigate();
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

    const handlePaidFine = () => {
        setModalConfig({ title: 'Paid Fine / Collect', type: 'FINE' });
        setShowModal(true);
    };

    const handlePayInterest = () => {
        setModalConfig({ title: 'Pay Interest', type: 'INTEREST' });
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
                        <div className="finance-page__header d-flex justify-content-between align-items-center mb-2 px-1 px-md-2">
                            <div>
                                <h5 className="finance-page__title text-primary fw-bold mb-0">Finance Information</h5>
                                {(customerName || initialFinance?.fin_id) && (
                                    <p className="finance-page__subtitle d-md-none mb-0">
                                        {customerName && <span>{customerName}</span>}
                                        {customerName && (financeData?.fin_unique_code || initialFinance?.fin_unique_code || initialFinance?.fin_id) ? ' · ' : ''}
                                        {financeData?.fin_unique_code || initialFinance?.fin_unique_code || (initialFinance?.fin_id ? `Fin #${initialFinance.fin_id}` : '')}
                                    </p>
                                )}
                            </div>
                            <div className="d-flex align-items-stretch gap-2" style={{ height: '36px' }}>
                                <span className="badge bg-primary-subtle border border-primary text-primary fw-bold fs-6 px-3 d-inline-flex align-items-center">
                                    {financeData?.fin_unique_code || initialFinance?.fin_unique_code || (initialFinance?.fin_id ? `FIN-${initialFinance.fin_id}` : '')}
                                </span>
                                {(() => {
                                    const finStatus = financeData?.fin_status || initialFinance?.fin_status || 'ACTIVE';
                                    const { label, icon, className } = getStatusBadgeMeta(finStatus);
                                    return (
                                        <span className={`${className} loan-info-header-badge shadow-sm px-3 d-inline-flex align-items-center`}>
                                            <i className={`bi ${icon} me-2 fs-6`}></i>
                                            <h6 className="mb-0 fw-bold fs-6">{label}</h6>
                                        </span>
                                    );
                                })()}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary px-3 d-inline-flex align-items-center"
                                    onClick={() =>
                                        navigate(
                                            `/user/home/edit-finance/${financeData?.fin_id || initialFinance?.fin_id}`,
                                            { state: { finance: financeData || initialFinance } }
                                        )
                                    }
                                    title="Update finance"
                                >
                                    <i className="bi bi-pencil-square me-1"></i> Edit
                                </button>
                            </div>
                        </div>
                        <FinanceInfo
                            data={financeData?.finance_trans || []}
                            onPayment={handlePayment}
                            onRollback={handleRollback}
                            onClose={handleClosePayment}
                            onPaidFine={handlePaidFine}
                            onPayInterest={handlePayInterest}
                            onHistory={handleHistory}
                            isLoading={loading}
                            financeData={financeData}
                            initialFinance={initialFinance}
                        />
                    </div>
                ) : (
                    <div className="col-md-12 py-2 py-md-3 px-2 px-md-3">
                        <div className="finance-page__header d-flex justify-content-between align-items-center mb-2 gap-2 px-1 px-md-0">
                            <div>
                                <h5 className="finance-page__title text-primary fw-bold mb-0">Finance History</h5>
                                {(customerName || initialFinance?.fin_id) && (
                                    <p className="finance-page__subtitle d-md-none mb-0">
                                        {customerName && <span>{customerName}</span>}
                                        {customerName && (financeData?.fin_unique_code || initialFinance?.fin_unique_code || initialFinance?.fin_id) ? ' · ' : ''}
                                        {financeData?.fin_unique_code || initialFinance?.fin_unique_code || (initialFinance?.fin_id ? `Fin #${initialFinance.fin_id}` : '')}
                                    </p>
                                )}
                            </div>
                            <div className="d-flex align-items-stretch gap-2" style={{ height: '36px' }}>
                                <span className="badge bg-primary-subtle border border-primary text-primary fw-bold fs-6 px-3 d-inline-flex align-items-center">
                                    {financeData?.fin_unique_code || initialFinance?.fin_unique_code || (initialFinance?.fin_id ? `FIN-${initialFinance.fin_id}` : '')}
                                </span>
                                {(() => {
                                    const finStatus = financeData?.fin_status || initialFinance?.fin_status || 'ACTIVE';
                                    const { label, icon, className } = getStatusBadgeMeta(finStatus);
                                    return (
                                        <span className={`${className} loan-info-header-badge shadow-sm px-3 d-inline-flex align-items-center`}>
                                            <i className={`bi ${icon} me-2 fs-6`}></i>
                                            <h6 className="mb-0 fw-bold fs-6">{label}</h6>
                                        </span>
                                    );
                                })()}
                                <button className="btn btn-sm btn-outline-secondary px-3 finance-page__back d-inline-flex align-items-center justify-content-center" onClick={handleBackToInfo}>
                                    <i className="bi bi-arrow-left me-1 fs-6"></i> Back
                                </button>
                            </div>
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
