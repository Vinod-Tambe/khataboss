import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { deleteOwner, getOwners } from '../api/ownerApi';
import { resolveImageUrl } from '../../utils/imageHelpers';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const formatOwnerName = (owner) =>
  [owner?.own_first_name, owner?.own_middle_name, owner?.own_last_name].filter(Boolean).join(' ');

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN');
  } catch {
    return '';
  }
};

const resolveOwnerImageUrl = (img) => resolveImageUrl(img) || DEFAULT_AVATAR;

const OwnerGridPage = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOwners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOwners();
      setOwners(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load owners');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const filteredOwners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return owners;

    return owners.filter((owner) => {
      const haystack = [
        formatOwnerName(owner),
        owner.own_login_id,
        owner.own_email,
        owner.own_mobile_no,
        owner.own_phone_no,
        owner.own_city,
        owner.own_state,
        owner.own_db,
        owner.own_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [owners, search]);

  const handleDelete = async (e, owner) => {
    e.preventDefault();
    e.stopPropagation();
    const name = formatOwnerName(owner);
    if (!window.confirm(`Delete owner "${name}"?`)) return;

    try {
      await deleteOwner(owner.own_uuid);
      toast.success('Owner deleted successfully.');
      loadOwners();
    } catch (error) {
      toast.error(error.message || 'Failed to delete owner');
    }
  };

  return (
    <div className="card p-3 pt-2 shadow-sm">
      <div className="row pt-2 pb-3 align-items-center">
        <div className="col-9">
          <div className="input-group">
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search owners by name, login ID, mobile, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text border border-secondary">
              <i className="bi bi-search" />
            </span>
          </div>
        </div>
        <div className="col-3 text-end">
          <Link className="btn btn-outline-success" to="/admin/owners/new" title="Add Owner">
            <i className="bi bi-plus-square-dotted" />
          </Link>
        </div>
      </div>

      {loading && <div className="text-center text-muted py-4">Loading owners...</div>}

      {!loading && filteredOwners.length === 0 && (
        <div className="text-center text-muted py-4">
          No owners found.{' '}
          <Link to="/admin/owners/new" className="text-success fw-bold">
            Add owner
          </Link>
        </div>
      )}

      <div className="row g-3">
        {filteredOwners.map((owner) => {
          const name = formatOwnerName(owner);
          const phone = [owner.own_mobile_no, owner.own_phone_no].filter(Boolean).join(', ');
          const address = [owner.own_address, owner.own_city, owner.own_pincode]
            .filter(Boolean)
            .join(', ');
          const image = resolveOwnerImageUrl(owner.own_profile_img);
          const isActive = owner.own_status === 'Active';

          return (
            <div
              key={owner.own_uuid}
              className="col-12 col-md-6 col-lg-6 text-decoration-none"
              onClick={() => navigate(`/admin/owners/details/${owner.own_uuid}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card bg-blue shadow border-dark h-100">
                <div className="card-body text-dark p-2">
                  <div className="row align-items-center">
                    <div className="col-3 text-center">
                      <img
                        src={image}
                        alt={name}
                        width="80"
                        height="80"
                        className="rounded-circle border border-danger object-fit-cover"
                      />
                    </div>
                    <div className="col-9">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="card-title text-success-emphasis mb-0 fw-bold">{name}</h5>
                        <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {owner.own_status || 'Inactive'}
                        </span>
                      </div>
                      <p className="m-0">
                        <strong>Login :</strong> {owner.own_login_id || '-'}
                      </p>
                      <p className="m-0">
                        <strong>Phone :</strong> {phone || '-'}
                      </p>
                      <p className="m-0">
                        <strong>Address :</strong> {address || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-dark d-flex align-items-center p-2 m-0">
                  <button
                    type="button"
                    style={{ width: '15%' }}
                    className="btn me-2 p-1 m-0 bg-secondary-subtle border-secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/owners/details/${owner.own_uuid}`);
                    }}
                  >
                    {owner.own_id}
                  </button>
                  <button
                    type="button"
                    className="btn me-2 bg-info-subtle border-secondary rounded-circle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/owners/details/${owner.own_uuid}`);
                    }}
                    title="View / Edit"
                  >
                    <i className="bi bi-pencil-square" />
                  </button>
                  <button
                    type="button"
                    className="btn me-2 bg-danger-subtle border-secondary rounded-circle"
                    onClick={(e) => handleDelete(e, owner)}
                    title="Delete"
                  >
                    <i className="bi bi-trash" />
                  </button>
                  <p className="ms-auto mb-0 text-secondary">
                    - {formatDate(owner.own_created_at || owner.own_add_date)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerGridPage;
