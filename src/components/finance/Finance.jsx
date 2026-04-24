    import React from 'react'
    import FinanceInfo from './FinanceInfo'
    import FinanceHistory from './FinanceHistory'
    import PaymentForm from './PaymentForm'

    const Finance = () => {
        return (
            <>
                <div className="row g-3 ">
                    <div className="col-md-12">
                        <PaymentForm />
                    </div>
                    
                    <div className="col-md-12 py-3 px-3 rounded border shadow-sm">
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