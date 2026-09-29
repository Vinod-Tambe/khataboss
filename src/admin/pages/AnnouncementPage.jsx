import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  seedAnnouncementTemplates,
  updateAnnouncement,
} from '../api/announcementApi';
import AnnouncementFormModal from '../components/AnnouncementFormModal';
import AnnouncementAdminListItem from '../components/AnnouncementAdminListItem';
import AnnouncementTemplateAdminCard from '../components/AnnouncementTemplateAdminCard';
import AnnouncementTemplateScheduleModal, {
  buildTemplateSchedulePayload,
  templateScheduleDefaultsFromItem,
} from '../components/AnnouncementTemplateScheduleModal';
import { DEFAULT_ANNOUNCEMENT_TYPE } from '../../constants/announcementTypes';
import {
  ANNOUNCEMENT_TEMPLATE_GROUP_META,
  partitionAnnouncementTemplates,
} from '../constants/announcementTemplateGroups';
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
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUuid, setEditingUuid] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showModal, setShowModal] = useState(false);
  const [scheduleItem, setScheduleItem] = useState(null);
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');

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

  const { festival, national, software, custom: customItems } = useMemo(
    () => partitionAnnouncementTemplates(items),
    [items]
  );

  const templateItems = useMemo(
    () => [...festival, ...national, ...software],
    [festival, national, software]
  );

  const templateGroupCount = templateItems.length;

  const handleSeedTemplates = async () => {
    try {
      setSeeding(true);
      const res = await seedAnnouncementTemplates();
      setItems(res.data || []);
      toast.success(res.message || 'Templates synced.');
    } catch (error) {
      toast.error(error.message || 'Failed to sync templates');
    } finally {
      setSeeding(false);
    }
  };

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

  const openScheduleModal = (item) => {
    const defaults = templateScheduleDefaultsFromItem(item);
    setScheduleItem(item);
    setScheduleStart(defaults.startDate);
    setScheduleEnd(defaults.endDate);
  };

  const closeScheduleModal = () => {
    setScheduleItem(null);
    setScheduleStart('');
    setScheduleEnd('');
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

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleItem) return;

    let payload;
    try {
      payload = buildTemplateSchedulePayload(scheduleStart, scheduleEnd);
    } catch (err) {
      toast.error(err.message);
      return;
    }

    try {
      setSaving(true);
      await updateAnnouncement(scheduleItem.ann_uuid, payload);
      toast.success('Schedule saved. Owners will see this during the selected dates.');
      closeScheduleModal();
      loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
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
            Use seeded system templates (festivals, national days, software maintenance &amp; issues)
            with start/end dates only, or publish fully custom announcements.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn admin-announcement-btn-outline"
            onClick={handleSeedTemplates}
            disabled={seeding}
          >
            <i className="bi bi-arrow-repeat me-2" />
            {seeding ? 'Syncing…' : 'Sync system templates'}
          </button>
          <button type="button" className="btn admin-announcement-btn-primary" onClick={openCreateModal}>
            <i className="bi bi-megaphone-fill me-2" />
            Custom announcement
          </button>
        </div>
      </div>

      {(['festival', 'national', 'software']).map((groupKey) => {
        const groupItems =
          groupKey === 'festival' ? festival : groupKey === 'national' ? national : software;
        const meta = ANNOUNCEMENT_TEMPLATE_GROUP_META[groupKey];
        return (
          <div key={groupKey} className="card border-0 user-details-card mb-4">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold text-brown mb-1">{meta.title}</h5>
              <p className="text-muted small mb-3">{meta.description}</p>
              {loading && <div className="text-muted">Loading...</div>}
              {!loading && templateGroupCount === 0 && groupKey === 'festival' && (
                <div className="text-muted mb-2">
                  No system templates yet. Click &quot;Sync system templates&quot; to load them.
                </div>
              )}
              {!loading && groupItems.length === 0 && templateGroupCount > 0 && (
                <div className="text-muted mb-2">No templates in this group. Run sync again.</div>
              )}
              <div className="announcement-admin-list">
                {groupItems.map((item) => (
                  <AnnouncementTemplateAdminCard
                    key={item.ann_uuid}
                    item={item}
                    onSchedule={openScheduleModal}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="card border-0 user-details-card">
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold text-brown mb-3">Custom announcements</h5>
          {loading && <div className="text-muted">Loading...</div>}
          {!loading && customItems.length === 0 && (
            <div className="text-muted">No custom announcements yet.</div>
          )}
          <div className="announcement-admin-list">
            {customItems.map((item) => (
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

      <AnnouncementTemplateScheduleModal
        show={!!scheduleItem}
        item={scheduleItem}
        startDate={scheduleStart}
        endDate={scheduleEnd}
        setStartDate={setScheduleStart}
        setEndDate={setScheduleEnd}
        saving={saving}
        onClose={closeScheduleModal}
        onSubmit={handleScheduleSubmit}
      />
    </div>
  );
};

export default AnnouncementPage;
