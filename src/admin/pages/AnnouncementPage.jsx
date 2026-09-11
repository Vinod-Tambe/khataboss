import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from '../api/announcementApi';
import AnnouncementFormModal from '../components/AnnouncementFormModal';
import AnnouncementAdminListItem from '../components/AnnouncementAdminListItem';
import { DEFAULT_ANNOUNCEMENT_TYPE } from '../../constants/announcementTypes';
import {
  nowDateTimeInputValue,
  toDateTimeInputValue,
} from '../utils/dateHelpers';

const emptyForm = () => ({
  ann_title: '',
  ann_body: '',
  ann_type: DEFAULT_ANNOUNCEMENT_TYPE,
  ann_status: 'Active',
  ann_is_pinned: false,
  ann_sort_order: '0',
  ann_publish_at: nowDateTimeInputValue(),
  ann_expires_at: '',
});

const AnnouncementPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUuid, setEditingUuid] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showModal, setShowModal] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setItems(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load announcements');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateModal = () => {
    setEditingUuid(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUuid(null);
    setForm(emptyForm());
  };

  const handleEdit = (item) => {
    setEditingUuid(item.ann_uuid);
    setForm({
      ann_title: item.ann_title || '',
      ann_body: item.ann_body || '',
      ann_type: item.ann_type || DEFAULT_ANNOUNCEMENT_TYPE,
      ann_status: item.ann_status || 'Active',
      ann_is_pinned: !!item.ann_is_pinned,
      ann_sort_order: String(item.ann_sort_order ?? 0),
      ann_publish_at: toDateTimeInputValue(item.ann_publish_at),
      ann_expires_at: toDateTimeInputValue(item.ann_expires_at),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ann_title.trim() || !form.ann_body.trim()) {
      toast.error('Title and message are required.');
      return;
    }
    if (!form.ann_publish_at) {
      toast.error('Publish date and time are required.');
      return;
    }
    if (form.ann_expires_at && form.ann_expires_at <= form.ann_publish_at) {
      toast.error('Expiry must be after publish date and time.');
      return;
    }

    const payload = {
      ann_title: form.ann_title.trim(),
      ann_body: form.ann_body.trim(),
      ann_type: form.ann_type,
      ann_status: form.ann_status,
      ann_is_pinned: form.ann_is_pinned,
      ann_sort_order: form.ann_sort_order,
      ann_publish_at: form.ann_publish_at,
      ann_expires_at: form.ann_expires_at || null,
    };

    try {
      setSaving(true);
      if (editingUuid) {
        await updateAnnouncement(editingUuid, payload);
        toast.success('Announcement updated.');
      } else {
        await createAnnouncement(payload);
        toast.success('Announcement published to owners.');
      }
      closeModal();
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete announcement "${item.ann_title}"?`)) return;
    try {
      await deleteAnnouncement(item.ann_uuid);
      toast.success('Announcement deleted.');
      if (editingUuid === item.ann_uuid) closeModal();
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="admin-page-title mb-1">Owner Announcements</h2>
          <p className="text-muted mb-0">
            Publish tagged announcements with icons and colors for all owner and staff dashboards.
          </p>
        </div>
        <button type="button" className="btn btn-success" onClick={openCreateModal}>
          <i className="bi bi-megaphone-fill me-2" />
          New Announcement
        </button>
      </div>

      <div className="card border-0 user-details-card">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold text-brown mb-3">Published Announcements</h5>
          {loading && <div className="text-muted">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-muted">No announcements published yet.</div>
          )}
          <div className="announcement-admin-list">
            {items.map((item) => (
              <AnnouncementAdminListItem
                key={item.ann_uuid}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      <AnnouncementFormModal
        show={showModal}
        editingUuid={editingUuid}
        form={form}
        setForm={setForm}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AnnouncementPage;
