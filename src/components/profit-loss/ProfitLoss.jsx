import React, { useRef, useEffect, useState, useMemo } from 'react'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import CapitalAccount from './CapitalAccount';
import ProfitLossAccount from './ProfitLossAccount';
import TradingAccount from './TradingAccount';
import ProfitLossPrintPreview from './ProfitLossPrintPreview';

const COMPANY_NAME = 'TAHLKA FINANCE & COMPANY, MAHESH SHARMA WARD NO 18, RAJGARH CHURU';

const ProfitLoss = () => {
    const dateRef = useRef(null);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [selectedFirm, setSelectedFirm] = useState('Ram');

    const { fyStart, fyEnd } = useMemo(() => {
        const currentYear = moment().year();
        const isAfterMarch = moment().month() >= 3;
        const start = isAfterMarch
            ? moment(`${currentYear}-04-01`)
            : moment(`${currentYear - 1}-04-01`);
        const end = isAfterMarch
            ? moment(`${currentYear + 1}-03-31`)
            : moment(`${currentYear}-03-31`);
        return { fyStart: start, fyEnd: end };
    }, []);

    const [dateRange, setDateRange] = useState({
        startDate: fyStart.format('YYYY-MM-DD'),
        endDate: fyEnd.format('YYYY-MM-DD'),
    });

    const assessmentYear = useMemo(() => {
        const startYear = moment(dateRange.startDate).year();
        const endYear = moment(dateRange.endDate).year();
        return `${startYear} - ${endYear}`;
    }, [dateRange]);

    useEffect(() => {
        if (!dateRef.current) return;

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
                setDateRange({
                    startDate: start.format('YYYY-MM-DD'),
                    endDate: end.format('YYYY-MM-DD'),
                });
            }
        );

        $(dateRef.current).val(
            `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
        );

        const dateInput = dateRef.current;
        return () => {
            $(dateInput).data("daterangepicker")?.remove();
        };
    }, [fyStart, fyEnd]);

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
                        Profit & Loss
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
                    <select
                        className="form-select border-dark text-center"
                        value={selectedFirm}
                        onChange={(e) => setSelectedFirm(e.target.value)}
                    >
                        <option disabled value="">Select Firm</option>
                        <option value="Ram">Ram</option>
                        <option value="Sham">Sham</option>
                    </select>
                </div>
                <div className="col-12 text-center">
                    <p className="pb-0 mb-0">
                        <strong className="text-info-emphasis fw-bold">FINANCIAL YEAR:</strong>{' '}
                        {moment(dateRange.startDate).format('DD-MM-YYYY')} To {moment(dateRange.endDate).format('DD-MM-YYYY')}
                    </p>
                    <p className="pb-0 mb-0">
                        <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
                        {assessmentYear}
                    </p>
                    <p>
                        <strong className="text-primary-emphasis fw-bold">
                            {COMPANY_NAME}
                        </strong>
                    </p>
                </div>
                <div className="col-12">
                    <div className="mb-2">
                        <TradingAccount />
                    </div>
                    <div className="mb-2">
                        <ProfitLossAccount />
                    </div>
                    <div className="mb-2">
                        <CapitalAccount />
                    </div>
                    <div className="text-center mt-3 mb-2">
                        <button
                            className="btn btn-outline-success"
                            onClick={() => setIsPrintPreviewOpen(true)}
                        >
                            Print <i className="bi bi-printer-fill"></i>
                        </button>
                    </div>
                </div>
            </div>

            <ProfitLossPrintPreview
                show={isPrintPreviewOpen}
                onHide={() => setIsPrintPreviewOpen(false)}
                firmName={selectedFirm}
                companyName={COMPANY_NAME}
                periodStart={dateRange.startDate}
                periodEnd={dateRange.endDate}
                assessmentYear={assessmentYear}
            />
        </div>
    )
}

export default ProfitLoss
