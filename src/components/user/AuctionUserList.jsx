import React, { useState, useMemo } from 'react';
import List from '../common/List';

const STATIC_AUCTION_USERS = [
  {
    auc_id: 1,
    auc_user_full_name: 'Ramesh Patil',
    auc_user_mobile: '9876543210',
    auc_user_email: 'ramesh.patil@example.com',
    auc_user_gender: 'Male',
    auc_user_aadhaar: '123456789012',
    auc_user_pan: 'ABCDE1234F',
    auc_user_address: '12 Shivaji Nagar',
    auc_user_city: 'Pune',
    auc_user_state: 'Maharashtra',
    auc_user_country: 'India',
    auc_user_village: 'Hadapsar',
    auc_user_pincode: '411028',
    auc_payable_amt: '25000.00',
  },
  {
    auc_id: 2,
    auc_user_full_name: 'Sita Sharma',
    auc_user_mobile: '9123456780',
    auc_user_email: 'sita.sharma@example.com',
    auc_user_gender: 'Female',
    auc_user_aadhaar: '234567890123',
    auc_user_pan: 'FGHIJ5678K',
    auc_user_address: '45 MG Road',
    auc_user_city: 'Nashik',
    auc_user_state: 'Maharashtra',
    auc_user_country: 'India',
    auc_user_village: 'Satpur',
    auc_user_pincode: '422007',
    auc_payable_amt: '18500.00',
  },
  {
    auc_id: 3,
    auc_user_full_name: 'Amit Deshmukh',
    auc_user_mobile: '9988776655',
    auc_user_email: 'amit.deshmukh@example.com',
    auc_user_gender: 'Male',
    auc_user_aadhaar: '345678901234',
    auc_user_pan: 'KLMNO9012P',
    auc_user_address: '78 Station Road',
    auc_user_city: 'Kolhapur',
    auc_user_state: 'Maharashtra',
    auc_user_country: 'India',
    auc_user_village: 'Rajarampuri',
    auc_user_pincode: '416008',
    auc_payable_amt: '32000.00',
  },
  {
    auc_id: 4,
    auc_user_full_name: 'Priya Kulkarni',
    auc_user_mobile: '9765432109',
    auc_user_email: 'priya.kulkarni@example.com',
    auc_user_gender: 'Female',
    auc_user_aadhaar: '456789012345',
    auc_user_pan: 'QRSTU3456V',
    auc_user_address: '9 Laxmi Colony',
    auc_user_city: 'Solapur',
    auc_user_state: 'Maharashtra',
    auc_user_country: 'India',
    auc_user_village: 'Hotgi',
    auc_user_pincode: '413003',
    auc_payable_amt: '14250.00',
  },
  {
    auc_id: 5,
    auc_user_full_name: 'Vikram Jadhav',
    auc_user_mobile: '9654321098',
    auc_user_email: 'vikram.jadhav@example.com',
    auc_user_gender: 'Male',
    auc_user_aadhaar: '567890123456',
    auc_user_pan: 'WXYZA7890B',
    auc_user_address: '33 Gandhi Chowk',
    auc_user_city: 'Aurangabad',
    auc_user_state: 'Maharashtra',
    auc_user_country: 'India',
    auc_user_village: 'Cidco',
    auc_user_pincode: '431003',
    auc_payable_amt: '41000.00',
  },
];

const AuctionUserList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return STATIC_AUCTION_USERS;

    return STATIC_AUCTION_USERS.filter((row) =>
      [
        row.auc_user_full_name,
        row.auc_user_mobile,
        row.auc_user_email,
        row.auc_user_gender,
        row.auc_user_aadhaar,
        row.auc_user_pan,
        row.auc_user_city,
        row.auc_user_state,
        row.auc_payable_amt,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm]);

  const columns = [
    { key: 'auc_user_full_name', title: 'Full Name', orderable: true, searchable: true },
    { key: 'auc_user_mobile', title: 'Mobile', orderable: true, searchable: true },
    { key: 'auc_user_email', title: 'Email', orderable: true, searchable: true },
    { key: 'auc_user_gender', title: 'Gender', orderable: true, searchable: true },
    { key: 'auc_user_aadhaar', title: 'Aadhaar Card No', orderable: true, searchable: true },
    { key: 'auc_user_pan', title: 'PAN Card No', orderable: true, searchable: true },
    { key: 'auc_user_city', title: 'City', orderable: true, searchable: true },
    { key: 'auc_user_state', title: 'State', orderable: true, searchable: true },
    { key: 'auc_payable_amt', title: 'Payable Amount', orderable: true, searchable: true },
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
              placeholder="Search auction users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <List
        data={filteredData}
        columns={columns}
        title="Auction User List"
        primaryKey="auc_user_full_name"
        subtitleKey="auc_user_mobile"
        amountKey="auc_payable_amt"
        hasEdit={false}
        hasDelete={false}
        hasPrint={false}
        hasView={false}
        loading={false}
      />
    </div>
  );
};

export default AuctionUserList;
