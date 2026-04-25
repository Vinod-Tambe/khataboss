import React, { useState } from 'react'
import FinanceInfo from './FinanceInfo'
import FinanceHistory from './FinanceHistory'
import PaymentForm from './PaymentForm'
import CommonModal from '../common/CommonModal'

const Finance = () => {
    const [view, setView] = useState('info'); // 'info' or 'history'
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', type: '' });

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

    return (
        <>
            <div className="row g-3">
                {view === 'info' ? (
                    <div className="col-md-12 py-3 px-3 rounded border shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                            <h5 className="text-primary fw-bold mb-0">Finance Information</h5>
                        </div>
                        <FinanceInfo
                            onPayment={handlePayment}
                            onRollback={handleRollback}
                            onHistory={handleHistory}
                        />
                    </div>
                ) : (
                    <div className="col-md-12 py-3 px-3 rounded border shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="text-primary fw-bold mb-0">Finance History</h5>
                            <button className="btn btn-sm btn-outline-secondary px-3" onClick={handleBackToInfo}>
                                <i className="bi bi-arrow-left me-1"></i> Back to Info
                            </button>
                        </div>
                        <FinanceHistory />
                    </div>
                )}
            </div>

            <CommonModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title={modalConfig.title}
            >
                <PaymentForm initialType={modalConfig.type} />
            </CommonModal>
        </>
    )
}

    export default Finance