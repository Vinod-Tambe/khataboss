import React, { useRef, useEffect, useState } from 'react'
import AccountDetailsReport from './AccountDetailsReport'
import AccountDetailsPrintPreview from './AccountDetailsPrintPreview'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { useParams } from 'react-router-dom';
import { getAccountLedger } from '../../api/accountApi';
import { getFirmsDropdown } from '../../api/firmApi';
import { useSelector } from 'react-redux';

const AccountDetails = () => {
    const { uuid } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ledgerData, setLedgerData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [ledgerError, setLedgerError] = useState(null);
    const [accountNotFound, setAccountNotFound] = useState(false);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const { selectedFirmId } = useSelector((state) => state.firm);
    const [firms, setFirms] = useState([]);
    const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "N" : selectedFirmId);

    // Sync with global firm selection
    useEffect(() => {
        setSelectedFirm(selectedFirmId === 'all' ? "N" : selectedFirmId);
    }, [selectedFirmId]);

    // Default FY dates
    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;
    const fyStart = isAfterMarch
        ? moment(`${currentYear}-04-01`)
        : moment(`${currentYear - 1}-04-01`);
    const fyEnd = isAfterMarch
        ? moment(`${currentYear + 1}-03-31`)
        : moment(`${currentYear}-03-31`);

    const [startDate, setStartDate] = useState(fyStart.format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(fyEnd.format("YYYY-MM-DD"));

    const dateRef = useRef(null);

    useEffect(() => {
        const fetchFirms = async () => {
            try {
                const response = await getFirmsDropdown();
                setFirms(response.data || []);
            } catch (error) {
                console.error("Error fetching firms:", error);
            }
        };
        fetchFirms();
    }, []);

    useEffect(() => {
        const fetchLedger = async () => {
            if (!uuid || !startDate || !endDate) return;
            try {
                setLedgerLoading(true);
                setLedgerError(null);
                setAccountNotFound(false);
                const response = await getAccountLedger({
                    startDate,
                    endDate,
                    acc_id: uuid,
                    firmId: selectedFirm
                });
                setLedgerData(response.data.jurnal_trans_data || []);
                setOpeningBalance(response.data.acc_open_balanace || 0);

                if (response.data.acc_name) {
                    setAccount({
                        acc_name: response.data.acc_name,
                        acc_pre_acc: response.data.acc_pre_acc
                    });
                } else {
                    setAccount(null);
                }
            } catch (error) {
                console.error("Error fetching ledger:", error);
                setLedgerData([]);
                setOpeningBalance(0);
                setAccount(null);

                const message = error.message || 'Failed to load account ledger.';
                if (message.toLowerCase().includes('not found')) {
                    setAccountNotFound(true);
                    setLedgerError(null);
                } else {
                    setLedgerError(message);
                    setAccountNotFound(false);
                }
            } finally {
                setLedgerLoading(false);
                setLoading(false);
            }
        };

        fetchLedger();
    }, [uuid, startDate, endDate, selectedFirm]);

    useEffect(() => {
        if (!dateRef.current) return;

        const currentYear = moment().year();
        const isAfterMarch = moment().month() >= 3;

        const fyStart = isAfterMarch
            ? moment(`${currentYear}-04-01`)
            : moment(`${currentYear - 1}-04-01`);

        const fyEnd = isAfterMarch
            ? moment(`${currentYear + 1}-03-31`)
            : moment(`${currentYear}-03-31`);

        $(dateRef.current).daterangepicker(
            {
                startDate: fyStart,
                endDate: fyEnd,
                autoUpdateInput: false,
                locale: { format: "DD-MM-YYYY", cancelLabel: "Clear" },
                ranges: {
                    Today: [moment(), moment()],
                    "This Month": [
                        moment().startOf("month"),
                        moment().endOf("month"),
                    ],
                    "Last Month": [
                        moment().subtract(1, "month").startOf("month"),
                        moment().subtract(1, "month").endOf("month"),
                    ],
                    "Current Financial Year": [fyStart, fyEnd],
                    "Last Financial Year": [
                        moment(fyStart).subtract(1, "year"),
                        moment(fyEnd).subtract(1, "year"),
                    ],
                },
            },
            (start, end) => {
                $(dateRef.current).val(
                    `${start.format("DD-MM-YYYY")} - ${end.format("DD-MM-YYYY")}`
                );
                setStartDate(start.format("YYYY-MM-DD"));
                setEndDate(end.format("YYYY-MM-DD"));
            }
        );

        $(dateRef.current).val(
            `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
        );

        const dateInput = dateRef.current;
        return () => {
            $(dateInput).data("daterangepicker")?.remove();
        };
    }, []);

    const selectedFirmData = firms.find((f) => String(f.firm_id) === String(selectedFirm));
    const firmDisplayName = selectedFirm === 'N'
        ? 'All Firms'
        : (selectedFirmData?.firm_name || 'Selected Firm');

    const assessmentYear = moment(endDate).month() >= 3
        ? `${moment(endDate).year()} - ${moment(endDate).year() + 1}`
        : `${moment(endDate).year() - 1} - ${moment(endDate).year()}`;

    return (
        <div className="card p-3 pt-1 shadow-sm">
            <div className="row align-items-center mt-2">
                <div className="col-md-3 col-12 mt-2">
                    <input
                        type="text"
                        className="form-control border-dark text-center"
                        placeholder="Select Date Range"
                        ref={dateRef}
                        readOnly
                    />
                </div>
                <div className="col-md-6 mt-2 text-center">
                    <h3 className="text-brown fw-bold mb-0 responsive-text">
                        <i className="bi bi-bar-chart-line-fill me-2 responsive-text"></i>
                        Account Ledger
                    </h3>
                </div>
                <div className="col-md-3 mt-2">
                    <select 
                        className="form-select border-dark text-center"
                        value={selectedFirm}
                        onChange={(e) => setSelectedFirm(e.target.value)}
                    >
                        <option value="N">All Firms</option>
                        {firms.map(firm => (
                            <option key={firm.firm_id} value={firm.firm_id}>
                                {firm.firm_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-12 text-center">
                    <p className="pb-0 mb-0">
                        <strong className="text-info-emphasis fw-bold">FINANCIAL YEAR:</strong>{' '}
                        {moment(startDate).format("DD-MM-YYYY")} To {moment(endDate).format("DD-MM-YYYY")}
                    </p>
                    <p className="pb-0 mb-0">
                        <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
                        {moment(endDate).month() >= 3 
                            ? `${moment(endDate).year()} - ${moment(endDate).year() + 1}`
                            : `${moment(endDate).year() - 1} - ${moment(endDate).year()}`
                        }
                    </p>
                    <p>
                        <strong className="text-primary-emphasis fw-bold">
                            {accountNotFound ? (
                                'ACCOUNT NOT FOUND'
                            ) : (
                                <>
                                    ACCOUNT NAME : {loading ? 'Loading...' : (account?.acc_name || '-')} | PRIMARY ACCOUNT : {loading ? 'Loading...' : (account?.acc_pre_acc || '-')}
                                </>
                            )}
                        </strong>
                    </p>
                </div>
                <div className="col-md-12">
                    <AccountDetailsReport
                        ledgerData={ledgerData}
                        loading={ledgerLoading}
                        openingBalanceProp={openingBalance}
                        errorMessage={ledgerError}
                        accountNotFound={accountNotFound}
                    />
                </div>
            </div>
            <div className="text-center mt-3 mb-2">
                <button
                    className="btn btn-outline-success"
                    onClick={() => setIsPrintPreviewOpen(true)}
                    disabled={ledgerLoading || accountNotFound || !!ledgerError || ledgerData.length === 0}
                >
                    Print <i className="bi bi-printer-fill"></i>
                </button>
            </div>

            <AccountDetailsPrintPreview
                show={isPrintPreviewOpen}
                onHide={() => setIsPrintPreviewOpen(false)}
                ledgerData={ledgerData}
                openingBalance={openingBalance}
                firmName={firmDisplayName}
                accountName={account?.acc_name}
                primaryAccount={account?.acc_pre_acc}
                periodStart={startDate}
                periodEnd={endDate}
                assessmentYear={assessmentYear}
            />
        </div>
    )
}

export default AccountDetails
