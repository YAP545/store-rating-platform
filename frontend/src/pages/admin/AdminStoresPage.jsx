import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import StoreDetailsModal from '../../components/common/StoreDetailsModal';
import { AuthContext } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  Plus,
  X,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const AdminStoresPage = () => {
  const { showToast } = useContext(AuthContext);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // STORE DETAILS MODAL
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // ADD STORE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  // CHANGE OWNER MODAL
  const [selectedStoreForOwner, setSelectedStoreForOwner] = useState(null);
  const [isChangeOwnerModalOpen, setIsChangeOwnerModalOpen] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [updatingOwner, setUpdatingOwner] = useState(false);

  // DELETE STORE MODAL
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStore, setDeletingStore] = useState(false);

  // FETCH STORES
  const fetchStores = async (page = 1) => {
    setLoading(true);

    try {
      let url =
        `/admin/stores?page=${page}` +
        `&limit=${meta.limit}` +
        `&sortBy=${sortBy}` +
        `&sortOrder=${sortOrder}`;

      if (debouncedSearch.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await API.get(url);
      setStores(res.data?.data || []);
      setMeta(
        res.data?.meta || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error('Failed to load stores:', err);
      showToast(
        err.response?.data?.message || 'Failed to load stores listing',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    fetchStores(newPage);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // FETCH STORE OWNERS FOR DROPDOWN
  const fetchStoreOwners = async () => {
    setOwnersLoading(true);
    try {
      const res = await API.get('/admin/users?role=STORE_OWNER&limit=100');
      setOwners(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load store owners:', err);
      showToast('Failed to load store owners list', 'error');
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    fetchStoreOwners();
    setFormData({
      name: '',
      email: '',
      address: '',
      ownerId: '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Store name is required', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Store email is required', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showToast('Store address is required', 'error');
      return;
    }

    setSubmitting(true);

    try {
      await API.post('/stores', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: formData.ownerId ? Number(formData.ownerId) : null,
      });

      showToast(`Store "${formData.name.trim()}" created successfully!`, 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        address: '',
        ownerId: '',
      });
      fetchStores(1);
    } catch (err) {
      console.error('Create store error:', err);
      showToast(err.response?.data?.message || 'Failed to create store', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // REMOVE STORE OWNER
  const handleRemoveOwner = async (store) => {
    if (!store.ownerId) return;

    try {
      await API.delete(`/stores/${store.id}/owner`);
      showToast(`Owner removed from store "${store.name}". Store remains intact.`, 'success');
      fetchStores(meta.page);
    } catch (err) {
      console.error('Remove owner error:', err);
      showToast(err.response?.data?.message || 'Failed to remove store owner', 'error');
    }
  };

  // CHANGE STORE OWNER
  const handleOpenChangeOwnerModal = (store) => {
    setSelectedStoreForOwner(store);
    setNewOwnerId(store.ownerId ? String(store.ownerId) : '');
    fetchStoreOwners();
    setIsChangeOwnerModalOpen(true);
  };

  const handleChangeOwnerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStoreForOwner) return;

    setUpdatingOwner(true);
    try {
      await API.put(`/stores/${selectedStoreForOwner.id}/owner`, {
        ownerId: newOwnerId ? Number(newOwnerId) : null,
      });

      showToast(`Store owner for "${selectedStoreForOwner.name}" updated successfully!`, 'success');
      setIsChangeOwnerModalOpen(false);
      setSelectedStoreForOwner(null);
      fetchStores(meta.page);
    } catch (err) {
      console.error('Update owner error:', err);
      showToast(err.response?.data?.message || 'Failed to update store owner', 'error');
    } finally {
      setUpdatingOwner(false);
    }
  };

  // DELETE STORE
  const handleInitiateDeleteStore = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete) return;
    setDeletingStore(true);

    try {
      await API.delete(`/admin/stores/${storeToDelete.id}`);
      showToast(`Store "${storeToDelete.name}" deleted successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
      fetchStores(meta.page);
    } catch (err) {
      console.error('Delete store error:', err);
      showToast(err.response?.data?.message || 'Failed to delete store', 'error');
    } finally {
      setDeletingStore(false);
    }
  };

  // TABLE COLUMNS
  const columns = [
    {
      label: 'Store Name',
      field: 'name',
      sortable: true,
      render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      label: 'Email',
      field: 'email',
      sortable: true,
    },
    {
      label: 'Address',
      field: 'address',
      sortable: true,
      render: (row) => (
        <span
          style={{
            display: 'block',
            maxWidth: '240px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.address}
        >
          {row.address}
        </span>
      ),
    },
    {
      label: 'Store Owner',
      key: 'owner',
      render: (row) => (
        <span style={{ fontWeight: row.owner?.name ? 500 : 400, color: row.owner?.name ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {row.owner?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      label: 'Overall Rating',
      field: 'rating',
      sortable: true,
      render: (row) => {
        const rating = Number(row.overallRating || 0);
        const totalRatings = Number(row.totalRatings || 0);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <StarRating value={rating} readOnly size={16} />
            <span style={{ fontWeight: 700 }}>{rating.toFixed(2)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({totalRatings})</span>
          </div>
        );
      },
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedStoreForDetails(row);
              setIsDetailsModalOpen(true);
            }}
            title="View Store Details & Reviews"
          >
            <Eye size={14} /> Details
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenChangeOwnerModal(row)}
            title={row.ownerId ? 'Change Owner' : 'Assign Owner'}
          >
            <UserCheck size={14} /> {row.ownerId ? 'Change Owner' : 'Assign Owner'}
          </button>

          {row.ownerId && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleRemoveOwner(row)}
              title="Remove Owner Assignment"
              style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <UserX size={14} /> Remove Owner
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleInitiateDeleteStore(row)}
            title="Delete Store"
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Stores Management</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Registered platform stores directory and owner assignments
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New Store
        </button>
      </div>

      {/* SEARCH */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by store name, address, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '12px' }}
          />
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No stores found matching your search"
      />

      {/* PAGINATION */}
      {!loading && stores.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* STORE DETAILS MODAL */}
      <StoreDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        store={selectedStoreForDetails}
      />

      {/* ADD STORE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Store">
        <form onSubmit={handleCreateStore}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter store name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="store@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              name="address"
              className="form-input"
              rows={2}
              placeholder="Enter full store address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Owner (Optional)</label>
            {ownersLoading ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading store owners...</p>
            ) : (
              <select
                name="ownerId"
                className="form-select"
                value={formData.ownerId}
                onChange={handleInputChange}
              >
                <option value="">Unassigned (No Owner)</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Store'}</button>
          </div>
        </form>
      </Modal>

      {/* CHANGE / ASSIGN OWNER MODAL */}
      <Modal isOpen={isChangeOwnerModalOpen} onClose={() => setIsChangeOwnerModalOpen(false)} title="Change Store Owner">
        {selectedStoreForOwner && (
          <form onSubmit={handleChangeOwnerSubmit}>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>
              Updating owner assignment for <strong>{selectedStoreForOwner.name}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Select Store Owner</label>
              {ownersLoading ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading store owners...</p>
              ) : (
                <select
                  className="form-select"
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                >
                  <option value="">Unassigned (No Owner)</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsChangeOwnerModalOpen(false)} disabled={updatingOwner}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={updatingOwner}>{updatingOwner ? 'Saving...' : 'Update Owner'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE STORE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete Store">
        {storeToDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
              <AlertTriangle size={28} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Are you sure you want to delete this store?</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{storeToDelete.name}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{storeToDelete.address}</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              The store owner's account and other platform users will NOT be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deletingStore}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmDeleteStore} disabled={deletingStore} style={{ background: '#ef4444', borderColor: '#dc2626' }}>
                {deletingStore ? 'Deleting...' : 'Delete Store'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStoresPage;