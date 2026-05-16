import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const DashboardCharts = () => {
  const [countView, setCountView] = useState('monthly');
  const [amountView, setAmountView] = useState('monthly');

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
      </div>
    </div>
  );
};

export default DashboardCharts;
