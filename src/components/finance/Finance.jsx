import React from 'react'
import FinanceInfo from './FinanceInfo'
import FinanceHistory from './FinanceHistory'
import PaymentForm from './PaymentForm'

const Finance = () => {
    return (
        <>
            <div className="row g-3 ">
                <PaymentForm />
                <div className="col-md-6 border shadow-sm">
                    <h5 className="text-muted pt-1">Finance Information</h5>
                    <FinanceInfo />
                </div>
                <div className="col-md-12">
                    <FinanceHistory />
                </div>
            </div>
        </>
    )
}

export default Finance