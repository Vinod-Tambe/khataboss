import React, { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';

const EMPTY_COUNTS = {
  weekly: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], loans: [0, 0, 0, 0], finance: [0, 0, 0, 0] },
  monthly: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], loans: Array(12).fill(0), finance: Array(12).fill(0) },
  yearly: { categories: [], loans: [], finance: [] },
};

const EMPTY_AMOUNTS = {
  weekly: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], loans: [0, 0, 0, 0], finance: [0, 0, 0, 0] },
  monthly: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], loans: Array(12).fill(0), finance: Array(12).fill(0) },
  yearly: { categories: [], loans: [], finance: [] },
};

const sumValues = (values = []) => values.reduce((total, value) => total + (Number(value) || 0), 0);

const formatRupeeFull = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatRupeeShort = (value) => {
  const num = Number(value) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

const formatCountLabel = (value) => {
  const num = Number(value) || 0;
  return num > 0 ? String(num) : '';
};

const formatDayCategory = (item) => {
  if (!item?.date) return item?.day || '';
  const date = new Date(`${item.date}T00:00:00`);
  if (Number.isNaN(date.getTime())) return item.day || item.date;
  const day = item.day || date.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${day}\n${dateLabel}`;
};

const ChartSummary = ({ items }) => (
  <div className="dashboard-chart-summary">
    {items.map((item) => (
      <span key={item.label} className="dashboard-chart-summary__item" style={{ '--summary-accent': item.color }}>
        <span className="dashboard-chart-summary__dot" />
        <span className="dashboard-chart-summary__label">{item.label}</span>
        <strong className="dashboard-chart-summary__value">{item.value}</strong>
      </span>
    ))}
  </div>
);

const DashboardCharts = ({ charts, loading }) => {
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
  const interestColor = isBrandDark ? '#34d399' : isFintech ? '#0891b2' : '#059669';
  const discountColor = isBrandDark ? '#fb7185' : isFintech ? '#f59e0b' : '#ef4444';

  const [countView, setCountView] = useState('monthly');
  const [amountView, setAmountView] = useState('monthly');

  const countData = useMemo(() => charts?.counts || EMPTY_COUNTS, [charts?.counts]);
  const amountData = useMemo(() => charts?.amounts || EMPTY_AMOUNTS, [charts?.amounts]);
  const profitData = useMemo(
    () =>
      charts?.profitLoss?.length
        ? charts.profitLoss
        : [{ year: String(new Date().getFullYear()), profit: 0, loss: 0 }],
    [charts?.profitLoss]
  );
  const last7DaysData = useMemo(
    () => (charts?.last7Days?.length ? charts.last7Days : []),
    [charts?.last7Days]
  );

  const [profitYear, setProfitYear] = useState(
    () => profitData[profitData.length - 1]?.year || String(new Date().getFullYear())
  );

  useEffect(() => {
    if (profitData.length && !profitData.find((d) => d.year === profitYear)) {
      setProfitYear(profitData[profitData.length - 1].year);
    }
  }, [profitData, profitYear]);

  const currentCountSlice = countData[countView] || EMPTY_COUNTS.monthly;
  const currentAmountSlice = amountData[amountView] || EMPTY_AMOUNTS.monthly;
  const currentProfitData = profitData.find((d) => d.year === profitYear) || profitData[0];
  const profitAmount = Number(currentProfitData?.profit || 0);
  const discountAmount = Number(currentProfitData?.loss || 0);

  const countTotals = useMemo(() => ({
    loans: sumValues(currentCountSlice.loans),
    finance: sumValues(currentCountSlice.finance),
  }), [currentCountSlice]);

  const amountTotals = useMemo(() => ({
    loans: sumValues(currentAmountSlice.loans),
    finance: sumValues(currentAmountSlice.finance),
  }), [currentAmountSlice]);

  const collectionTotals = useMemo(() => ({
    loans: sumValues(last7DaysData.map((item) => item.loan)),
    finance: sumValues(last7DaysData.map((item) => item.finance)),
  }), [last7DaysData]);

  const baseChartOptions = useMemo(() => ({
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: !loading, easing: 'easeinout', speed: 700 },
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
      fontSize: '13px',
      fontWeight: 600,
      labels: { colors: chartLabelColor },
      markers: { width: 10, height: 10, radius: 3 },
    },
    tooltip: { theme: chartTheme },
  }), [chartGridColor, chartLabelColor, chartTheme, loading]);

  const countChartOptions = useMemo(() => ({
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: countView === 'monthly' ? '72%' : '58%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: formatCountLabel,
      offsetY: -18,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        colors: [chartValueColor],
      },
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: currentCountSlice.categories || [],
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px', fontWeight: 600 },
        rotate: countView === 'monthly' ? -35 : 0,
        trim: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      tickAmount: 5,
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px' },
        formatter: (value) => Math.round(value),
      },
      title: {
        text: 'Number of accounts',
        style: { color: chartLabelColor, fontSize: '11px', fontWeight: 600 },
      },
    },
    colors: [loanColor, financeColor],
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (value) => `${Number(value || 0)} account(s)` },
    },
  }), [baseChartOptions, chartLabelColor, chartValueColor, countView, currentCountSlice.categories, loanColor, financeColor]);

  const countChartSeries = useMemo(() => ([
    { name: 'New Loans', data: currentCountSlice.loans || [] },
    { name: 'New Finance', data: currentCountSlice.finance || [] },
  ]), [currentCountSlice]);

  const amountChartOptions = useMemo(() => ({
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: amountView === 'monthly' ? '72%' : '58%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => (Number(value) > 0 ? formatRupeeShort(value) : ''),
      offsetY: -18,
      style: {
        fontSize: '10px',
        fontWeight: 700,
        colors: [chartValueColor],
      },
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: currentAmountSlice.categories || [],
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px', fontWeight: 600 },
        rotate: amountView === 'monthly' ? -35 : 0,
        trim: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px' },
        formatter: formatRupeeShort,
      },
      title: {
        text: 'Amount (₹)',
        style: { color: chartLabelColor, fontSize: '11px', fontWeight: 600 },
      },
    },
    colors: [loanColor, financeColor],
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (value) => formatRupeeFull(value) },
    },
  }), [amountView, baseChartOptions, chartLabelColor, chartValueColor, currentAmountSlice.categories, loanColor, financeColor]);

  const amountChartSeries = useMemo(() => ([
    { name: 'Loan Amount', data: currentAmountSlice.loans || [] },
    { name: 'Finance Amount', data: currentAmountSlice.finance || [] },
  ]), [currentAmountSlice]);

  const profitChartOptions = useMemo(() => ({
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: ['Interest Collected', 'Discount Given'],
    colors: [interestColor, discountColor],
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              color: chartLabelColor,
              offsetY: 18,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 700,
              color: chartValueColor,
              offsetY: -2,
              formatter: (value) => formatRupeeShort(value),
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '13px',
              color: chartLabelColor,
              formatter: () => formatRupeeShort(profitAmount + discountAmount),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_value, opts) => formatRupeeShort(opts.w.config.series[opts.seriesIndex]),
      style: {
        fontSize: '12px',
        fontWeight: 700,
        colors: ['#ffffff'],
      },
      dropShadow: { enabled: false },
    },
    stroke: { width: 2, colors: [isDark ? '#1e293b' : '#ffffff'] },
    legend: {
      ...baseChartOptions.legend,
      formatter: (seriesName, opts) => {
        const amount = opts.w.globals.series[opts.seriesIndex];
        return `${seriesName}: ${formatRupeeFull(amount)}`;
      },
    },
    tooltip: {
      ...baseChartOptions.tooltip,
      y: { formatter: (value) => formatRupeeFull(value) },
    },
  }), [baseChartOptions, chartLabelColor, chartValueColor, discountAmount, interestColor, discountColor, isDark, profitAmount]);

  const profitChartSeries = useMemo(
    () => [profitAmount, discountAmount],
    [profitAmount, discountAmount]
  );

  const collectionCategories = useMemo(
    () => last7DaysData.map((item) => formatDayCategory(item)),
    [last7DaysData]
  );

  const collectionChartOptions = useMemo(() => ({
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        columnWidth: '62%',
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => (Number(value) > 0 ? formatRupeeShort(value) : ''),
      offsetY: -18,
      style: {
        fontSize: '10px',
        fontWeight: 700,
        colors: [chartValueColor],
      },
    },
    xaxis: {
      categories: collectionCategories,
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px', fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: chartLabelColor, fontSize: '11px' },
        formatter: formatRupeeShort,
      },
      title: {
        text: 'Collection amount (₹)',
        style: { color: chartLabelColor, fontSize: '11px', fontWeight: 600 },
      },
    },
    colors: [loanColor, financeColor],
    tooltip: {
      ...baseChartOptions.tooltip,
      shared: true,
      intersect: false,
      y: { formatter: (value) => formatRupeeFull(value) },
    },
  }), [baseChartOptions, chartLabelColor, chartValueColor, collectionCategories, loanColor, financeColor]);

  const collectionChartSeries = useMemo(() => ([
    { name: 'Loan Collection', data: last7DaysData.map((item) => item.loan || 0) },
    { name: 'Finance Collection', data: last7DaysData.map((item) => item.finance || 0) },
  ]), [last7DaysData]);

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
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">New Accounts Opened</h5>
              <p className="text-muted small mb-0">How many new loan and finance accounts were created</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light dashboard-chart-select"
              value={countView}
              onChange={(e) => setCountView(e.target.value)}
            >
              <option value="weekly">This Month (Weekly)</option>
              <option value="monthly">This Year (Monthly)</option>
              <option value="yearly">Year Wise</option>
            </select>
          </div>
          <ChartSummary
            items={[
              { label: 'Total Loans', value: `${countTotals.loans}`, color: loanColor },
              { label: 'Total Finance', value: `${countTotals.finance}`, color: financeColor },
            ]}
          />
          <div className="graph-content">
            <Chart
              key={`count-${theme}-${countView}-${loading}`}
              options={countChartOptions}
              series={countChartSeries}
              type="bar"
              height={300}
            />
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">Money Disbursed</h5>
              <p className="text-muted small mb-0">Principal amount given for new loans and finance</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light dashboard-chart-select"
              value={amountView}
              onChange={(e) => setAmountView(e.target.value)}
            >
              <option value="weekly">This Month (Weekly)</option>
              <option value="monthly">This Year (Monthly)</option>
              <option value="yearly">Year Wise</option>
            </select>
          </div>
          <ChartSummary
            items={[
              { label: 'Loan Disbursed', value: formatRupeeFull(amountTotals.loans), color: loanColor },
              { label: 'Finance Disbursed', value: formatRupeeFull(amountTotals.finance), color: financeColor },
            ]}
          />
          <div className="graph-content">
            <Chart
              key={`amount-${theme}-${amountView}-${loading}`}
              options={amountChartOptions}
              series={amountChartSeries}
              type="bar"
              height={300}
            />
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">Interest vs Discount</h5>
              <p className="text-muted small mb-0">Loan interest collected and release discount given</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light dashboard-chart-select"
              value={profitYear}
              onChange={(e) => setProfitYear(e.target.value)}
            >
              {profitData.map((data) => (
                <option key={data.year} value={data.year}>{data.year}</option>
              ))}
            </select>
          </div>
          <ChartSummary
            items={[
              { label: 'Interest', value: formatRupeeFull(profitAmount), color: interestColor },
              { label: 'Discount', value: formatRupeeFull(discountAmount), color: discountColor },
            ]}
          />
          <div className="graph-content d-flex justify-content-center align-items-center">
            {profitAmount === 0 && discountAmount === 0 ? (
              <p className="text-muted text-center py-5 mb-0">No interest or discount data for {profitYear}.</p>
            ) : (
              <Chart
                key={`profit-${theme}-${profitYear}-${loading}`}
                options={profitChartOptions}
                series={profitChartSeries}
                type="donut"
                height={300}
                width="100%"
              />
            )}
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark dashboard-chart-title">Last 7 Days Collections</h5>
              <p className="text-muted small mb-0">Daily loan and finance payment received</p>
            </div>
          </div>
          <ChartSummary
            items={[
              { label: 'Loan Collection', value: formatRupeeFull(collectionTotals.loans), color: loanColor },
              { label: 'Finance Collection', value: formatRupeeFull(collectionTotals.finance), color: financeColor },
              {
                label: 'Grand Total',
                value: formatRupeeFull(collectionTotals.loans + collectionTotals.finance),
                color: isFintech ? '#1e40af' : '#6366f1',
              },
            ]}
          />
          <div className="graph-content">
            {last7DaysData.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">No collections in the last 7 days.</p>
            ) : (
              <Chart
                key={`collection-${theme}-${loading}`}
                options={collectionChartOptions}
                series={collectionChartSeries}
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
