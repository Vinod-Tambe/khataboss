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
    const diffBalance = totalAssets - totalLiabilities;

    // To make table balanced (equal rows), pad shorter side with empty rows
    const maxRows = Math.max(assetList.length, liabilityList.length);

    return (
        <div className='border border-danger-subtle bg-green'>
            <div className="table-responsive">
                <table className="table table-hover table-bordered border-secondary mb-0" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                    <colgroup>
                        <col style={{ width: '35%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '35%' }} />
                        <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th colSpan="2" className="bg-cust-primary text-center text-brown fs-6 sticky-col">
                                Liabilities
                            </th>
                            <th colSpan="2" className="bg-cust-primary text-brown text-center fs-6 sticky-col">
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
                                    {/* Using separate table cells instead of nested divs to prevent line overlapping during PDF print */}
                                    <td className="text-start text-break pe-2" style={{ verticalAlign: 'middle' }}>
                                        {liability ? liability.name.toUpperCase() : ''}
                                    </td>
                                    <td className="text-end pe-2" style={{ verticalAlign: 'middle' }}>
                                        {liability ? liability.value.toLocaleString() : ''}
                                    </td>
                                    <td className="text-start text-break pe-2" style={{ verticalAlign: 'middle' }}>
                                        {asset ? asset.name.toUpperCase() : ''}
                                    </td>
                                    <td className="text-end pe-2" style={{ verticalAlign: 'middle' }}>
                                        {asset ? asset.value.toLocaleString() : ''}
                                    </td>
                                </tr>
                            );
                        })}

                        <tr>
                            <td style={{ height: '20vh' }}></td>
                            <td style={{ height: '20vh' }}></td>
                            <td style={{ height: '20vh' }}></td>
                            <td style={{ height: '20vh' }}></td>
                        </tr>

                        {/* Show Profit or Loss */}
                        {(diffBalance !== 0) && (
                            <tr>
                                {diffBalance > 0 ? (
                                    <>
                                        <td className="text-start fw-bold text-success pe-2" style={{ verticalAlign: 'middle' }}>NET PROFIT</td>
                                        <td className="text-end fw-bold text-success pe-2" style={{ verticalAlign: 'middle' }}>{diffBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td></td>
                                        <td></td>
                                    </>
                                ) : (
                                    <>
                                        <td></td>
                                        <td></td>
                                        <td className="text-start fw-bold text-danger pe-2" style={{ verticalAlign: 'middle' }}>NET LOSS</td>
                                        <td className="text-end fw-bold text-danger pe-2" style={{ verticalAlign: 'middle' }}>{Math.abs(diffBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </>
                                )}
                            </tr>
                        )}
                    </tbody>

                    {/* Totals row */}
                    <tfoot>
                        <tr className="fw-bold bg-red">
                            <td className="bg-red text-start pe-2">Total</td>
                            <td className="bg-red text-end pe-2">
                                {Math.max(totalLiabilities, totalAssets).toLocaleString()}
                            </td>
                            <td className="bg-red text-start pe-2">Total</td>
                            <td className="bg-red text-end pe-2">
                                {Math.max(totalLiabilities, totalAssets).toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default BalanceSheetReport;