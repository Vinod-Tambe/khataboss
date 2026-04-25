import React, { useEffect, useState } from 'react'
import InfoCards from '../../../components/home/InfoCards'
import ActionCards from '../../../components/home/ActionCards'
import '../../../css/Home.css'

import { getFirmsDropdown } from '../../../api/firmApi'
import { useSelector } from 'react-redux'

const HomePage = () => {

  const [firms, setFirms] = useState([]);

  // get selected firm from redux
  const { selectedFirmId } = useSelector((state) => state.firm);

  // fetch firms
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

  return (
    <div>
      <InfoCards />

   
      <ActionCards 
        firms={firms}
        selectedFirmId={selectedFirmId}
      />
      
    </div>
  )
}

export default HomePage