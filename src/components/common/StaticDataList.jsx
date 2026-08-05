import React, { useState, useMemo } from 'react';
import List from './List';

const StaticDataList = ({ title, columns, data = [], searchPlaceholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data;

    return data.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [data, searchTerm]);

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
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <List
        data={filteredData}
        columns={columns}
        title={title}
        hasEdit={false}
        hasDelete={false}
        hasPrint={false}
        hasView={false}
        isLoading={false}
      />
    </div>
  );
};

export default StaticDataList;
