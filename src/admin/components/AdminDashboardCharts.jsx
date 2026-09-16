import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';

const STATUS_BAR_COLORS = [
  '#6366f1',
  '#0284c7',
  '#0d9488',
  '#059669',
  '#b45309',
  '#dc2626',
  '#7c3aed',
  '#64748b',
];

const baseChartOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 3,
  },
  tooltip: { theme: 'light' },
};

const AdminDashboardCharts = ({ charts }) => {
  const ticketsByStatus = useMemo(
    () => charts?.ticketsByStatus ?? [],
    [charts?.ticketsByStatus]
  );
  const ownersAddedByMonth = useMemo(
    () => charts?.ownersAddedByMonth ?? [],
    [charts?.ownersAddedByMonth]
  );
  const ownersSplit = charts?.ownersActiveInactive || { total: 0, active: 0, inactive: 0 };
  const ticketDelivery = charts?.ticketDelivery || { total: 0, delivered: 0, other: 0 };

  const ticketStatusOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'bar' },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: '55%', distributed: true },
      },
      colors: STATUS_BAR_COLORS,
      legend: { show: false },
      xaxis: {
        categories: ticketsByStatus.map((r) => r.label),
        labels: { rotate: -35, style: { fontSize: '10px' }, trim: true },
      },
      yaxis: {
        labels: { style: { fontSize: '11px' } },
        min: 0,
        forceNiceScale: true,
        title: { text: 'Tickets', style: { fontSize: '11px', fontWeight: 600 } },
      },
    }),
    [ticketsByStatus]
  );

  const ticketStatusSeries = useMemo(
    () => [{ name: 'Tickets', data: ticketsByStatus.map((r) => r.count) }],
    [ticketsByStatus]
  );

  const ownersAddedOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'line' },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#7c3aed'],
      markers: { size: 4, strokeWidth: 2, hover: { size: 6 } },
      legend: { show: false },
      xaxis: {
        categories: ownersAddedByMonth.map((m) => m.label),
        labels: { style: { fontSize: '10px' } },
      },
      yaxis: {
        labels: { style: { fontSize: '11px' } },
        min: 0,
        forceNiceScale: true,
        title: { text: 'New owners', style: { fontSize: '11px', fontWeight: 600 } },
      },
    }),
    [ownersAddedByMonth]
  );

  const ownersAddedSeries = useMemo(
    () => [{ name: 'Owners added', data: ownersAddedByMonth.map((m) => m.count) }],
    [ownersAddedByMonth]
  );

  const ownerActiveInactiveOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      labels: ['Active owners', 'Inactive owners'],
      colors: ['#059669', '#94a3b8'],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${Math.round(val)}%`,
        style: { fontSize: '11px', fontWeight: 700 },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              name: { fontSize: '12px' },
              value: { fontSize: '18px', fontWeight: 700 },
              total: {
                show: true,
                label: 'Total owners',
                fontSize: '11px',
                formatter: () => String(ownersSplit.total || 0),
              },
            },
          },
        },
      },
      tooltip: { theme: 'light' },
    }),
    [ownersSplit.total]
  );

  const ownerActiveInactiveSeries = useMemo(
    () => [ownersSplit.active || 0, ownersSplit.inactive || 0],
    [ownersSplit.active, ownersSplit.inactive]
  );

  const ticketDonutOptions = useMemo(
    () => ({
      chart: {
        type: 'donut',
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      labels: ['Delivered tickets', 'Other tickets'],
      colors: ['#059669', '#2563eb'],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${Math.round(val)}%`,
        style: { fontSize: '11px', fontWeight: 700 },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '62%',
            labels: {
              show: true,
              name: { fontSize: '12px' },
              value: { fontSize: '18px', fontWeight: 700 },
              total: {
                show: true,
                label: 'Total tickets',
                fontSize: '11px',
                formatter: () => String(ticketDelivery.total || 0),
              },
            },
          },
        },
      },
      tooltip: { theme: 'light' },
    }),
    [ticketDelivery.total]
  );

  const ticketDonutSeries = useMemo(
    () => [ticketDelivery.delivered || 0, ticketDelivery.other || 0],
    [ticketDelivery.delivered, ticketDelivery.other]
  );

  const chartPanels = [
    {
      title: 'Tickets by status',
      subtitle: 'Ticket-wise count on admin board columns',
      type: 'bar',
      height: 300,
      options: ticketStatusOptions,
      series: ticketStatusSeries,
    },
    {
      title: 'Owners added',
      subtitle: 'New owner registrations (last 12 months)',
      type: 'line',
      height: 300,
      options: ownersAddedOptions,
      series: ownersAddedSeries,
    },
    {
      title: 'Active vs inactive owners',
      subtitle: 'Share of total registered owners',
      type: 'donut',
      height: 300,
      options: ownerActiveInactiveOptions,
      series: ownerActiveInactiveSeries,
      isDonut: true,
    },
    {
      title: 'Ticket delivery',
      subtitle: 'Delivered vs other tickets (total in center)',
      type: 'donut',
      height: 300,
      options: ticketDonutOptions,
      series: ticketDonutSeries,
      isDonut: true,
    },
  ];

  return (
    <section className="admin-dashboard-charts mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h5 className="mb-1 fw-bold">Analytics</h5>
          <p className="text-muted small mb-0">Tickets, owners, and delivery overview</p>
        </div>
        <Link to="/admin/support" className="btn btn-sm btn-outline-primary">
          <i className="bi bi-kanban me-1" />
          Support board
        </Link>
      </div>

      <div className="row g-3">
        {chartPanels.map((panel) => (
          <div key={panel.title} className="col-12 col-lg-6">
            <div className="admin-panel admin-dashboard-charts__panel h-100">
              <h6 className="fw-bold mb-1">{panel.title}</h6>
              <p className="text-muted small mb-2">{panel.subtitle}</p>
              {panel.isDonut &&
              (panel.title.includes('owners') ? ownersSplit.total === 0 : ticketDelivery.total === 0) ? (
                <p className="text-muted small text-center py-5 mb-0">No data yet.</p>
              ) : (
                <Chart
                  type={panel.type}
                  height={panel.height}
                  options={panel.options}
                  series={panel.isDonut ? panel.series : panel.series}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardCharts;
