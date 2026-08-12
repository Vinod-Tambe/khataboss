import React, { useEffect, useState } from 'react'
import InfoCards from '../../../components/home/InfoCards'
import ActionCards from '../../../components/home/ActionCards'
import DashboardCharts from '../../../components/home/DashboardCharts'
import { getOwnerDashboard } from '../../../api/dashboardApi'
import { getFirmsDropdown } from '../../../api/firmApi'
import { useSelector } from 'react-redux'
import '../../../css/Home.css'

const HomePage = () => {
  const [firms, setFirms] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { selectedFirmId } = useSelector((state) => state.firm);

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const res = await getFirmsDropdown();
        setFirms(res.data || []);
      } catch (err) {
        console.error("Error fetching firms:", err);
      }
    };

    fetchFirms();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (selectedFirmId && selectedFirmId !== 'all') {
          params.firmId = selectedFirmId;
        }
        const res = await getOwnerDashboard(params);
        setDashboard(res.data || null);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err.message || 'Failed to load dashboard');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedFirmId]);

  return (
    <div>
      {error && (
        <div className="alert alert-warning py-2 mb-3" role="alert">
          {error}
        </div>
      )}

      <InfoCards cards={dashboard?.cards} loading={loading} />

      <ActionCards
        firms={firms}
        selectedFirmId={selectedFirmId}
      />

      <DashboardCharts charts={dashboard?.charts} loading={loading} />
    </div>
  )
}

export default HomePage
