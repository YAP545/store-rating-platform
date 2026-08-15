import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import StarRating from '../../components/common/StarRating';
import { AuthContext } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  Eye,
  Filter,
  Plus,
  Trash2,
  AlertTriangle,
  UserX,
  Store,
  X,
} from 'lucide-react';

const AdminUsersPage = () => {
  const { user: currentUser, showToast } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // VIEW DETAILS MODAL
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ADD USER MODAL
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'NORMAL_USER',
  });

  // DELETE USER MODAL & STORE OWNER WARNING MODAL
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [ownerWarningUser, setOwnerWarningUser] = useState(null);
  const [isOwnerWarningOpen, setIsOwnerWarningOpen] = useState(false);

  // FETCH USERS
  const fetchUsers = async (page = 1) => {
    setLoading(true);

    try {
      let url =
        `/admin/users?page=${page}` +
        `&limit=${meta.limit}` +
        `&sortBy=${sortBy}` +
        `&sortOrder=${sortOrder}`;

      if (roleFilter) {
        url += `&role=${roleFilter}`;
      }

      if (debouncedSearch.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await API.get(url);
      setUsers(res.data?.data || []);
      setMeta(
        res.data?.meta || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast(
        err.response?.data?.message || 'Failed to load users listing',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [debouncedSearch, roleFilter, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // VIEW DETAILS
  const handleViewDetails = async (userId) => {
    try {
      const res = await API.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to load user details:', err);
      showToast('Failed to load user details', 'error');
    }
  };

  // ADD USER
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'NORMAL_USER',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (formData.name.trim().length < 20) {
      showToast('Name must be at least 20 characters', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Email is required', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showToast('Address is required', 'error');
      return;
    }
    if (!formData.password) {
      showToast('Password is required', 'error');
      return;
    }
    if (formData.password.length < 8 || formData.password.length > 16) {
      showToast('Password must be between 8 and 16 characters', 'error');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      showToast('Password must contain at least one uppercase letter', 'error');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      showToast('Password must contain at least one special character', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
        role: formData.role,
      };

      await API.post('/users', payload);
      showToast('User created successfully!', 'success');
      handleCloseAddModal();
      fetchUsers(1);
    } catch (err) {
      console.error('Create user error:', err);
      const message =
        err.response?.data?.message || 'Failed to create user. Please try again.';
      showToast(Array.isArray(message) ? message.join(', ') : message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE USER & STORE OWNER WARNING
  const handleInitiateDelete = (targetUser) => {
    if (currentUser && currentUser.id === targetUser.id) {
      showToast('You cannot delete the currently logged-in administrator.', 'error');
      return;
    }

    if (targetUser.role === 'STORE_OWNER' && targetUser.stores && targetUser.stores.length > 0) {
      setOwnerWarningUser(targetUser);
      setIsOwnerWarningOpen(true);
      return;
    }

    setUserToDelete(targetUser);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);

    try {
      await API.delete(`/admin/users/${userToDelete.id}`);
      showToast(`User "${userToDelete.name}" removed successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers(meta.page);
    } catch (err) {
      console.error('Delete user error:', err);
      const msg = err.response?.data?.message || 'Failed to remove user.';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  // TABLE COLUMNS
  const columns = [
    {
      label: 'Name',
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
      label: 'Role',
      field: 'role',
      sortable: true,
      render: (row) => {
        if (row.role === 'SYSTEM_ADMIN') {
          return <span className="badge badge-admin">System Admin</span>;
        }
        if (row.role === 'STORE_OWNER') {
          const storeCount = row.stores?.length || 0;
          return (
            <span className="badge badge-owner">
              Store Owner {storeCount > 0 ? `(${storeCount} store${storeCount > 1 ? 's' : ''})` : ''}
            </span>
          );
        }
        return <span className="badge badge-user">Normal User</span>;
      },
    },
    {
      label: 'Address',
      field: 'address',
      sortable: true,
    },
    {
      label: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleViewDetails(row.id)}
            title="View User Details"
          >
            <Eye size={14} /> Details
          </button>
          {currentUser && currentUser.id !== row.id && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleInitiateDelete(row)}
              title="Remove User"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <Trash2 size={14} /> Remove
            </button>
          )}
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
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Users Management</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            System accounts directory and role administration
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* FILTERS */}
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
            placeholder="Search by name, email, or address..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            <option value="">All Roles</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="NORMAL_USER">Normal User</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No users found matching your filters"
      />

      {/* PAGINATION */}
      {!loading && users.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* VIEW USER DETAILS MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NAME</span>
              <p style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0 0' }}>{selectedUser.name}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL</span>
              <p style={{ fontSize: '14px', margin: '2px 0 0 0' }}>{selectedUser.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ROLE</span>
              <div style={{ marginTop: '4px' }}>
                <span className={`badge ${selectedUser.role === 'SYSTEM_ADMIN' ? 'badge-admin' : selectedUser.role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ADDRESS</span>
              <p style={{ fontSize: '14px', margin: '2px 0 0 0' }}>{selectedUser.address}</p>
            </div>

            {selectedUser.storeRating && (
              <div className="glass-panel" style={{ padding: '16px', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>MANAGED STORE RATING</span>
                <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700 }}>{selectedUser.storeRating.storeName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <StarRating value={Number(selectedUser.storeRating.averageRating)} readOnly size={16} />
                  <strong style={{ color: '#fbbf24' }}>{selectedUser.storeRating.averageRating}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({selectedUser.storeRating.totalRatings} ratings)</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD USER MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add New User Account">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter full name (20–60 characters)"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-input"
              rows={2}
              placeholder="Enter address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Password (8–16 chars, 1 uppercase, 1 special char)"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Remove User">
        {userToDelete && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
              <UserX size={28} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Are you sure you want to remove this user?</span>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{userToDelete.name}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{userToDelete.email} • {userToDelete.role}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deletingUser}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmDelete} disabled={deletingUser} style={{ background: '#ef4444', borderColor: '#dc2626' }}>
                {deletingUser ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* STORE OWNER WARNING MODAL */}
      <Modal isOpen={isOwnerWarningOpen} onClose={() => setIsOwnerWarningOpen(false)} title="Cannot Remove Store Owner">
        {ownerWarningUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b' }}>
              <AlertTriangle size={28} />
              <span style={{ fontSize: '15px', fontWeight: 700 }}>
                Cannot remove this store owner because they currently manage {ownerWarningUser.stores?.length} store{ownerWarningUser.stores?.length > 1 ? 's' : ''}. Reassign the stores before deleting the owner.
              </span>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>MANAGED STORES</span>
              {ownerWarningUser.stores?.map((store) => (
                <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <Store size={16} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{store.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsOwnerWarningOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;