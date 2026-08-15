import React, { useEffect, useState, useContext } from 'react';
import API from '../../services/api';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatCard from '../../components/common/StatCard';
import StoreDetailsModal from '../../components/common/StoreDetailsModal';
import { AuthContext } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Search,
  Store,
  Star,
  Edit3,
  MapPin,
  Mail,
  X,
  UserCheck,
  CheckCircle,
  Award,
  Eye,
  Calendar,
  Sparkles,
  Compass,
  ListFilter,
} from 'lucide-react';

const UserStoresPage = () => {
  const { user, showToast } = useContext(AuthContext);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meta, setMeta] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  // STORE DETAILS MODAL
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // RATING EDIT/SUBMIT MODAL
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // FETCH STORES
  const fetchStores = async (page = 1) => {
    setLoading(true);

    try {
      let url = `/stores?page=${page}&limit=${meta.limit}`;
      const trimmedSearch = debouncedSearch.trim();

      if (trimmedSearch) {
        url += `&search=${encodeURIComponent(trimmedSearch)}`;
      }

      const res = await API.get(url);

      setStores(res.data.data || []);
      setMeta(
        res.data.meta || {
          page,
          limit: meta.limit,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      showToast('Failed to fetch store listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(1);
  }, [debouncedSearch]);

  // STORES RATED BY CURRENT LOGGED-IN USER ONLY
  const myRatedStores = stores.filter((s) => s.userRating !== null);
  const storesRatedByMeCount = myRatedStores.length;

  const userRatingsList = myRatedStores.map((s) => Number(s.userRating.rating));
  const myAvgRating =
    userRatingsList.length > 0
      ? (userRatingsList.reduce((acc, curr) => acc + curr, 0) / userRatingsList.length).toFixed(1)
      : 'N/A';

  // OPEN DETAILS MODAL
  const handleOpenDetailsModal = (store) => {
    setSelectedStoreForDetails(store);
    setIsDetailsModalOpen(true);
  };

  // OPEN RATING MODAL
  const handleOpenRatingModal = (store) => {
    setSelectedStoreForRating(store);

    if (store.userRating) {
      setRatingValue(Number(store.userRating.rating));
    } else {
      setRatingValue(0);
    }

    setIsRatingModalOpen(true);
  };

  // CLOSE RATING MODAL
  const handleCloseRatingModal = () => {
    if (ratingSubmitting) return;

    setIsRatingModalOpen(false);
    setSelectedStoreForRating(null);
    setRatingValue(0);
  };

  // SAVE RATING
  const handleSaveRating = async () => {
    if (!selectedStoreForRating) return;

    if (ratingValue < 1 || ratingValue > 5) {
      showToast('Please select a rating from 1 to 5 stars.', 'error');
      return;
    }

    setRatingSubmitting(true);

    try {
      if (selectedStoreForRating.userRating) {
        await API.put(`/ratings/${selectedStoreForRating.userRating.id}`, {
          rating: ratingValue,
        });

        showToast(
          `Rating for "${selectedStoreForRating.name}" modified to ${ratingValue}/5!`,
          'success'
        );
      } else {
        await API.post('/ratings', {
          storeId: selectedStoreForRating.id,
          rating: ratingValue,
        });

        showToast(
          `Rating for "${selectedStoreForRating.name}" submitted as ${ratingValue}/5!`,
          'success'
        );
      }

      setIsRatingModalOpen(false);
      setSelectedStoreForRating(null);
      setRatingValue(0);

      await fetchStores(meta.page);
    } catch (err) {
      console.error('Rating error:', err);
      showToast(
        err.response?.data?.message || 'Failed to submit rating',
        'error'
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  const scrollToDirectory = () => {
    const el = document.getElementById('stores-directory-heading');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* WELCOME SECTION */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          color: '#ffffff',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#ffffff',
                margin: 0,
              }}
            >
              Welcome back, {user?.name || 'Valued User'}
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#94a3b8',
                marginTop: '6px',
                margin: 0,
              }}
            >
              Discover stores, share your experience, and manage your ratings.
            </p>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={scrollToDirectory}
              style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Compass size={15} /> Browse Stores
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS GRID */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Stores Available"
          value={meta.total}
          icon={Store}
          color="#6366f1"
        />
        <StatCard
          title="My Ratings"
          value={storesRatedByMeCount}
          icon={CheckCircle}
          color="#10b981"
        />
        <StatCard
          title="Average Rating Given"
          value={myAvgRating === 'N/A' ? 'N/A' : `${myAvgRating} / 5`}
          icon={Award}
          color="#f59e0b"
        />
      </div>

      {/* ==========================================
          MY RECENT RATINGS SECTION
      ========================================== */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#fbbf24" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>My Recent Ratings</h2>
          </div>
        </div>

        {myRatedStores.length === 0 ? (
          /* EMPTY STATE */
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ListFilter size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              You haven't rated any stores yet.
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
              Browse registered stores below to share your experience and rate local businesses!
            </p>
            <button
              className="btn btn-primary"
              onClick={scrollToDirectory}
              style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Compass size={15} /> Browse Stores
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {myRatedStores.map((store) => (
              <div
                key={store.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                    {store.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {store.address}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={Number(store.userRating.rating)} readOnly size={16} />
                      <strong style={{ color: '#fbbf24', fontSize: '15px' }}>{store.userRating.rating} / 5</strong>
                    </div>

                    {store.userRating.updatedAt && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(store.userRating.updatedAt || store.userRating.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenDetailsModal(store)}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    <Eye size={14} /> View Store
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOpenRatingModal(store)}
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    <Edit3 size={14} /> Edit Rating
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH BAR & BROWSE STORES DIRECTORY */}
      <div id="stores-directory-heading" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px 0' }}>
          Explore Stores Directory
        </h2>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            position: 'relative',
            maxWidth: '520px',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Search stores by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: '38px',
              paddingRight: search ? '36px' : '12px',
            }}
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

      {/* STORES GRID */}
      {loading ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Loading stores directory...
        </div>
      ) : stores.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          No stores found matching your search query.
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div
              key={store.id}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <div>
                {/* STORE NAME */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      padding: '9px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)',
                    }}
                  >
                    <Store size={21} />
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                      }}
                    >
                      {store.name}
                    </h3>
                    {store.owner?.name && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                      >
                        <UserCheck size={12} /> Managed by {store.owner.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* ADDRESS */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    marginBottom: '8px',
                  }}
                >
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{store.address}</span>
                </div>

                {/* EMAIL */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  <Mail size={16} style={{ flexShrink: 0 }} />
                  <span>{store.email}</span>
                </div>

                {/* OVERALL RATING */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '5px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Overall Rating
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <StarRating
                      value={parseFloat(store.overallRating) || 0}
                      readOnly
                      size={18}
                    />

                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#fbbf24',
                      }}
                    >
                      {store.overallRating || '0.0'} / 5
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ({store.totalRatings || 0})
                    </span>
                  </div>
                </div>

                {/* USER RATING */}
                <div style={{ marginBottom: '14px' }}>
                  {store.userRating ? (
                    <div
                      style={{
                        padding: '9px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '9px',
                        color: '#34d399',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Your Rating: {store.userRating.rating} / 5</span>
                      <StarRating value={Number(store.userRating.rating)} readOnly size={14} />
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '9px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '9px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                      }}
                    >
                      You haven't rated this store yet.
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '13px' }}
                  onClick={() => handleOpenDetailsModal(store)}
                >
                  <Eye size={15} /> Details
                </button>

                <button
                  className={store.userRating ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{ flex: 1, fontSize: '13px' }}
                  onClick={() => handleOpenRatingModal(store)}
                >
                  {store.userRating ? (
                    <>
                      <Edit3 size={15} /> Edit
                    </>
                  ) : (
                    <>
                      <Star size={15} /> Rate
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && stores.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          limit={meta.limit}
          onPageChange={(page) => fetchStores(page)}
        />
      )}

      {/* STORE DETAILS MODAL */}
      <StoreDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        store={selectedStoreForDetails}
        onOpenRatingModal={handleOpenRatingModal}
      />

      {/* RATING MODAL */}
      {selectedStoreForRating && (
        <Modal
          isOpen={isRatingModalOpen}
          onClose={handleCloseRatingModal}
          title={
            selectedStoreForRating.userRating
              ? `Modify Rating for ${selectedStoreForRating.name}`
              : `Rate ${selectedStoreForRating.name}`
          }
        >
          <div
            style={{
              textAlign: 'center',
              padding: '10px 0',
            }}
          >
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                marginBottom: '18px',
              }}
            >
              Select your rating from 1 to 5 stars:
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <StarRating
                value={ratingValue}
                onChange={(value) => setRatingValue(Number(value))}
                size={36}
                readOnly={false}
              />
            </div>

            <p
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#fbbf24',
                marginBottom: '8px',
              }}
            >
              {ratingValue > 0 ? `${ratingValue} / 5 Stars` : 'Select a rating'}
            </p>

            {ratingValue === 0 && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '20px',
                }}
              >
                Click a star to choose your rating.
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={handleCloseRatingModal}
                disabled={ratingSubmitting}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSaveRating}
                disabled={ratingSubmitting || ratingValue === 0}
              >
                {ratingSubmitting
                  ? 'Submitting...'
                  : selectedStoreForRating.userRating
                  ? 'Update Rating'
                  : 'Submit Rating'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserStoresPage;