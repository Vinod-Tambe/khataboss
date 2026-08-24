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

const DashboardCharts = ({ charts, loading }) => {
  const { theme } = useTheme();
  const isBrandDark = theme === 'brand-dark';
  const isDark = theme === 'dark' || isBrandDark;
  const chartLabelColor = isBrandDark ? '#c4a8b8' : isDark ? '#94a3b8' : '#6c757d';
  const chartTheme = isDark ? 'dark' : 'light';
  const chartValueColor = isBrandDark ? '#fce7f3' : isDark ? '#f1f5f9' : '#1f2937';
  const chartTrackColor = isBrandDark ? '#2a1230' : isDark ? '#252540' : '#f1f5f9';
  const countChartColors = useMemo(
    () => (isBrandDark ? ['#a1005b', '#7c3aed'] : ['#3b82f6', '#10b981']),
    [isBrandDark]
  );
  const amountChartColors = useMemo(
    () => (isBrandDark ? ['#c026d3', '#f59e0b'] : ['#8b5cf6', '#f59e0b']),
    [isBrandDark]
  );
  const profitChartColors = useMemo(
    () => (isBrandDark ? ['#f472b6', '#ef4444'] : ['#10b981', '#ef4444']),
    [isBrandDark]
  );
  const arrowColors = useMemo(
    () =>
      isBrandDark
        ? ['#f0abfc', '#f9a8d4', '#c4b5fd', '#fda4af', '#fcd34d', '#fbbf24', '#e879f9']
        : ['#a5b4fc', '#f9a8d4', '#7dd3fc', '#93c5fd', '#5eead4', '#fcd34d', '#6ee7b7'],
    [isBrandDark]
  );
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

  const countChartOptions = useMemo(() => {
    const countCategories = countData[countView]?.categories || [];
    return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: !loading, easing: 'easeinout', speed: 800 },
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: countCategories,
      labels: { style: { colors: chartLabelColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: chartLabelColor } } },
    grid: { show: false },
    theme: { mode: chartTheme },
    colors: countChartColors,
    tooltip: { theme: chartTheme },
    legend: { position: 'top', horizontalAlign: 'right', offsetY: -20 },
    };
  }, [chartLabelColor, chartTheme, countChartColors, countData, countView, loading]);

  const countChartSeries = useMemo(() => ([
    { name: 'New Loans', data: countData[countView]?.loans || [] },
    { name: 'New Finance', data: countData[countView]?.finance || [] },
  ]), [countData, countView]);

  const amountChartOptions = useMemo(() => {
    const amountCategories = amountData[amountView]?.categories || [];
    return {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: !loading, easing: 'easeinout', speed: 800 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: amountCategories,
      labels: { style: { colors: chartLabelColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: chartLabelColor },
        formatter: (value) => {
          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
          if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
          return `₹${value}`;
        },
      },
    },
    grid: { show: false },
    theme: { mode: chartTheme },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    colors: amountChartColors,
    legend: { position: 'top', horizontalAlign: 'right', offsetY: -20 },
    tooltip: {
      theme: chartTheme,
      y: { formatter: (value) => `₹${Number(value || 0).toLocaleString()}` },
    },
    };
  }, [amountChartColors, amountData, amountView, chartLabelColor, chartTheme, loading]);

  const amountChartSeries = useMemo(() => ([
    { name: 'Loan Amount', data: amountData[amountView]?.loans || [] },
    { name: 'Finance Amount', data: amountData[amountView]?.finance || [] },
  ]), [amountData, amountView]);

  const currentProfitData = profitData.find((d) => d.year === profitYear) || profitData[0];
  const totalPL = (currentProfitData?.profit || 0) + (currentProfitData?.loss || 0);
  const profitPercentage = totalPL > 0 ? Math.round(((currentProfitData?.profit || 0) / totalPL) * 100) : 0;
  const lossPercentage = totalPL > 0 ? Math.round(((currentProfitData?.loss || 0) / totalPL) * 100) : 0;

  const profitChartOptions = useMemo(() => ({
    chart: { type: 'radialBar', background: 'transparent', fontFamily: 'inherit', animations: { enabled: !loading } },
    plotOptions: {
      radialBar: {
        hollow: { size: '45%' },
        track: { background: chartTrackColor, margin: 10 },
        dataLabels: {
          name: { fontSize: '14px', color: chartLabelColor, offsetY: -10 },
          value: { fontSize: '24px', fontWeight: 'bold', color: chartValueColor, formatter: (val) => `${val}%` },
          total: {
            show: true,
            label: 'Interest Earned',
            formatter: () => `₹${Number(currentProfitData?.profit || 0).toLocaleString()}`,
          },
        },
      },
    },
    labels: ['Interest', 'Discount'],
    colors: profitChartColors,
    stroke: { lineCap: 'round' },
    legend: { show: true, position: 'bottom' },
    tooltip: {
      enabled: true,
      theme: chartTheme,
      y: {
        formatter: (val, opts) =>
          opts.seriesIndex === 0
            ? `₹${Number(currentProfitData?.profit || 0).toLocaleString()}`
            : `₹${Number(currentProfitData?.loss || 0).toLocaleString()}`,
      },
    },
  }), [chartLabelColor, chartTheme, chartTrackColor, chartValueColor, currentProfitData, loading, profitChartColors]);

  const profitChartSeries = useMemo(
    () => [profitPercentage, lossPercentage],
    [profitPercentage, lossPercentage]
  );

  const maxTransactionTotal = last7DaysData.length
    ? Math.max(...last7DaysData.map((d) => (d.loan || 0) + (d.finance || 0)), 1)
    : 1;

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
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>New Accounts</h5>
              <p className="text-muted small mb-0">Loans vs Finance opened</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light"
              value={countView}
              onChange={(e) => setCountView(e.target.value)}
              style={{ borderRadius: '6px', cursor: 'pointer' }}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="graph-content">
            <Chart
              key={`count-${theme}-${countView}-${loading}`}
              options={countChartOptions}
              series={countChartSeries}
              type="bar"
              height={280}
            />
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Disbursed Amount</h5>
              <p className="text-muted small mb-0">Principal amount for new loans & finance</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light"
              value={amountView}
              onChange={(e) => setAmountView(e.target.value)}
              style={{ borderRadius: '6px', cursor: 'pointer' }}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="graph-content">
            <Chart
              key={`amount-${theme}-${amountView}-${loading}`}
              options={amountChartOptions}
              series={amountChartSeries}
              type="area"
              height={280}
            />
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Year Wise Interest / Discount</h5>
              <p className="text-muted small mb-0">Loan interest collected vs release discounts</p>
            </div>
            <select
              className="form-select form-select-sm w-auto shadow-none border bg-light"
              value={profitYear}
              onChange={(e) => setProfitYear(e.target.value)}
              style={{ borderRadius: '6px', cursor: 'pointer' }}
            >
              {profitData.map((data) => (
                <option key={data.year} value={data.year}>{data.year}</option>
              ))}
            </select>
          </div>
          <div className="graph-content d-flex justify-content-center align-items-center">
            <Chart
              key={`profit-${theme}-${profitYear}-${loading}`}
              options={profitChartOptions}
              series={profitChartSeries}
              type="radialBar"
              height={280}
              width="100%"
            />
          </div>
        </div>

        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Last 7 Days Collections</h5>
              <p className="text-muted small mb-0">Daily loan & finance payment activity</p>
            </div>
          </div>
          <div className="graph-content">
            {last7DaysData.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0">No collections in the last 7 days.</p>
            ) : (
              <div className="arrow-chart-container">
                {last7DaysData.map((data, index) => {
                  const total = (data.loan || 0) + (data.finance || 0);
                  const widthPercent = maxTransactionTotal > 0 ? Math.max((total / maxTransactionTotal) * 100, 15) : 0;
                  const color = arrowColors[index % arrowColors.length];
                  const formattedTotal = total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total;

                  return (
                    <div className="arrow-progress-row" key={data.date || data.day}>
                      <div className="arrow-progress-label">
                        <div className="arrow-progress-title" style={{ color }}>Total</div>
                        <div className="arrow-progress-subtitle">{data.day}</div>
                      </div>
                      <div
                        className="arrow-progress-track-wrapper"
                        data-tooltip={`Loan: ₹${Number(data.loan || 0).toLocaleString()} | Finance: ₹${Number(data.finance || 0).toLocaleString()}`}
                      >
                        <div className="arrow-progress-track">
                          <div
                            className="arrow-progress-gap"
                            style={{ width: `calc(${widthPercent}% + 4px)` }}
                          />
                          <div
                            className="arrow-progress-fill"
                            style={{ width: `${widthPercent}%`, backgroundColor: color }}
                          >
                            {total > 0 ? `₹${formattedTotal}` : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
