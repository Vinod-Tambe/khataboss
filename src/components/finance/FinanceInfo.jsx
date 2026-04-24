import React, { useState, useMemo } from 'react';

const FinanceInfo = ({ data: externalData }) => {
    // Mock data for fallback or demonstration
    const mockData = [
        { id: 1, emiNo: 1, startDate: '01-04-2026', emiAmt: 5000, dueDate: '01-05-2026', paidAmt: 5000, pendingAmt: 0, status: 'Paid' },
        { id: 2, emiNo: 2, startDate: '01-05-2026', emiAmt: 5000, dueDate: '01-06-2026', paidAmt: 2500, pendingAmt: 2500, status: 'Paid' },
        { id: 3, emiNo: 3, startDate: '01-06-2026', emiAmt: 5000, dueDate: '01-07-2026', paidAmt: 0, pendingAmt: 5000, status: 'Paid' },
        { id: 4, emiNo: 4, startDate: '01-07-2026', emiAmt: 5000, dueDate: '01-08-2026', paidAmt: 0, pendingAmt: 5000, status: 'Partial' },
        { id: 5, emiNo: 5, startDate: '01-08-2026', emiAmt: 5000, dueDate: '01-09-2026', paidAmt: 0, pendingAmt: 5000, status: 'Deu' },
        { id: 6, emiNo: 6, startDate: '01-09-2026', emiAmt: 5000, dueDate: '01-10-2026', paidAmt: 0, pendingAmt: 5000, status: 'Deu' },
        { id: 7, emiNo: 7, startDate: '01-10-2026', emiAmt: 5000, dueDate: '01-11-2026', paidAmt: 0, pendingAmt: 5000, status: 'Deu' },
        { id: 8, emiNo: 8, startDate: '01-11-2026', emiAmt: 5000, dueDate: '01-12-2026', paidAmt: 0, pendingAmt: 5000, status: 'Deu' },
    ];

    const data = externalData || mockData;

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Search and Filter Logic
    const filteredData = useMemo(() => {
        return data.filter(item =>
            (item.emiNo?.toString() || '').includes(searchQuery) ||
            (item.startDate?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.dueDate?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.emiAmt?.toString() || '').includes(searchQuery)
        );
    }, [data, searchQuery]);

    // Totals Calculation
    const totals = useMemo(() => {
        return filteredData.reduce((acc, current) => {
            acc.emiAmt += (parseFloat(current.emiAmt) || 0);
            acc.paidAmt += (parseFloat(current.paidAmt) || 0);
            acc.pendingAmt += (parseFloat(current.pendingAmt) || 0);
            return acc;
        }, { emiAmt: 0, paidAmt: 0, pendingAmt: 0 });
    }, [filteredData]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNo) => {
        if (pageNo >= 1 && pageNo <= totalPages) {
            setCurrentPage(pageNo);
        }
    };

    return (
        <div className="card border-0 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center">
                    <span className="me-2 text-muted small">Show</span>
                    <select
                        className="form-select form-select-sm w-auto border-secondary-subtle"
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="ms-2 text-muted small">Entries</span>
                </div>
                <div className="ms-auto" style={{ minWidth: '200px' }}>
                    <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white border-secondary-subtle">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-secondary-subtle"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light border text-muted">
                        <tr>
                            <th className="fw-semibold border">EMI No</th>
                            <th className="fw-semibold border">Start Date</th>
                            <th className="fw-semibold  border">EMI Amt</th>
                            <th className="fw-semibold   border">Due Date</th>
                            <th className="fw-semibold  border">Paid Amt</th>
                            <th className="fw-semibold  border">Pending Amt</th>
                            <th className="fw-semibold  text-center border">Status</th>
                            <th className="fw-semibold text-center border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="fw-bold text-dark">{item.emiNo}</td>
                                    <td className="text-secondary">{item.startDate}</td>
                                    <td className=" fw-medium text-dark">₹ {(item.emiAmt || 0).toLocaleString()}</td>
                                    <td className="">{item.dueDate}</td>
                                    <td className=" text-success">₹ {(item.paidAmt || 0).toLocaleString()}</td>
                                    <td className=" text-danger">₹ {(item.pendingAmt || 0).toLocaleString()}</td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill ${item.status === 'Paid' ? 'bg-success-subtle text-success' :
                                            item.status === 'Partial' ? 'bg-warning-subtle text-warning' :
                                                'bg-danger-subtle text-danger'
                                            }`} style={{ fontSize: '0.75rem' }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className='text-center'>
                                        <button className="btn btn-sm btn-link text-warning p-0" title="Print Receipt">
                                            <i className="bi bi-printer-fill fs-5"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">No records found</td>
                            </tr>
                        )}
                    </tbody>
                    {filteredData.length > 0 && (
                        <tfoot className="table-light">
                            <tr className="fw-bold">
                                <td colSpan="2" className="text-center text-dark">Grand Total</td>
                                <td className=" text-primary">₹ {totals.emiAmt.toLocaleString()}</td>
                                <td></td>
                                <td className=" text-success">₹ {totals.paidAmt.toLocaleString()}</td>
                                <td className=" text-danger">₹ {totals.pendingAmt.toLocaleString()}</td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                <div className="text-muted small">
                    Showing {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                </div>
                {totalPages > 1 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    <i className="bi bi-chevron-left small"></i>
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    <i className="bi bi-chevron-right small"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default FinanceInfo;