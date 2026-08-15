import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { AuthContext } from '../../context/AuthContext';

import {
  Store,
  Users,
  Star,
  TrendingUp,
  RefreshCw,
  Download,
  BarChart3,
  Trophy,
  FileText,
} from 'lucide-react';

const AdminReportsPage = () => {
  const { showToast } = useContext(AuthContext);

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalStores: 0,
    totalUsers: 0,
    totalRatings: 0,
    averageRating: 0,
  });

  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const [topStores, setTopStores] = useState([]);
  const [distributionError, setDistributionError] = useState(false);

  // ==========================================
  // FETCH REPORTS DATA
  // ==========================================

  const fetchReportsData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setDistributionError(false);

    try {
      // 1. Fetch Stores
      const storesResponse = await API.get(
        '/admin/stores?page=1&limit=100&sortBy=createdAt&sortOrder=DESC'
      );
      const storesData = storesResponse.data?.data || [];
      const totalStores = Number(storesResponse.data?.meta?.total) || storesData.length;

      // 2. Fetch Users
      const usersResponse = await API.get('/admin/users?page=1&limit=100');
      const usersData = usersResponse.data?.data || [];
      const totalUsers = Number(usersResponse.data?.meta?.total) || usersData.length;

      // 3. Fetch Ratings (includes meta.total and meta.distribution)
      const ratingsResponse = await API.get('/ratings/admin/all');
      const ratingsMeta = ratingsResponse.data?.meta || {};
      const totalRatings = Number(ratingsMeta.total) || 0;
      const distribution = ratingsMeta.distribution || null;

      let ratingDistributionData = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      if (distribution) {
        ratingDistributionData = {
          5: Number(distribution[5]) || 0,
          4: Number(distribution[4]) || 0,
          3: Number(distribution[3]) || 0,
          2: Number(distribution[2]) || 0,
          1: Number(distribution[1]) || 0,
        };
      } else {
        setDistributionError(true);
      }

      // Calculate Average Rating across stores
      let weightedRatingTotal = 0;
      storesData.forEach((store) => {
        const rating = Number(store.overallRating) || 0;
        const ratings = Number(store.totalRatings) || 0;
        weightedRatingTotal += rating * ratings;
      });

      const averageRating = totalRatings > 0 ? weightedRatingTotal / totalRatings : 0;

      // Top Performing Stores (Sorted by Highest Avg Rating, then Total Ratings)
      const sortedStores = [...storesData]
        .filter((store) => Number(store.totalRatings || 0) > 0)
        .sort((a, b) => {
          const ratingDiff = Number(b.overallRating || 0) - Number(a.overallRating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return Number(b.totalRatings || 0) - Number(a.totalRatings || 0);
        })
        .slice(0, 5);

      setStats({
        totalStores,
        totalUsers,
        totalRatings,
        averageRating,
      });

      setRatingDistribution(ratingDistributionData);
      setTopStores(sortedStores);
    } catch (err) {
      console.error('Failed to load reports data:', err);
      showToast('Failed to load reports data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // ==========================================
  // EXPORT HANDLER
  // ==========================================

  const handleExport = (type) => {
    showToast('Export functionality is not available yet.', 'info');
  };

  // ==========================================
  // STAT CARD COMPONENT
  // ==========================================

  const StatCard = ({ title, value, description, icon: Icon, iconClass }) => (
    <div
      className="glass-panel dashboard-stat-card"
      style={{
        padding: '22px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        minHeight: '120px',
      }}
    >
      <div
        className={iconClass}
        style={{
          width: '48px',
          height: '48px',
          minWidth: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        <strong style={{ fontSize: '26px', lineHeight: 1.1, fontWeight: 700 }}>
          {loading ? '—' : value}
        </strong>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {description}
        </span>
      </div>
    </div>
  );

  // Rating levels & calculations
  const ratingLevels = [5, 4, 3, 2, 1];
  const maxRatingCount = Math.max(
    ...ratingLevels.map((lvl) => ratingDistribution[lvl]),
    1
  );

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
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>
            Analytics & Reports
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', margin: 0 }}>
            Comprehensive reporting and platform insights overview
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => fetchReportsData(true)}
            disabled={refreshing || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw
              size={16}
              style={{
                animation: refreshing ? 'reports-spin 1s linear infinite' : 'none',
              }}
            />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => handleExport('Report')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* ========================================
          1. STATISTICS CARDS
      ======================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="TOTAL STORES"
          value={stats.totalStores}
          description="Active Platform Stores"
          icon={Store}
          iconClass="dashboard-icon-blue"
        />

        <StatCard
          title="TOTAL USERS"
          value={stats.totalUsers}
          description="Registered Accounts"
          icon={Users}
          iconClass="dashboard-icon-green"
        />

        <StatCard
          title="TOTAL RATINGS"
          value={stats.totalRatings}
          description="Feedback Submissions"
          icon={Star}
          iconClass="dashboard-icon-yellow"
        />

        <StatCard
          title="AVERAGE RATING"
          value={`${stats.averageRating.toFixed(2)} / 5`}
          description="Global Store Mean"
          icon={TrendingUp}
          iconClass="dashboard-icon-red"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* ========================================
            2. RATING BREAKDOWN
        ======================================== */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Rating Breakdown
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Detailed list of all customer feedback submissions
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading rating breakdown...
            </div>
          ) : distributionError ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Rating distribution unavailable
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ratingLevels.map((star) => {
                const count = ratingDistribution[star] || 0;
                const percentage =
                  stats.totalRatings > 0
                    ? Math.round((count / stats.totalRatings) * 100)
                    : 0;
                const barWidth =
                  maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;

                return (
                  <div
                    key={star}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '75px 1fr 90px',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                      <Star size={15} fill="#f59e0b" color="#f59e0b" />
                      <span>{star} Stars</span>
                    </div>

                    <div style={{ height: '18px', background: '#e2e8f0', borderRadius: '9px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          minWidth: count > 0 ? '6px' : '0',
                          background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                          borderRadius: '9px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{count}</strong> ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================
            3. RATING CHART (VISUAL CSS BAR CHART)
        ======================================== */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Rating Distribution
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Visual bar chart distribution of score feedback
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading rating chart...
            </div>
          ) : distributionError ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Rating distribution unavailable
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '220px', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  height: '160px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px',
                }}
              >
                {ratingLevels.map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage =
                    stats.totalRatings > 0
                      ? Math.round((count / stats.totalRatings) * 100)
                      : 0;
                  const barHeight = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;

                  return (
                    <div
                      key={star}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        height: '100%',
                        justifyContent: 'flex-end',
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {count}
                      </span>
                      <div
                        style={{
                          width: '32px',
                          height: `${Math.max(barHeight, 4)}%`,
                          background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s ease',
                          minHeight: count > 0 ? '6px' : '2px',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
                {ratingLevels.map((star) => (
                  <div key={star} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {star} Star
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          4. STORE PERFORMANCE (TOP PERFORMING STORES)
      ======================================== */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Trophy size={20} color="#f59e0b" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Top Performing Stores
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Highest rated stores ranked by average score and total submission volume
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading top performing stores...
          </div>
        ) : topStores.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No store ratings recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topStores.map((store, index) => (
              <div
                key={store.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 4px',
                  borderBottom:
                    index !== topStores.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    background:
                      index === 0
                        ? 'rgba(251, 191, 36, 0.2)'
                        : index === 1
                        ? 'rgba(148, 163, 184, 0.2)'
                        : index === 2
                        ? 'rgba(217, 119, 6, 0.2)'
                        : 'rgba(226, 232, 240, 0.6)',
                    color:
                      index === 0
                        ? '#d97706'
                        : index === 1
                        ? '#475569'
                        : index === 2
                        ? '#b45309'
                        : 'var(--text-muted)',
                  }}
                >
                  {index + 1}
                </div>

                {/* Store Name & Total Ratings */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                    {store.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {store.totalRatings || 0} {Number(store.totalRatings || 0) === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>

                {/* Star Rating Component & Average Rating Value */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating
                    value={Number(store.overallRating || 0)}
                    readOnly
                    size={15}
                  />
                  <strong style={{ color: '#f59e0b', fontSize: '14px', minWidth: '40px', textAlign: 'right' }}>
                    {Number(store.overallRating || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================
          5. EXPORT SECTION
      ======================================== */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            Available Export Formats
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Export platform data records for offline reporting and archiving
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleExport('Stores CSV')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} />
            Export Stores CSV
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExport('Users CSV')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} />
            Export Users CSV
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => handleExport('Ratings PDF')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} />
            Export Ratings PDF
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes reports-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsPage;
