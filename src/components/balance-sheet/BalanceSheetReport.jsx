import React from 'react';

const BalanceSheetReport = ({ balanceSheetData }) => {
    if (!balanceSheetData) {
        return <p>No data available</p>;
    }

    const { assets = [], liabilities = [] } = balanceSheetData;

    // Convert assets & liabilities into [{name, value}] format
    const formatData = (arr) =>
        arr.map((item) => {
            const key = Object.keys(item)[0];
            return { name: key, value: item[key] };
        });

    const assetList = formatData(assets);
    const liabilityList = formatData(liabilities);

    // Totals
    const totalAssets = assetList.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilityList.reduce((sum, l) => sum + l.value, 0);
    const diffBalance = totalLiabilities - totalAssets;

    // To make table balanced (equal rows), pad shorter side with empty rows
    const maxRows = Math.max(assetList.length, liabilityList.length);

    return (
        <div className='border border-danger-subtle bg-green'>
            <div className="table-responsive">
                <table className="table table-hover table-bordered border-secondary mb-0">
                    <colgroup>
                        <col style={{ width: '50%' }} />
                        <col style={{ width: '50%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th className="bg-red text-center fs-6 sticky-col">
                                Liabilities
                            </th>
                            <th className="bg-cust-primary text-center fs-6 sticky-col">
                                Assets
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: maxRows }).map((_, idx) => {
                            const liability = liabilityList[idx];
                            const asset = assetList[idx];
                            return (
                                <tr key={idx}>
                                    <td className="text-start">
                                        <div className="row">
                                            <div className="col-6 border-end">  {liability ? liability.name.toUpperCase() : ''}</div>
                                            <div className="col-6 text-end"> {liability ? liability.value.toLocaleString() : ''}</div>
                                        </div>
                                    </td>
                                    <td className="text-start">
                                        <div className="row">
                                            <div className="col-6 border-end">
                                                {asset ? asset.name.toUpperCase() : ''}
                                            </div>
                                            <div className="col-6 text-end"> {asset ? asset.value.toLocaleString() : ''}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        <tr>
                            <td style={{ height: '20vh' }}></td>
                            <td style={{ height: '20vh' }}></td>
                        </tr>

                        {/* Show Profit or Loss */}
                            <tr>
                                <td className="text-start fw-bold text-success ">  
                                    <div className="row">
                                    <div className="col-6">Net Profit</div>
                                    <div className="col-6 text-end">{diffBalance.toLocaleString()}</div>
                                </div>
                                </td>
                                <td className='text-start fw-bold text-danger '> 
                                    <div className="row">
                                    <div className="col-6">Net Loss</div>
                                    <div className="col-6 text-end">{Math.abs(diffBalance).toLocaleString()}</div>
                                </div></td>
                            </tr>
                    </tbody>

                    {/* Totals row */}
                    <tfoot>
                        <tr className="fw-bold bg-blue">
                            <td className='bg-blue'>
                                <div className="row">
                                    <div className="col-6 text-start">Total</div>
                                    <div className="col-6 text-end">
                                        {Math.max(totalLiabilities, totalAssets).toLocaleString()}
                                    </div>
                                </div>
                            </td>
                            <td className='bg-blue'>
                                <div className="row">
                                    <div className="col-6 text-start">Total</div>
                                    <div className="col-6 text-end">
                                        {Math.max(totalLiabilities, totalAssets).toLocaleString()}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default BalanceSheetReport;