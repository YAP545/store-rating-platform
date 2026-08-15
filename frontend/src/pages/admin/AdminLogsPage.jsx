import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { AuthContext } from '../../context/AuthContext';
import {
  Scroll,
  Search,
  Filter,
  RefreshCw,
  X,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

const AdminLogsPage = () => {
  const { showToast } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // ==========================================
  // FETCH LOGS FROM API
  // ==========================================
  const fetchLogs = async (isRefresh = false, pageNum = meta.page) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = {
        page: pageNum,
        limit: meta.limit,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (actionFilter) params.action = actionFilter;
      if (moduleFilter) params.module = moduleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/admin/logs', { params });

      const logsData = res.data?.data || [];
      const metaData = res.data?.meta || {
        page: pageNum,
        limit: 10,
        total: logsData.length,
        totalPages: 1,
      };

      setLogs(logsData);
      setMeta(metaData);
    } catch (err) {
      console.error('Failed to load logs:', err);
      showToast('Failed to load audit logs.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(false, 1);
  }, [search, actionFilter, moduleFilter, statusFilter, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    setMeta((prev) => ({ ...prev, page: newPage }));
    fetchLogs(false, newPage);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('');
    setModuleFilter('');
    setStatusFilter('');
    setSortBy('createdAt');
    setSortOrder('DESC');
  };

  // ==========================================
  // TABLE COLUMNS DEFINITION
  // ==========================================
  const columns = [
    {
      label: 'Date & Time',
      field: 'createdAt',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--text-main)', fontWeight: 500 }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      label: 'User / Admin',
      field: 'userName',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>
            {row.userName || 'Guest / Unauthenticated'}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {row.userEmail || '—'}
          </span>
        </div>
      ),
    },
    {
      label: 'Action',
      field: 'action',
      sortable: true,
      render: (row) => {
        let badgeStyle = { background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.3)' };

        if (row.action === 'LOGIN' || row.action === 'LOGOUT') {
          badgeStyle = { background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.3)' };
        } else if (row.action.includes('CREATED') || row.action === 'CREATE') {
          badgeStyle = { background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' };
        } else if (row.action === 'PASSWORD_CHANGE' || row.action === 'UPDATE') {
          badgeStyle = { background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)' };
        } else if (row.action.includes('DELETE')) {
          badgeStyle = { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' };
        }

        return (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-block',
              ...badgeStyle,
            }}
          >
            {row.action}
          </span>
        );
      },
    },
    {
      label: 'Module',
      field: 'module',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {row.module || 'SYSTEM'}
        </span>
      ),
    },
    {
      label: 'Description',
      field: 'description',
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {row.description}
        </span>
      ),
    },
    {
      label: 'IP Address',
      field: 'ipAddress',
      render: (row) => (
        <code
          style={{
            fontSize: '12px',
            background: 'rgba(0, 0, 0, 0.05)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)',
          }}
        >
          {row.ipAddress || '127.0.0.1'}
        </code>
      ),
    },
    {
      label: 'Status',
      field: 'status',
      sortable: true,
      render: (row) => {
        const isSuccess = row.status === 'SUCCESS';
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: isSuccess ? '#10b981' : '#ef4444',
              border: isSuccess ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {isSuccess ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
            {row.status || 'SUCCESS'}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* ========================================
          HEADER
      ======================================== */}
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Admin Logs</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
            Track administrative actions and platform activity
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => fetchLogs(true, meta.page)}
          disabled={refreshing || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? 'logs-spin 1s linear infinite' : 'none',
            }}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* ========================================
          FILTERS & SEARCH BAR
      ======================================== */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* SEARCH */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by user, email, action, module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
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
        </div>

        {/* ACTION FILTER */}
        <select
          className="form-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
          <option value="STORE_CREATED">STORE_CREATED</option>
          <option value="USER_CREATED">USER_CREATED</option>
        </select>

        {/* MODULE FILTER */}
        <select
          className="form-select"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">All Modules</option>
          <option value="AUTH">AUTH</option>
          <option value="USERS">USERS</option>
          <option value="STORES">STORES</option>
          <option value="RATINGS">RATINGS</option>
          <option value="REPORTS">REPORTS</option>
          <option value="SETTINGS">SETTINGS</option>
        </select>

        {/* STATUS FILTER */}
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '140px' }}
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
        </select>

        {/* RESET BUTTON */}
        {(search || actionFilter || moduleFilter || statusFilter) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* ========================================
          DATA TABLE
      ======================================== */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No activity logs found"
      />

      {/* ========================================
          PAGINATION
      ======================================== */}
      {!loading && logs.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          limit={meta.limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* ANIMATION STYLES */}
      <style>{`
        @keyframes logs-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogsPage;
