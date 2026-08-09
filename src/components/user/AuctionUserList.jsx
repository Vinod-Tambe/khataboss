import React, { useState, useMemo } from 'react';
import List from '../common/List';

import { getAuctionUsers } from '../../api/auctionApi';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const AuctionUserList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [auctionUsers, setAuctionUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { selectedFirmId } = useSelector((state) => state.firm);

  React.useEffect(() => {
    const fetchAuctionUsers = async () => {
      if (!selectedFirmId) return;
      try {
        setLoading(true);
        const data = await getAuctionUsers(selectedFirmId);
        setAuctionUsers(data);
      } catch (error) {
        toast.error(error.message || "Failed to load auction users");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionUsers();
  }, [selectedFirmId]);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return auctionUsers;

    return auctionUsers.filter((row) =>
      [
        row.au_full_name,
        row.au_mobile,
        row.au_email,
        row.au_gender,
        row.au_aadhaar,
        row.au_pan,
        row.au_city,
        row.au_state,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm, auctionUsers]);

  const columns = [
    { key: 'au_full_name', title: 'Full Name', orderable: true, searchable: true },
    { key: 'au_mobile', title: 'Mobile', orderable: true, searchable: true },
    { key: 'au_email', title: 'Email', orderable: true, searchable: true },
    { key: 'au_gender', title: 'Gender', orderable: true, searchable: true },
    { key: 'au_aadhaar', title: 'Aadhaar Card No', orderable: true, searchable: true },
    { key: 'au_pan', title: 'PAN Card No', orderable: true, searchable: true },
    { key: 'au_city', title: 'City', orderable: true, searchable: true },
    { key: 'au_state', title: 'State', orderable: true, searchable: true },
  ];

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-secondary"
              placeholder="Search auction customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <List
        data={filteredData}
        columns={columns}
        title="Auction Customer List"
        primaryKey="au_full_name"
        subtitleKey="au_mobile"
        hasEdit={false}
        hasDelete={false}
        hasPrint={false}
        hasView={false}
        loading={loading}
      />
    </div>
  );
};

export default AuctionUserList;
