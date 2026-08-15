import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import StoreDetailsModal from '../../components/common/StoreDetailsModal';
import { AuthContext } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  Search,
  Award,
  X,
  BarChart3,
  Eye,
  Sparkles,
  TrendingUp,
  Activity,
  Pencil,
  Download,
  GitCompare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileSpreadsheet,
} from 'lucide-react';

const OwnerDashboardPage = () => {
  const { showToast } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [filterStars, setFilterStars] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  // EDIT STORE MODAL
  const [isEditStoreModalOpen, setIsEditStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', address: '' });
  const [updatingStore, setUpdatingStore] = useState(false);

  // EXPORT RATINGS DATA
  const [dateRangeMode, setDateRangeMode] = useState('THIS_MONTH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // ANALYTICS & COMPARISON DATA
  const [analyticsData, setAnalyticsData] = useState(null);

  // STORE DETAILS MODAL
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchDashboardData = async (currentPage = 1) => {
    setLoading(true);
    try {
      let url = `/owner/dashboard?page=${currentPage}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (debouncedSearch.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      const res = await API.get(url);
      setData(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load owner dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const res = await API.get('/owner/analytics');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load owner analytics:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData(page);
    fetchAnalyticsData();
  }, [debouncedSearch, sortBy, sortOrder, page]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // EDIT STORE HANDLERS
  const handleOpenEditStoreModal = (st) => {
    if (!st) return;
    setEditingStore(st);
    setEditFormData({
      name: st.name || '',
      email: st.email || '',
      address: st.address || '',
    });
    setIsEditStoreModalOpen(true);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    const targetStore = editingStore || data?.store;
    if (!targetStore?.id) return;

    if (!editFormData.name.trim()) {
      showToast('Store name is required', 'error');
      return;
    }
    if (!editFormData.address.trim()) {
      showToast('Store address is required', 'error');
      return;
    }

    setUpdatingStore(true);
    try {
      await API.put(`/stores/${targetStore.id}`, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        address: editFormData.address.trim(),
      });

      showToast('Store updated successfully', 'success');
      setIsEditStoreModalOpen(false);
      fetchDashboardData(page);
      fetchAnalyticsData();
    } catch (err) {
      console.error('Update store error:', err);
      showToast(err.response?.data?.message || 'Failed to update store information', 'error');
    } finally {
      setUpdatingStore(false);
    }
  };

  // EXPORT RATINGS CSV HANDLER
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      let params = {};
      const now = new Date();

      if (dateRangeMode === 'THIS_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        params.fromDate = start.toISOString().split('T')[0];
        params.toDate = now.toISOString().split('T')[0];
      } else if (dateRangeMode === 'LAST_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        params.fromDate = start.toISOString().split('T')[0];
        params.toDate = end.toISOString().split('T')[0];
      } else if (dateRangeMode === 'CUSTOM') {
        if (!fromDate || !toDate) {
          showToast('Please select both From Date and To Date for custom date range.', 'error');
          setExporting(false);
          return;
        }
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      let url = '/owner/export-ratings?';
      if (params.fromDate) url += `fromDate=${params.fromDate}&`;
      if (params.toDate) url += `toDate=${params.toDate}&`;

      const res = await API.get(url);
      const exportData = res.data?.data || [];
      const summary = res.data?.summary || {};

      if (exportData.length === 0) {
        showToast('No ratings found for the selected date range.', 'info');
        setExporting(false);
        return;
      }

      // Generate CSV string
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Rating ID,Store Name,Rating,Customer Name,Customer Email,Rating Date\n';

      exportData.forEach((row) => {
        const dateStr = new Date(row.createdAt).toLocaleDateString();
        const safeName = `"${(row.userName || '').replace(/"/g, '""')}"`;
        const safeStore = `"${(row.storeName || '').replace(/"/g, '""')}"`;
        csvContent += `${row.ratingId},${safeStore},${row.rating},${safeName},${row.userEmail},${dateStr}\n`;
      });

      csvContent += '\nSUMMARY STATISTICS\n';
      csvContent += `Total Ratings,${summary.totalRatings || 0}\n`;
      csvContent += `Average Rating,${summary.averageRating || '0.00'}\n`;
      csvContent += `5 Star Ratings,${summary.distribution?.[5] || 0}\n`;
      csvContent += `4 Star Ratings,${summary.distribution?.[4] || 0}\n`;
      csvContent += `3 Star Ratings,${summary.distribution?.[3] || 0}\n`;
      csvContent += `2 Star Ratings,${summary.distribution?.[2] || 0}\n`;
      csvContent += `1 Star Ratings,${summary.distribution?.[1] || 0}\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `owner_store_ratings_${dateRangeMode.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Ratings report exported successfully!', 'success');
    } catch (err) {
      console.error('Export ratings error:', err);
      showToast('Failed to export rating report', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (!data && loading) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading owner dashboard data...</p>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Store size={40} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>No Store Assigned</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>No store has been assigned to your owner account yet. Please contact a System Administrator.</p>
      </div>
    );
  }

  const { store, ratingUsers } = data;
  const assignedStores = data.stores || (store ? [store] : []);
  const rawRatingList = ratingUsers?.data || [];

  // CALCULATE EXACT RATING DISTRIBUTION (5★, 4★, 3★, 2★, 1★)
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rawRatingList.forEach((r) => {
    const score = Number(r.rating);
    if (score >= 1 && score <= 5) {
      ratingCounts[score] = (ratingCounts[score] || 0) + 1;
    }
  });

  // Filter ratings by star filter
  const displayedRatings =
    filterStars === 'ALL'
      ? rawRatingList
      : rawRatingList.filter((r) => Number(r.rating) === Number(filterStars));

  const columns = [
    {
      label: 'Customer Name',
      field: 'userName',
      sortable: true,
      render: (row) => <span style={{ fontWeight: 600 }}>{row.userName}</span>,
    },
    { label: 'Customer Email', field: 'userEmail', sortable: true },
    {
      label: 'Store',
      key: 'storeName',
      render: () => <span style={{ fontWeight: 500 }}>{store.name}</span>,
    },
    {
      label: 'Submitted Rating',
      field: 'rating',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRating value={row.rating} readOnly size={16} />
          <span style={{ fontWeight: 700, color: '#fbbf24' }}>{row.rating} / 5</span>
        </div>
      ),
    },
    {
      label: 'Rating Date',
      field: 'createdAt',
      sortable: true,
      render: (row) =>
        new Date(row.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  const monthlyComparison = analyticsData?.monthlyComparison;
  const storeComparisonList = analyticsData?.storeComparison || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Store Owner Dashboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
          Manage your assigned stores and monitor customer feedback analytics
        </p>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard title="My Stores" value={data?.storesCount || assignedStores.length} icon={Store} color="#6366f1" />
        <StatCard title="Total Ratings" value={data?.overallTotalRatings ?? store.totalRatings} icon={Users} color="#10b981" />
        <StatCard title="Average Rating" value={`${data?.overallAverageRating || store.averageRating} / 5`} icon={Star} color="#f59e0b" />
        <StatCard title="5★ Ratings" value={ratingCounts[5]} icon={Award} color="#ec4899" />
        <StatCard title="4★ Ratings" value={ratingCounts[4]} icon={Award} color="#3b82f6" />
        <StatCard title="3★ Ratings" value={ratingCounts[3]} icon={Award} color="#8b5cf6" />
      </div>

      {/* MY STORES SECTION - RENDER ALL ASSIGNED STORES */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Store size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>My Assigned Stores ({assignedStores.length})</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assignedStores.map((st) => (
            <div
              key={st.id}
              className="glass-panel"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                      <Store size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#ffffff' }}>{st.name}</h3>
                      <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '13px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={14} /> {st.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {st.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Overall Rating</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <StarRating value={parseFloat(st.averageRating)} readOnly size={18} />
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>{st.averageRating}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>({st.totalRatings} ratings)</span>
                    </div>
                  </div>

                  {/* EDIT OWN STORE BUTTON */}
                  <button className="btn btn-secondary" onClick={() => handleOpenEditStoreModal(st)}>
                    <Pencil size={15} /> Edit Store
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedStoreForDetails(st);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          STORE COMPARISON SECTION (ITEM 3)
      ========================================== */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <GitCompare size={20} color="#6366f1" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Store Performance Comparison</h3>
        </div>

        {storeComparisonList.length <= 1 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              Store comparison becomes available when you manage multiple stores.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {storeComparisonList.map((compStore) => (
              <div
                key={compStore.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>{compStore.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <StarRating value={parseFloat(compStore.averageRating)} readOnly size={16} />
                  <strong style={{ color: '#fbbf24', fontSize: '16px' }}>{compStore.averageRating} ★</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({compStore.totalRatings} ratings)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{s} Star</span>
                      <strong>{compStore.distribution[s]} ({compStore.percentages[s]}%)</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==========================================
          MONTH-TO-MONTH COMPARISON SECTION (ITEM 4)
      ========================================== */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <TrendingUp size={20} color="#10b981" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Month-to-Month Performance Comparison</h3>
        </div>

        {!monthlyComparison || !monthlyComparison.hasHistoricalData ? (
          <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {monthlyComparison?.message || 'Not enough historical data for comparison.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {/* CURRENT MONTH */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {monthlyComparison.currentMonth.name} (Current Month)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                <strong style={{ fontSize: '24px', color: 'var(--text-main)' }}>{monthlyComparison.currentMonth.count} Ratings</strong>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24' }}>{monthlyComparison.currentMonth.avg} / 5 Avg</span>
              </div>
            </div>

            {/* PREVIOUS MONTH */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {monthlyComparison.previousMonth.name} (Previous Month)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                <strong style={{ fontSize: '24px', color: 'var(--text-main)' }}>{monthlyComparison.previousMonth.count} Ratings</strong>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24' }}>{monthlyComparison.previousMonth.avg} / 5 Avg</span>
              </div>
            </div>

            {/* PERFORMANCE DIFFERENCE */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Month-over-Month Delta
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700 }}>
                  {monthlyComparison.difference.improved ? (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={18} /> ↑ {monthlyComparison.difference.countDiff} Ratings ({monthlyComparison.difference.ratingDiff >= 0 ? '+' : ''}{monthlyComparison.difference.ratingDiff} pts)
                    </span>
                  ) : monthlyComparison.difference.declined ? (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownRight size={18} /> ↓ {monthlyComparison.difference.countDiff} Ratings ({monthlyComparison.difference.ratingDiff} pts)
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Minus size={18} /> Unchanged
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          DOWNLOAD RATING DATA & EXPORT SUMMARY (ITEMS 2 & 5)
      ========================================== */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} color="#10b981" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Export Rating Data</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Download detailed rating reports for your assigned stores</p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleExportCSV} disabled={exporting}>
            <FileSpreadsheet size={16} /> {exporting ? 'Exporting...' : 'Export CSV Report'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Select Period
            </label>
            <select className="form-select" value={dateRangeMode} onChange={(e) => setDateRangeMode(e.target.value)}>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {dateRangeMode === 'CUSTOM' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">From Date</label>
                <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">To Date</label>
                <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* RATING PERFORMANCE DISTRIBUTION CHART */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <BarChart3 size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Rating Performance Breakdown</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0;
            const totalOwnerRatings = data?.overallTotalRatings || rawRatingList.length;
            const percentage = totalOwnerRatings > 0 ? Math.round((count / totalOwnerRatings) * 100) : 0;

            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '54px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {stars} Star
                </span>
                <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', height: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      background: stars >= 4 ? '#f59e0b' : stars === 3 ? '#6366f1' : '#ef4444',
                      height: '100%',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ width: '70px', fontSize: '13px', fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT RATINGS SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#6366f1" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent Customer Ratings</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* STAR RATING FILTER PILLS */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn btn-sm ${filterStars === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStars('ALL')}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${filterStars === String(s) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStars(String(s))}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {s}★
                </button>
              ))}
            </div>

            {/* SEARCH BAR */}
            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '12px', paddingTop: '8px', paddingBottom: '8px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={displayedRatings}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No customer ratings match your criteria"
        />

        <Pagination
          page={ratingUsers.meta.page}
          totalPages={ratingUsers.meta.totalPages}
          totalItems={ratingUsers.meta.total}
          limit={ratingUsers.meta.limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* EDIT OWN STORE MODAL */}
      <Modal isOpen={isEditStoreModalOpen} onClose={() => setIsEditStoreModalOpen(false)} title="Edit Store Details">
        <form onSubmit={handleSaveStore}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-input"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className="form-input"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="form-input"
              rows={3}
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditStoreModalOpen(false)} disabled={updatingStore}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingStore}>
              {updatingStore ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STORE DETAILS MODAL */}
      <StoreDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        store={selectedStoreForDetails}
      />
    </div>
  );
};

export default OwnerDashboardPage;
