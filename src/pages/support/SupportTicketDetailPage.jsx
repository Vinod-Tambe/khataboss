import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Deep links to /support/:uuid open the list drawer. */
const SupportTicketDetailPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (uuid) {
      navigate(`/support?ticket=${uuid}`, { replace: true });
    } else {
      navigate('/support', { replace: true });
    }
  }, [uuid, navigate]);

  return null;
};

export default SupportTicketDetailPage;
