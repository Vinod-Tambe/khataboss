import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const DashboardCharts = () => {
  const [countView, setCountView] = useState('monthly');
  const [amountView, setAmountView] = useState('monthly');
  const [profitYear, setProfitYear] = useState('2024');

  // Mock Data Categories
  const weeklyCategories = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const monthlyCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyCategories = ['2020', '2021', '2022', '2023', '2024'];

  const getCategories = (view) => {
    if (view === 'weekly') return weeklyCategories;
    if (view === 'yearly') return yearlyCategories;
    return monthlyCategories;
  };

  const countData = {
    weekly: {
      loans: [5, 8, 4, 10],
      finance: [3, 6, 2, 7]
    },
    monthly: {
      loans: [12, 19, 15, 22, 14, 25, 20, 28, 18, 30, 24, 35],
      finance: [8, 15, 10, 18, 12, 20, 18, 22, 16, 25, 20, 28]
    },
    yearly: {
      loans: [150, 220, 180, 260, 310],
      finance: [100, 180, 150, 210, 250]
    }
  };

  const amountData = {
    weekly: {
      loans: [50000, 80000, 40000, 100000],
      finance: [30000, 60000, 20000, 70000]
    },
    monthly: {
      loans: [120000, 190000, 150000, 220000, 140000, 250000, 200000, 280000, 180000, 300000, 240000, 350000],
      finance: [80000, 150000, 100000, 180000, 120000, 200000, 180000, 220000, 160000, 250000, 200000, 280000]
    },
    yearly: {
      loans: [1500000, 2200000, 1800000, 2600000, 3100000],
      finance: [1000000, 1800000, 1500000, 2100000, 2500000]
    }
  };

  // New Mock Data: Profit/Loss
  const profitData = [
    { year: "2021", profit: 45000, loss: 12000 },
    { year: "2022", profit: 60000, loss: 18000 },
    { year: "2023", profit: 75000, loss: 25000 },
    { year: "2024", profit: 90000, loss: 30000 }
  ];

  // New Mock Data: Last 7 Days Transactions
  const last7DaysData = [
    { day: "Mon", loan: 5000, finance: 3000 },
    { day: "Tue", loan: 7000, finance: 4500 },
    { day: "Wed", loan: 6000, finance: 5000 },
    { day: "Thu", loan: 9000, finance: 6500 },
    { day: "Fri", loan: 7500, finance: 5500 },
    { day: "Sat", loan: 8500, finance: 7000 },
    { day: "Sun", loan: 9500, finance: 8000 }
  ];

  // Chart 1: Counts (Bar)
  const countChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: getCategories(countView),
      labels: { style: { colors: '#6c757d' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#6c757d' } }
    },
    grid: {
      show: false,
    },
    theme: { mode: 'light' },
    colors: ['#3b82f6', '#10b981'], // Blue for loans, Green for finance
    tooltip: { theme: 'light' },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -20,
    }
  };

  const countChartSeries = [
    { name: 'Total Loans', data: countData[countView].loans },
    { name: 'Total Finance', data: countData[countView].finance }
  ];

  // Chart 2: Amounts (Area)
  const amountChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: getCategories(amountView),
      labels: { style: { colors: '#6c757d' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { 
        style: { colors: '#6c757d' },
        formatter: (value) => {
          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
          if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
          return `₹${value}`;
        }
      }
    },
    grid: {
      show: false,
    },
    theme: { mode: 'light' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    colors: ['#8b5cf6', '#f59e0b'], // Purple for Loan Amount, Orange for Finance Amount
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -20,
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `₹${value.toLocaleString()}`
      }
    }
  };

  const amountChartSeries = [
    { name: 'Loan Amount', data: amountData[amountView].loans },
    { name: 'Finance Amount', data: amountData[amountView].finance }
  ];

  // Chart 3: Profit/Loss (RadialBar)
  const currentProfitData = profitData.find(d => d.year === profitYear) || profitData[0];
  const totalPL = currentProfitData.profit + currentProfitData.loss;
  const profitPercentage = totalPL > 0 ? Math.round((currentProfitData.profit / totalPL) * 100) : 0;
  const lossPercentage = totalPL > 0 ? Math.round((currentProfitData.loss / totalPL) * 100) : 0;

  const profitChartOptions = {
    chart: {
      type: 'radialBar',
      background: 'transparent',
      fontFamily: 'inherit',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '45%' },
        track: { background: '#f1f5f9', margin: 10 },
        dataLabels: {
          name: { fontSize: '14px', color: '#6c757d', offsetY: -10 },
          value: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', formatter: function (val) { return val + "%" } },
          total: {
            show: true,
            label: 'Total Profit',
            formatter: function () { return `₹${currentProfitData.profit.toLocaleString()}` }
          }
        }
      }
    },
    labels: ['Profit', 'Loss'],
    colors: ['#10b981', '#ef4444'], // Green for Profit, Red for Loss
    stroke: { lineCap: 'round' },
    legend: { show: true, position: 'bottom' },
    tooltip: {
      enabled: true,
      theme: 'light',
      y: {
        formatter: function(val, opts) {
           return opts.seriesIndex === 0 
             ? `₹${currentProfitData.profit.toLocaleString()}` 
             : `₹${currentProfitData.loss.toLocaleString()}`;
        }
      }
    }
  };

  const profitChartSeries = [profitPercentage, lossPercentage];

  // Custom Infographic Chart Colors & Max Calculation
  // Custom Infographic Chart Colors & Max Calculation
  const arrowColors = ['#9c27b0', '#e91e63', '#03a9f4', '#1976d2', '#00aba9', '#ff9800', '#4caf50'];
  const maxTransactionTotal = Math.max(...last7DaysData.map(d => d.loan + d.finance));

  return (
    <div className="mb-4 mt-4">
      <div className="dashboard-graphs">
        {/* Count Chart */}
        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Total Accounts</h5>
              <p className="text-muted small mb-0">Number of Loans vs Finances</p>
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
              options={countChartOptions} 
              series={countChartSeries} 
              type="bar" 
              height="100%" 
            />
          </div>
        </div>

        {/* Amount Chart */}
        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Total Amount</h5>
              <p className="text-muted small mb-0">Disbursed Loan vs Finance Amounts</p>
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
              options={amountChartOptions} 
              series={amountChartSeries} 
              type="area" 
              height="100%" 
            />
          </div>
        </div>

        {/* Profit / Loss Chart (RadialBar) */}
        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Year Wise Profit / Loss</h5>
              <p className="text-muted small mb-0">Total Profit vs Loss Analysis</p>
            </div>
            <select 
              className="form-select form-select-sm w-auto shadow-none border bg-light" 
              value={profitYear} 
              onChange={(e) => setProfitYear(e.target.value)}
              style={{ borderRadius: '6px', cursor: 'pointer' }}
            >
              {profitData.map(data => (
                <option key={data.year} value={data.year}>{data.year}</option>
              ))}
            </select>
          </div>
          <div className="graph-content d-flex justify-content-center align-items-center">
            <Chart 
              options={profitChartOptions} 
              series={profitChartSeries} 
              type="radialBar" 
              height="100%" 
              width="100%"
            />
          </div>
        </div>

        {/* Last 7 Days Transaction Chart (Custom Infographic) */}
        <div className="graph-card border-0">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>Last 7 Days Transactions</h5>
              <p className="text-muted small mb-0">Total Daily Activity (Loan + Finance)</p>
            </div>
          </div>
          <div className="graph-content">
            <div className="arrow-chart-container">
              {last7DaysData.map((data, index) => {
                const total = data.loan + data.finance;
                // Calculate percentage relative to the max day (minimum 15% so text fits)
                const widthPercent = maxTransactionTotal > 0 ? Math.max((total / maxTransactionTotal) * 100, 15) : 0;
                const color = arrowColors[index % arrowColors.length];
                
                // Format total as e.g., 8.5k
                const formattedTotal = total >= 1000 ? `${(total/1000).toFixed(1)}k` : total;

                return (
                  <div className="arrow-progress-row" key={data.day}>
                    <div className="arrow-progress-label">
                      <div className="arrow-progress-title" style={{ color: color }}>Total</div>
                      <div className="arrow-progress-subtitle">{data.day}</div>
                    </div>
                    <div 
                      className="arrow-progress-track-wrapper"
                      data-tooltip={`Loan: ₹${data.loan.toLocaleString()} | Finance: ₹${data.finance.toLocaleString()}`}
                    >
                      <div className="arrow-progress-track">
                        {/* Gap overlay to create the white space between fill and track */}
                        <div 
                          className="arrow-progress-gap" 
                          style={{ width: `calc(${widthPercent}% + 4px)` }}
                        ></div>
                        {/* Colored Fill */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
