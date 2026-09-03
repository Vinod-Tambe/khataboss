import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../api/adminApi';

const formatOwnerName = (owner) =>
  [owner?.own_first_name, owner?.own_middle_name, owner?.own_last_name].filter(Boolean).join(' ');

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const cards = [
    { label: 'Total Owners', value: stats?.totalOwners || 0, icon: 'bi-people', color: '#2563eb' },
    { label: 'Active Owners', value: stats?.activeOwners || 0, icon: 'bi-check-circle', color: '#059669' },
    { label: 'Inactive Owners', value: stats?.inactiveOwners || 0, icon: 'bi-pause-circle', color: '#d97706' },
    { label: 'New This Month', value: stats?.newOwnersThisMonth || 0, icon: 'bi-graph-up-arrow', color: '#7c3aed' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="admin-page-title mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Overview of all registered owners on KhataBoss</p>
        </div>
        <Link to="/admin/owners/new" className="btn btn-primary">
          <i className="bi bi-person-plus me-1" />
          Add New Owner
        </Link>
      </div>

      <div className="admin-stat-grid mb-4">
        {cards.map((card) => (
          <div className="admin-stat-card" key={card.label}>
            <div className="admin-stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              <i className={`bi ${card.icon}`} />
            </div>
            <div>
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 fw-bold">Recently Added Owners</h5>
          <Link to="/admin/owners/grid" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>Database</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOwners || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">No owners found.</td>
                </tr>
              ) : (
                stats.recentOwners.map((owner) => (
                  <tr key={owner.own_uuid}>
                    <td>{formatOwnerName(owner)}</td>
                    <td>{owner.own_login_id}</td>
                    <td><code>{owner.own_db}</code></td>
                    <td>
                      <span className={`badge ${owner.own_status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {owner.own_status}
                      </span>
                    </td>
                    <td>{owner.own_created_at ? new Date(owner.own_created_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
