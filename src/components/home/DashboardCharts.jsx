import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';

const EMPTY_PERIOD = { categories: [], counts: [] };

const LOAN_PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
const FINANCE_PIE_COLORS = ['#10b981', '#ef4444'];

const resolveDashboardChartFont = () => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (w >= 1920) return { sm: 13, base: 14, md: 15, lg: 17 };
  if (w >= 1400) return { sm: 12, base: 13, md: 14, lg: 16 };
  if (w >= 992) return { sm: 11, base: 12, md: 13, lg: 15 };
  return { sm: 10, base: 11, md: 12, lg: 13 };
};

const useDashboardChartFont = () => {
  const [chartFont, setChartFont] = useState(resolveDashboardChartFont);
  useEffect(() => {
    const onResize = () => setChartFont(resolveDashboardChartFont());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return chartFont;
};

const formatCountLabel = (value) => {
  const num = Number(value) || 0;
  return num > 0 ? String(num) : '';
};

/** Integer count charts — avoid Apex nice-scale + round() duplicate 0/1 labels. */
const resolveCountYAxisScale = (counts) => {
  const peak = (counts || []).reduce((m, v) => Math.max(m, Number(v) || 0), 0);
  if (peak <= 0) {
    return { min: 0, max: 5, tickAmount: 5 };
  }
  if (peak <= 5) {
    return { min: 0, max: 5, tickAmount: 5 };
  }
  if (peak <= 10) {
    return { min: 0, max: 10, tickAmount: 5 };
  }
  if (peak <= 50) {
    return { min: 0, max: Math.ceil(peak / 5) * 5, tickAmount: 5 };
  }
  const padded = Math.ceil(peak * 1.1);
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const max = Math.ceil(padded / magnitude) * magnitude;
  return { min: 0, max, tickAmount: 5 };
};

const formatYAxisCount = (value) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? String(n) : '';
};

const ChartSummary = ({ items }) => (
  <div className="dashboard-chart-summary">
    {items.map((item) => (
      <span
        key={item.label}
        className="dashboard-chart-summary__item"
        style={{ '--summary-accent': item.color }}
      >
        <span className="dashboard-chart-summary__dot" />
        <span className="dashboard-chart-summary__label">{item.label}</span>
        <strong className="dashboard-chart-summary__value">{item.value}</strong>
      </span>
    ))}
  </div>
);

const PeriodSelect = ({ value, onChange }) => (
  <select
    className="form-select form-select-sm w-auto shadow-none border bg-light dashboard-chart-select"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Chart period"
  >
    <option value="day">Day (last 5)</option>
    <option value="month">Month (last 5)</option>
    <option value="year">Year (last 5)</option>
  </select>
);

const DashboardCharts = ({ charts, loading }) => {
  const chartFont = useDashboardChartFont();
  const { theme } = useTheme();
  const isBrandDark = theme === 'brand-dark';
  const isFintech = theme === 'fintech';
  const isDark = theme === 'dark' || isBrandDark;
  const chartLabelColor = isBrandDark ? '#c4a8b8' : isDark ? '#94a3b8' : '#64748b';
  const chartTheme = isDark ? 'dark' : 'light';
  const chartValueColor = isBrandDark ? '#fce7f3' : isDark ? '#f1f5f9' : '#0f172a';
  const chartGridColor = isBrandDark ? '#3d2448' : isDark ? '#334155' : '#e2e8f0';

  const loanColor = isBrandDark ? '#f472b6' : isFintech ? '#2563eb' : '#3b82f6';
  const financeColor = isBrandDark ? '#c4b5fd' : isFintech ? '#06b6d4' : '#10b981';

  const [loanPeriod, setLoanPeriod] = useState('month');
  const [financePeriod, setFinancePeriod] = useState('month');

  const loanAudit = charts?.loanAudit || {};
  const financeAudit = charts?.financeAudit || {};
  const loanLast = charts?.loanLast || {};
  const financeLast = charts?.financeLast || {};

  const loanPeriodData = loanLast[loanPeriod] || EMPTY_PERIOD;
  const financePeriodData = financeLast[financePeriod] || EMPTY_PERIOD;

  const baseChartOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'inherit',
        animations: { enabled: !loading, easing: 'easeinout', speed: 600 },
      },
      theme: { mode: chartTheme },
      grid: {
        show: true,
        borderColor: chartGridColor,
        strokeDashArray: 4,
        padding: { left: 8, right: 8 },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: `${chartFont.md}px`,
        fontWeight: 600,
        labels: { colors: chartLabelColor },
        markers: { width: 10, height: 10, radius: 3 },
        offsetY: 4,
      },
      tooltip: { theme: chartTheme },
    }),
    [chartFont.md, chartGridColor, chartLabelColor, chartTheme, loading]
  );

  const buildPieOptions = useCallback(
    (labels, colors) => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'pie' },
      labels,
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
          const count = opts.w.config.series[opts.seriesIndex];
          return count > 0 ? `${Math.round(val)}%\n(${count})` : '';
        },
        style: {
          fontSize: `${chartFont.sm}px`,
          fontWeight: 700,
          colors: ['#ffffff'],
        },
        dropShadow: { enabled: false },
      },
      stroke: { width: 2, colors: [isDark ? '#1e293b' : '#ffffff'] },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (value) => `${Number(value || 0)} account(s)`,
        },
      },
    }),
    [baseChartOptions, chartFont.sm, isDark]
  );

  const loanPieSeries = useMemo(() => {
    const series = loanAudit.series || [];
    return series.length ? series : [0, 0, 0, 0];
  }, [loanAudit.series]);

  const loanPieLabels = useMemo(() => {
    if (loanAudit.labels?.length) return loanAudit.labels;
    return ['Active Loans', 'Auction Loans', 'Release Loans', 'Transfer Loans'];
  }, [loanAudit.labels]);

  const financePieSeries = useMemo(() => {
    const series = financeAudit.series || [];
    return series.length ? series : [0, 0];
  }, [financeAudit.series]);

  const financePieLabels = useMemo(() => {
    if (financeAudit.labels?.length) return financeAudit.labels;
    return ['Active Finance', 'Close Finance'];
  }, [financeAudit.labels]);

  const loanPieOptions = useMemo(
    () => buildPieOptions(loanPieLabels, LOAN_PIE_COLORS),
    [buildPieOptions, loanPieLabels]
  );

  const financePieOptions = useMemo(
    () => buildPieOptions(financePieLabels, FINANCE_PIE_COLORS),
    [buildPieOptions, financePieLabels]
  );

  const buildColumnOptions = useCallback((categories, barColor, yTitle, seriesCounts = []) => {
    const yScale = resolveCountYAxisScale(seriesCounts);
    return {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '55%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: formatCountLabel,
      offsetY: -18,
      style: {
        fontSize: `${chartFont.sm}px`,
        fontWeight: 700,
        colors: [chartValueColor],
      },
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: categories || [],
      labels: {
        style: { colors: chartLabelColor, fontSize: `${chartFont.sm}px`, fontWeight: 600 },
        rotate: -25,
        trim: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: yScale.min,
      max: yScale.max,
      forceNiceScale: false,
      tickAmount: yScale.tickAmount,
      decimalsInFloat: 0,
      labels: {
        style: { colors: chartLabelColor, fontSize: `${chartFont.sm}px` },
        formatter: formatYAxisCount,
      },
      title: {
        text: yTitle,
        style: { color: chartLabelColor, fontSize: `${chartFont.sm}px`, fontWeight: 600 },
      },
    },
    colors: [barColor],
    legend: { show: false },
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (value) => `${Number(value || 0)} new account(s)` },
    },
  };
  }, [baseChartOptions, chartFont, chartLabelColor, chartValueColor]);

  const loanColumnOptions = useMemo(
    () => buildColumnOptions(loanPeriodData.categories, loanColor, 'New loans', loanPeriodData.counts),
    [buildColumnOptions, loanColor, loanPeriodData.categories, loanPeriodData.counts]
  );

  const financeColumnOptions = useMemo(
    () => buildColumnOptions(
      financePeriodData.categories,
      financeColor,
      'New finance',
      financePeriodData.counts
    ),
    [buildColumnOptions, financeColor, financePeriodData.categories, financePeriodData.counts]
  );

  const loanPeriodHasData = (loanPeriodData.counts || []).some((v) => Number(v) > 0);
  const financePeriodHasData = (financePeriodData.counts || []).some((v) => Number(v) > 0);

  const loanHasPie = loanPieSeries.some((v) => Number(v) > 0);
  const financeHasPie = financePieSeries.some((v) => Number(v) > 0);

  if (loading && !charts) {
    return (
      <div className="mb-4 mt-4 text-center text-muted py-5">
        <div className="spinner-border spinner-border-sm me-2" role="status" />
        Loading dashboard charts…
      </div>
    );
  }

  return (
    <div className="mb-4 mt-4">
      <div className="dashboard-graphs">
        <div className="graph-card border-0">
          <div className="graph-card__header">
            <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">Loan Audit</h5>
            <p className="text-muted small mb-2">Loan counts by status (pie chart)</p>
            <ChartSummary
              items={[
                { label: 'Total', value: loanAudit.total ?? 0, color: loanColor },
                { label: 'Active', value: loanAudit.active ?? 0, color: LOAN_PIE_COLORS[0] },
                { label: 'Auction', value: loanAudit.auction ?? 0, color: LOAN_PIE_COLORS[1] },
                { label: 'Release', value: loanAudit.released ?? 0, color: LOAN_PIE_COLORS[2] },
                { label: 'Transfer', value: loanAudit.transfer ?? 0, color: LOAN_PIE_COLORS[3] },
              ]}
            />
          </div>
          <div className="graph-content">
            {!loanHasPie ? (
              <p className="text-muted text-center py-5 mb-0">No loan data yet.</p>
            ) : (
              <div className="graph-content__inner">
                <Chart
                  key={`loan-pie-${theme}-${loading}`}
                  options={loanPieOptions}
                  series={loanPieSeries}
                  type="pie"
                  height={300}
                  width="100%"
                />
              </div>
            )}
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="graph-card__header graph-card__header--bar">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">
                  Last Loan Audit
                </h5>
                <p className="text-muted small mb-0">New loans opened — last 5 periods</p>
              </div>
              <PeriodSelect value={loanPeriod} onChange={setLoanPeriod} />
            </div>
          </div>
          <div className="graph-content">
            {!loanPeriodHasData ? (
              <p className="text-muted text-center py-5 mb-0">No loans in selected periods.</p>
            ) : (
              <Chart
                key={`loan-col-${theme}-${loanPeriod}-${loading}`}
                options={loanColumnOptions}
                series={[{ name: 'Loans', data: loanPeriodData.counts }]}
                type="bar"
                height={300}
              />
            )}
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="graph-card__header">
            <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">Finance Audit</h5>
            <p className="text-muted small mb-2">Finance counts by status (pie chart)</p>
            <ChartSummary
              items={[
                { label: 'Total', value: financeAudit.total ?? 0, color: financeColor },
                { label: 'Active', value: financeAudit.active ?? 0, color: FINANCE_PIE_COLORS[0] },
                { label: 'Close', value: financeAudit.closed ?? 0, color: FINANCE_PIE_COLORS[1] },
              ]}
            />
          </div>
          <div className="graph-content">
            {!financeHasPie ? (
              <p className="text-muted text-center py-5 mb-0">No finance data yet.</p>
            ) : (
              <div className="graph-content__inner">
                <Chart
                  key={`finance-pie-${theme}-${loading}`}
                  options={financePieOptions}
                  series={financePieSeries}
                  type="pie"
                  height={300}
                  width="100%"
                />
              </div>
            )}
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="graph-card__header graph-card__header--bar">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
              <div>
                <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">
                  Last Finance Audit
                </h5>
                <p className="text-muted small mb-0">New finance opened — last 5 periods</p>
              </div>
              <PeriodSelect value={financePeriod} onChange={setFinancePeriod} />
            </div>
          </div>
          <div className="graph-content">
            {!financePeriodHasData ? (
              <p className="text-muted text-center py-5 mb-0">No finance in selected periods.</p>
            ) : (
              <Chart
                key={`finance-col-${theme}-${financePeriod}-${loading}`}
                options={financeColumnOptions}
                series={[{ name: 'Finance', data: financePeriodData.counts }]}
                type="bar"
                height={300}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
