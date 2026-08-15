import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import Modal from './Modal';
import StarRating from './StarRating';
import { Store, MapPin, Mail, UserCheck, Star, Calendar, Edit3, AlertCircle, MessageSquareOff, ArrowUpDown } from 'lucide-react';

const StoreDetailsModal = ({ isOpen, onClose, store, onOpenRatingModal }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStars, setFilterStars] = useState('ALL');
  const [sortReviews, setSortReviews] = useState('NEWEST');

  useEffect(() => {
    if (isOpen && store?.id) {
      fetchStoreRatings(store.id);
    }
  }, [isOpen, store]);

  const fetchStoreRatings = async (storeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/ratings/store/${storeId}`);
      setRatings(res.data || []);
    } catch (err) {
      console.error('Failed to load store ratings:', err);
      setError('Unable to load store rating details at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  // Calculate real distribution from store ratings data
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    const val = Number(r.rating);
    if (val >= 1 && val <= 5) {
      distribution[val]++;
    }
  });

  const totalReviewsCount = ratings.length;

  // Filter reviews
  let processedRatings =
    filterStars === 'ALL'
      ? [...ratings]
      : ratings.filter((r) => Number(r.rating) === Number(filterStars));

  // Sort reviews
  if (sortReviews === 'HIGHEST') {
    processedRatings.sort((a, b) => Number(b.rating) - Number(a.rating));
  } else if (sortReviews === 'LOWEST') {
    processedRatings.sort((a, b) => Number(a.rating) - Number(b.rating));
  } else {
    // NEWEST
    processedRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Store Profile & Customer Reviews">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
        {/* STORE HEADER PROFILE */}
        <div
          className="glass-panel"
          style={{
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            color: '#ffffff',
            borderRadius: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24' }}>
              <Store size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#ffffff' }}>{store.name}</h2>
              {store.owner?.name ? (
                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <UserCheck size={14} /> Store Owner: <strong style={{ color: '#e2e8f0' }}>{store.owner.name}</strong>
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <UserCheck size={14} /> Store Owner: <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#cbd5e1', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Address:</strong> {store.address}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span><strong>Email:</strong> {store.email}</span>
            </div>
          </div>

          {/* OVERALL RATING & LARGE STAR DISPLAY */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                Overall Rating & Feedback
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <StarRating value={parseFloat(store.overallRating || 0)} readOnly size={22} />
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>
                  {store.overallRating || '0.0'} / 5
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>({store.totalRatings || totalReviewsCount} ratings)</span>
              </div>
            </div>

            {onOpenRatingModal && (
              <button
                className={store.userRating ? 'btn btn-outline' : 'btn btn-primary'}
                onClick={() => {
                  onClose();
                  onOpenRatingModal(store);
                }}
                style={{ fontSize: '13px' }}
              >
                {store.userRating ? (
                  <>
                    <Edit3 size={15} /> Your Rating: {store.userRating.rating}/5 (Modify)
                  </>
                ) : (
                  <>
                    <Star size={15} /> Rate This Store
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '10px',
            }}
          >
            <AlertCircle size={20} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* RATING SUMMARY BREAKDOWN */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0' }}>Rating Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '54px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {stars} ★
                  </span>
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', height: '12px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        background: stars >= 4 ? '#f59e0b' : stars === 3 ? '#6366f1' : '#ef4444',
                        height: '100%',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ width: '80px', fontSize: '13px', fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* REVIEWS & REVIEWS TOOLBAR */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Customer Reviews ({processedRatings.length})
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* STAR RATING FILTERS */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className={`btn btn-sm ${filterStars === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterStars('ALL')}
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${filterStars === String(s) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilterStars(String(s))}
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    {s}★
                  </button>
                ))}
              </div>

              {/* SORT DROPDOWN */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-select"
                  value={sortReviews}
                  onChange={(e) => setSortReviews(e.target.value)}
                  style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                >
                  <option value="NEWEST">Newest</option>
                  <option value="HIGHEST">Highest Rated</option>
                  <option value="LOWEST">Lowest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Loading customer reviews...</p>
            </div>
          ) : processedRatings.length === 0 ? (
            /* EMPTY STATE */
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquareOff size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                {filterStars === 'ALL' ? 'No ratings yet' : `No ${filterStars}-star ratings yet`}
              </h4>
              <p style={{ fontSize: '13px', margin: 0 }}>
                {filterStars === 'ALL'
                  ? 'Be the first customer to submit a rating for this store!'
                  : `No customer feedback with ${filterStars} stars found.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {processedRatings.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                      {rev.user?.name || 'Verified Customer'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating value={Number(rev.rating)} readOnly size={16} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#fbbf24' }}>{rev.rating} / 5 Stars</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StoreDetailsModal;
