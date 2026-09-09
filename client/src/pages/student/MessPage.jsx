import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import messService from '../../services/messService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MEAL_ICONS = {
  BREAKFAST: '☕',
  LUNCH: '🍛',
  SNACKS: '🥪',
  DINNER: '🍲',
};

export default function StudentMessPage() {
  const { user, logout } = useAuth();

  const [menu, setMenu] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Feedback form state
  const [feedbackMenuId, setFeedbackMenuId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await messService.getMenu();
      setMenu(data);
    } catch (err) {
      setError('Unable to load mess schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const dayMeals = menu.filter((item) => item.dayOfWeek === selectedDay);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMenuId) return;

    setSubmittingFeedback(true);
    setError('');
    setSuccessMsg('');
    try {
      await messService.submitFeedback(feedbackMenuId, {
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      setSuccessMsg('Thank you! Your meal feedback has been submitted.');
      setFeedbackMenuId(null);
      setComment('');
      setRating(5);
      await loadMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Student Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/student/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/student/complaints" style={styles.navLink}>My Complaints</Link>
          <Link to="/student/mess" style={styles.navLinkActive}>Mess Menu</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>Weekly Mess Schedule</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              View daily meal items, student ratings, and submit food quality feedback.
            </p>
          </div>
        </div>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Day Selector Pills */}
        <div style={styles.daySelector}>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                setFeedbackMenuId(null);
              }}
              style={selectedDay === day ? styles.dayBtnActive : styles.dayBtn}
            >
              {day}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.centerBox}>
            <p style={{ color: '#64748b' }}>Loading weekly menu...</p>
          </div>
        ) : dayMeals.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ color: '#64748b' }}>No menu published for {selectedDay} yet.</p>
          </div>
        ) : (
          <div style={styles.mealsGrid}>
            {dayMeals.map((meal) => (
              <div key={meal.id} style={styles.mealCard}>
                <div style={styles.mealHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{MEAL_ICONS[meal.mealType] || '🍽️'}</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{meal.mealType}</strong>
                  </div>

                  {meal.averageRating ? (
                    <div style={styles.ratingBadge}>
                      ⭐ {meal.averageRating} / 5 ({meal.feedbackCount})
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No ratings yet</span>
                  )}
                </div>

                <div style={styles.itemsBox}>
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {meal.items}
                  </p>
                </div>

                {/* Feedback action button */}
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  {feedbackMenuId === meal.id ? (
                    <button
                      onClick={() => setFeedbackMenuId(null)}
                      style={styles.cancelFeedbackBtn}
                    >
                      Cancel Rating
                    </button>
                  ) : (
                    <button
                      onClick={() => setFeedbackMenuId(meal.id)}
                      style={styles.rateBtn}
                    >
                      ⭐ Rate & Review Meal
                    </button>
                  )}
                </div>

                {/* Inline Feedback Form */}
                {feedbackMenuId === meal.id && (
                  <form onSubmit={handleFeedbackSubmit} style={styles.feedbackForm}>
                    <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b', fontSize: '0.9rem' }}>
                      Submit Feedback for {meal.mealType}
                    </h4>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem' }}>
                        Rating (1 to 5 Stars) *
                      </label>
                      <select
                        style={styles.select}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Below Average)</option>
                        <option value={1}>⭐ (1 - Poor)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.3rem' }}>
                        Optional Comment / Suggestion
                      </label>
                      <input
                        style={styles.input}
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="e.g. Food was fresh and served hot."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      style={styles.submitFeedbackBtn}
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}

                {/* Display Student Comments */}
                {meal.feedbacks && meal.feedbacks.length > 0 && (
                  <div style={styles.feedbackList}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Recent Resident Reviews:
                    </span>
                    {meal.feedbacks.slice(0, 3).map((fb) => (
                      <div key={fb.id} style={styles.feedbackItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <strong>{fb.student?.name || 'Student'}</strong>
                          <span>{'⭐'.repeat(fb.rating)}</span>
                        </div>
                        {fb.comment && (
                          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                            "{fb.comment}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLink: { color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
  navLinkActive: { color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem 1.5rem', maxWidth: '960px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  success: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  daySelector: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' },
  dayBtn: { background: '#fff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' },
  dayBtnActive: { background: '#2563eb', border: '1px solid #2563eb', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  centerBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  emptyBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  mealsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' },
  mealCard: { background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  mealHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  ratingBadge: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 },
  itemsBox: { background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #f1f5f9', flex: 1 },
  rateBtn: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  cancelFeedbackBtn: { background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' },
  feedbackForm: { background: '#f8fafc', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '6px', marginTop: '1rem' },
  select: { width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', boxSizing: 'border-box' },
  input: { width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', boxSizing: 'border-box' },
  submitFeedbackBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  feedbackList: { marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' },
  feedbackItem: { background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.4rem' },
};
