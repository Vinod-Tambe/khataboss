import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Deep links to /admin/support/:uuid open the board drawer. */
const SupportTicketDetailPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (uuid) {
      navigate(`/admin/support?ticket=${uuid}`, { replace: true });
    } else {
      navigate('/admin/support', { replace: true });
    }
  }, [uuid, navigate]);

  return null;
};

export default SupportTicketDetailPage;
