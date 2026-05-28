import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux';
import BalanceSheetReport from './BalanceSheetReport'
import moment from "moment";

import { getFirmsDropdown } from '../../api/firmApi';
import { getBalanceSheetEntries } from '../../api/balanceSheetApi';

const BalanceSheet = () => {
    const { selectedFirmId } = useSelector((state) => state.firm);
    
    // Calculate current financial year (April to March)
    const { fyStart, fyEnd, currentFY } = useMemo(() => {
        const now = moment();
        const currentYear = now.year();
        const isAfterMarch = now.month() >= 3;
        const start = isAfterMarch ? moment(`${currentYear}-04-01`) : moment(`${currentYear - 1}-04-01`);
        const end = isAfterMarch ? moment(`${currentYear + 1}-03-31`) : moment(`${currentYear}-03-31`);
        const fyString = `${start.year()}-${end.year()}`;
        return { fyStart: start, fyEnd: end, currentFY: fyString };
    }, []);

    const [selectedYear, setSelectedYear] = useState(currentFY);
    const [firms, setFirms] = useState([]);
    const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "" : selectedFirmId);
    const [balanceSheetData, setBalanceSheetData] = useState({ assets: [], liabilities: [] });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: fyStart.format("YYYY-MM-DD"),
        endDate: fyEnd.format("YYYY-MM-DD")
    });

    // Sync with global firm selection
    useEffect(() => {
        setSelectedFirm(selectedFirmId === 'all' ? "" : selectedFirmId);
    }, [selectedFirmId]);

    const fetchFirms = async () => {
        try {
            const response = await getFirmsDropdown();
            if (response.success && response.data.length > 0) {
                setFirms(response.data);
            }
        } catch (error) {
            console.error("Error fetching firms:", error);
        }
    };

    const fetchBalanceSheet = async (filters) => {
        setLoading(true);
        try {
            const response = await getBalanceSheetEntries(filters);
            if (response.success) {
                setBalanceSheetData(response.data);
            }
        } catch (error) {
            console.error("Error fetching balance sheet:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFirms();
    }, []);

    useEffect(() => {
        const filters = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            firmId: selectedFirm
        };
        fetchBalanceSheet(filters);
    }, [dateRange, selectedFirm]);

    const selectedFirmData = firms.find(f => f.firm_id === parseInt(selectedFirm));

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="card p-3 pt-1 shadow-sm">
            <div className="row align-items-center mt-2 d-print-none">
                <div className="col-md-3 mt-2">
                    <select 
                        className="form-select border-dark text-center"
                        value={selectedYear}
                        onChange={(e) => {
                            const yearVal = e.target.value;
                            setSelectedYear(yearVal);
                            const [startYear, endYear] = yearVal.split("-");
                            setDateRange({
                                startDate: `${startYear}-04-01`,
                                endDate: `${endYear}-03-31`
                            });
                        }}
                    >
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                    </select>
                </div>
                <div className="col-md-6 mt-2 text-center">
                    <h3 className="text-brown fw-bold mb-0 responsive-text">
                        <i className="bi bi-clipboard-data me-2 responsive-text"></i>
                        Balance Sheet
                    </h3>
                </div>
                <div className="col-md-3 mt-2">
                    <select 
                        className="form-select border-dark text-center"
                        value={selectedFirm}
                        onChange={(e) => setSelectedFirm(e.target.value)}
                    >
                        <option value="">All Firms</option>
                        {firms.map(firm => (
                            <option key={firm.firm_id} value={firm.firm_id}>
                                {firm.firm_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col-12 text-center">
                    {selectedFirmData && (
                        <>
                            <h4 className="text-primary-emphasis fw-bold mb-1">
                                {selectedFirmData.firm_name.toUpperCase()}
                            </h4>
                            <p className="mb-1 fw-bold text-secondary">
                                {selectedFirmData.firm_address || ""}
                            </p>
                        </>
                    )}
                    <p className="pb-0 mb-0">
                        <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
                        {moment(dateRange.startDate).format("DD-MM-YYYY")} To {moment(dateRange.endDate).format("DD-MM-YYYY")}
                    </p>
                </div>
                <div className="col-md-12 mt-3">
                    {loading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <BalanceSheetReport balanceSheetData={balanceSheetData} />
                    )}
                </div>
            </div>
            <div className="text-center mt-3 mb-2 d-print-none">
                <button className="btn btn-outline-success" onClick={handlePrint}>
                    Print <i className="bi bi-printer-fill"></i>
                </button>
            </div>
        </div>
    )
}

export default BalanceSheet
