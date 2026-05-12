import React, { useRef, useEffect, useState } from 'react'
import AccountDetailsReport from './AccountDetailsReport'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { useParams } from 'react-router-dom';
import { getAccountLedger } from '../../api/accountApi';

const AccountDetails = () => {
    const { uuid } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ledgerData, setLedgerData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [ledgerLoading, setLedgerLoading] = useState(false);

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
        const fetchLedger = async () => {
            if (!uuid || !startDate || !endDate) return;
            try {
                setLedgerLoading(true);
                const response = await getAccountLedger({
                    startDate,
                    endDate,
                    acc_id: uuid // Use UUID directly
                });
                setLedgerData(response.data.jurnal_trans_data || []);
                setOpeningBalance(response.data.acc_open_balanace || 0);
                
                // Set account info from ledger response
                if (response.data.acc_name) {
                    setAccount({
                        acc_name: response.data.acc_name,
                        acc_pre_acc: response.data.acc_pre_acc
                    });
                }
            } catch (error) {
                console.error("Error fetching ledger:", error);
            } finally {
                setLedgerLoading(false);
                setLoading(false);
            }
        };

        fetchLedger();
    }, [uuid, startDate, endDate]);

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

        // Set default value
        $(dateRef.current).val(
            `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
        );



        const dateInput = dateRef.current;
        return () => {
            $(dateInput).data("daterangepicker")?.remove();
        };
    }, []);
    return (
        <div className="card p-3 pt-1 shadow-sm">
            <div className="row align-items-center mt-2">
                <div className="col-md-3 d-none d-md-flex mt-2">
                    <input
                        type="text"
                        className="form-control border-dark text-center"
                        placeholder="Select Date Range"
                        ref={dateRef}
                    />
                </div>
                <div className="col-md-6 mt-2 text-center">
                    <h3 className="text-brown fw-bold mb-0 responsive-text">
                        <i className="bi bi-bar-chart-line-fill me-2 responsive-text"></i>
                        Account Ledger
                    </h3>
                </div>
                <div className="col-md-3 d-md-none mt-2">
                    <input
                        type="text"
                        className="form-control border-dark text-center"
                        placeholder="Select Date Range"
                        readOnly
                    />
                </div>
                <div className="col-md-3 mt-2">
                    <select className="form-select border-dark text-center">
                        <option disabled>Select Firm</option>
                        <option value="CR">Ram</option>
                        <option value="DR">Sham</option>
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
                            ACCOUNT NAME : {loading ? 'Loading...' : account?.acc_name} | PRIMARY ACCOUNT : {loading ? 'Loading...' : account?.acc_pre_acc}
                        </strong>
                    </p>
                </div>
                <div className="col-md-12">
                    <AccountDetailsReport ledgerData={ledgerData} loading={ledgerLoading} openingBalanceProp={openingBalance} />
                </div>
            </div>
            <div className="text-center mt-3 mb-2 no-print">
                <button className="btn btn-outline-success" onClick={() => window.print()}>
                    Print <i className="bi bi-printer-fill"></i>
                </button>
            </div>
        </div>
    )
}

export default AccountDetails
