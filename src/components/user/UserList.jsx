import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedUser } from '../../store/slices/userSlice';
import List from '../common/List';
import { getUsers, deleteUser } from '../../api/userApi';
import { toast } from 'react-toastify';

const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { selectedFirmId } = useSelector((state) => state.firm);

  const fetchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const firmId = selectedFirmId === 'all' ? null : selectedFirmId;
      const response = await getUsers(firmId, search);
      setUserData(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [fetchUsers, debouncedSearchTerm]);

  const columns = [
    { key: "user_id", title: "ID", orderable: true, searchable: true },
    { key: "user_first_name", title: "First Name", orderable: true, searchable: true },
    { key: "user_last_name", title: "Last Name", orderable: true, searchable: true },
    { key: "user_father_name", title: "Father Name", orderable: true, searchable: true },
    { key: "user_mobile_no", title: "Mobile No", orderable: true, searchable: true },
    { key: "user_gender", title: "Gender", orderable: true, searchable: true },
    { key: "user_city", title: "City", orderable: true, searchable: true },
    { key: "user_add_date", title: "Date", orderable: true, searchable: true, dateFilter: true },
  ];

  const handleView = (rowData) => {
    dispatch(setSelectedUser(rowData));
    navigate('/user/home');
  };

  const handleEdit = (rowData) => {
    navigate(`/user/edit/${rowData.user_uuid}`);
  };

  const handleDelete = async (rowData) => {
    try {
      await deleteUser(rowData.user_uuid);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handlePrint = (rowData) => {
    window.print();
  };

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
              placeholder="Search users (Backend)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <List
        data={userData}
        columns={columns}
        title="All User List"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onView={handleView}
        hasEdit={true}
        hasDelete={true}
        hasPrint={true}
        hasView={true}
        loading={loading}
        deleteConfirmMessage={(row) => `Are you sure you want to delete user: ${row?.user_first_name} ${row?.user_last_name}?`}
      />
    </div>
  );
};

export default UserList;
