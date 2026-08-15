import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { AuthContext } from '../../context/AuthContext';

import {
  Store,
  Users,
  UserCheck,
  Star,
  TrendingUp,
  RefreshCw,
  Trophy,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { showToast } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalStores: 0,
    totalUsers: 0,
    totalOwners: 0,
    totalRatings: 0,
    averageRating: 0,
  });

  const [healthData, setHealthData] = useState({
    storesWithNoRatings: 0,
    storesBelowThreeStars: 0,
    topPerformer: null,
  });

  const [topStores, setTopStores] = useState([]);

  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 1. Fetch Backend Admin Dashboard API
      const adminDashRes = await API.get('/admin/dashboard');
      const adminDashData = adminDashRes.data || {};

      if (adminDashData.health) {
        setHealthData(adminDashData.health);
      }

      // 2. Fetch Stores
      const storesResponse = await API.get('/admin/stores?page=1&limit=100&sortBy=createdAt&sortOrder=DESC');
      const storesData = storesResponse.data?.data || [];
      const totalStores = Number(storesResponse.data?.meta?.total) || storesData.length;

      // 3. Fetch All Users
      const usersResponse = await API.get('/admin/users?page=1&limit=100');
      const usersData = usersResponse.data?.data || [];
      const totalUsers = Number(usersResponse.data?.meta?.total) || usersData.length;

      // 4. Fetch Store Owners
      const ownersResponse = await API.get('/admin/users?page=1&limit=100&role=STORE_OWNER');
      const ownersData = ownersResponse.data?.data || [];
      const totalOwners = Number(ownersResponse.data?.meta?.total) || ownersData.length;

      // 5. Fetch All Ratings Distribution
      const ratingsResponse = await API.get('/ratings/admin/all');
      const ratingsMeta = ratingsResponse.data?.meta || {};
      const totalRatings = Number(ratingsMeta.total) || 0;
      const distribution = ratingsMeta.distribution || {};

      const ratingDistributionData = {
        5: Number(distribution[5]) || 0,
        4: Number(distribution[4]) || 0,
        3: Number(distribution[3]) || 0,
        2: Number(distribution[2]) || 0,
        1: Number(distribution[1]) || 0,
      };

      // Calculate Average Rating
      let weightedRatingTotal = 0;
      storesData.forEach((store) => {
        const rating = Number(store.overallRating) || 0;
        const ratings = Number(store.totalRatings) || 0;
        weightedRatingTotal += rating * ratings;
      });

      const averageRating = totalRatings > 0 ? weightedRatingTotal / totalRatings : 0;

      // Top Rated Stores
      const sortedStores = [...storesData]
        .filter((store) => Number(store.totalRatings || 0) > 0)
        .sort((a, b) => {
          const ratingDifference = Number(b.overallRating || 0) - Number(a.overallRating || 0);
          if (ratingDifference !== 0) return ratingDifference;
          return Number(b.totalRatings || 0) - Number(a.totalRatings || 0);
        })
        .slice(0, 5);

      setStats({
        totalStores: adminDashData.totalStores || totalStores,
        totalUsers: adminDashData.totalUsers || totalUsers,
        totalOwners: adminDashData.totalOwners || totalOwners,
        totalRatings: adminDashData.totalRatings || totalRatings,
        averageRating,
      });

      setTopStores(sortedStores);
      setRatingDistribution(ratingDistributionData);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</span>
        <strong style={{ fontSize: '28px', lineHeight: 1.1, fontWeight: 700 }}>
          {loading ? '—' : value}
        </strong>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</span>
      </div>
    </div>
  );

  const ratingLevels = [5, 4, 3, 2, 1];
  const maxRatingCount = Math.max(...ratingLevels.map((level) => ratingDistribution[level]), 1);

  return (
    <div style={{ width: '100%' }}>
      {/* HEADER */}
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
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
            Overview of your store rating platform
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw
            size={16}
            style={{ animation: refreshing ? 'dashboard-spin 1s linear infinite' : 'none' }}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          description="Registered stores"
          icon={Store}
          iconClass="dashboard-icon-blue"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon={Users}
          iconClass="dashboard-icon-green"
        />
        <StatCard
          title="Store Owners"
          value={stats.totalOwners}
          description="Users managing stores"
          icon={UserCheck}
          iconClass="dashboard-icon-purple"
        />
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          description="Ratings submitted"
          icon={Star}
          iconClass="dashboard-icon-yellow"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(2)}
          description="Across all stores"
          icon={TrendingUp}
          iconClass="dashboard-icon-red"
        />
      </div>

      {/* ==========================================
          ADMIN PLATFORM HEALTH & INSIGHTS (ITEM 3)
      ========================================== */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          color: '#ffffff',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Activity size={22} color="#10b981" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Platform Health & Insights
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {/* HEALTH SUMMARY */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px 0', fontWeight: 600 }}>
              Platform Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>🟢</span> <strong>{stats.totalStores}</strong> Active Registered Stores
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>🟢</span> <strong>{stats.totalUsers}</strong> Total Registered Users
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>🟢</span> <strong>{stats.totalOwners}</strong> Assigned Store Owners
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981' }}>🟢</span> <strong>{stats.totalRatings}</strong> Customer Ratings Submitted
              </div>
            </div>
          </div>

          {/* ATTENTION NEEDED */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px 0', fontWeight: 600 }}>
              Attention Needed
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              {healthData.storesWithNoRatings > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                  <AlertTriangle size={16} />
                  <span>
                    <strong>{healthData.storesWithNoRatings}</strong> {healthData.storesWithNoRatings === 1 ? 'store has' : 'stores have'} no ratings yet.
                  </span>
                </div>
              ) : null}

              {healthData.storesBelowThreeStars > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                  <AlertTriangle size={16} />
                  <span>
                    <strong>{healthData.storesBelowThreeStars}</strong> {healthData.storesBelowThreeStars === 1 ? 'store has' : 'stores have'} rating below 3.0 stars.
                  </span>
                </div>
              ) : null}

              {healthData.storesWithNoRatings === 0 && healthData.storesBelowThreeStars === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                  <CheckCircle2 size={16} />
                  <span>All stores are actively rated and performing well.</span>
                </div>
              )}
            </div>
          </div>

          {/* TOP PERFORMER */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px 0', fontWeight: 600 }}>
              Top Performer
            </h3>
            {healthData.topPerformer ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', marginBottom: '4px' }}>
                  <Sparkles size={16} />
                  <strong style={{ fontSize: '15px', color: '#ffffff' }}>{healthData.topPerformer.name}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '6px' }}>
                  <StarRating value={parseFloat(healthData.topPerformer.overallRating)} readOnly size={15} />
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>{healthData.topPerformer.overallRating} / 5</span>
                  <span style={{ color: '#94a3b8' }}>({healthData.topPerformer.totalRatings} ratings)</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No rated stores yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* TOP RATED STORES */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <Trophy size={21} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Top Rated Stores</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
              Highest rated stores on the platform
            </p>
          </div>
        </div>

        {topStores.length === 0 ? (
          <div style={{ padding: '35px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No store ratings available yet.
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
                  padding: '16px 4px',
                  borderBottom: index !== topStores.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    minWidth: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    background:
                      index === 0
                        ? 'rgba(251, 191, 36, 0.15)'
                        : index === 1
                        ? 'rgba(148, 163, 184, 0.15)'
                        : index === 2
                        ? 'rgba(180, 83, 9, 0.15)'
                        : 'rgba(100, 116, 139, 0.10)',
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {store.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {store.totalRatings || 0} {Number(store.totalRatings || 0) === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating value={Number(store.overallRating || 0)} readOnly size={15} />
                  <strong style={{ color: '#fbbf24', minWidth: '38px' }}>
                    {Number(store.overallRating || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RATING DISTRIBUTION GRAPH */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <BarChart3 size={21} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Rating Distribution</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
              Breakdown of submitted ratings
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
          {ratingLevels.map((level) => {
            const count = ratingDistribution[level];
            const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
            const barWidth = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;

            return (
              <div
                key={level}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr 70px',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  {level} Star
                </div>

                <div
                  style={{
                    height: '20px',
                    background: 'rgba(148, 163, 184, 0.15)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      minWidth: count > 0 ? '8px' : '0',
                      background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                      borderRadius: '10px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-color)' }}>{count}</strong> ({percentage.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Ratings</span>
          <strong style={{ fontSize: '20px' }}>{stats.totalRatings}</strong>
        </div>
      </div>

      {/* PLATFORM SUMMARY */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(251, 191, 36, 0.12)',
            color: '#fbbf24',
          }}
        >
          <Star size={21} />
        </div>

        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Platform Rating Overview</h3>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Your platform currently has <strong>{stats.totalRatings}</strong> ratings across{' '}
            <strong>{stats.totalStores}</strong> stores with an average rating of{' '}
            <strong>{stats.averageRating.toFixed(2)}</strong> stars.
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes dashboard-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .dashboard-icon-blue { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
          .dashboard-icon-green { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
          .dashboard-icon-purple { background: rgba(168, 85, 247, 0.12); color: #c084fc; }
          .dashboard-icon-yellow { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
          .dashboard-icon-red { background: rgba(239, 68, 68, 0.12); color: #f87171; }
          @media (max-width: 600px) {
            .dashboard-stat-card { min-height: 105px !important; }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboardPage;
