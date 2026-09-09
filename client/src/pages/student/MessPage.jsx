import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import messService from '../../services/messService';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import {
  Coffee,
  Utensils,
  Soup,
  Sandwich,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
  Sparkles,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MEAL_CONFIG = {
  BREAKFAST: {
    label: 'Breakfast',
    time: '7:30 AM – 9:30 AM',
    Icon: Coffee,
    color: '#d97706',
    bg: '#fef3c7',
    border: '#fde68a',
  },
  LUNCH: {
    label: 'Lunch',
    time: '12:30 PM – 2:30 PM',
    Icon: Utensils,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  SNACKS: {
    label: 'Evening Snacks',
    time: '5:00 PM – 6:15 PM',
    Icon: Sandwich,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  DINNER: {
    label: 'Dinner',
    time: '7:45 PM – 9:45 PM',
    Icon: Soup,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
};

export default function StudentMessPage() {
  const { user } = useAuth();

  const [menu, setMenu] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMealForRating, setSelectedMealForRating] = useState(null);
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

  const openRatingModal = (meal) => {
    setSelectedMealForRating(meal);
    setRating(5);
    setComment('');
    setRatingModalOpen(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMealForRating) return;

    setSubmittingFeedback(true);
    setError('');
    setSuccessMsg('');
    try {
      await messService.submitFeedback(selectedMealForRating.id, {
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      setSuccessMsg(`Thank you! Your feedback for ${selectedMealForRating.mealType} has been submitted.`);
      setRatingModalOpen(false);
      await loadMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <AppShell
      title="Weekly Mess Schedule & Reviews"
      subtitle="View daily dining menus, resident food ratings, and submit meal quality feedback"
    >
      {/* Feedback status notifications */}
      {successMsg && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            style={{ color: '#059669', fontSize: '1rem', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fff1f2',
            color: '#9f1239',
            border: '1px solid #fecdd3',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertCircle size={16} color="#e11d48" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Day Selector Tabs ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        {DAYS.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                border: `1px solid ${isActive ? '#4f46e5' : '#e2e8f0'}`,
                boxShadow: isActive ? '0 2px 4px rgba(79, 70, 229, 0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* ── Meals Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          Loading dining menu for {selectedDay}...
        </div>
      ) : dayMeals.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No menu published for ${selectedDay}`}
          description="The hostel administration has not published meal items for this day yet."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {dayMeals.map((meal) => {
            const config = MEAL_CONFIG[meal.mealType] || {
              label: meal.mealType,
              time: 'Meal Slot',
              Icon: Utensils,
              color: '#4f46e5',
              bg: '#eef2ff',
              border: '#c7d2fe',
            };
            const { Icon } = config;

            return (
              <div
                key={meal.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Meal Card Top Banner */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {config.label}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {config.time}
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {meal.averageRating ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      <Star size={13} fill="#d97706" color="#d97706" />
                      <span>{meal.averageRating}</span>
                      <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 500 }}>
                        ({meal.feedbackCount})
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      No reviews
                    </span>
                  )}
                </div>

                {/* Meal Items */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Menu Items
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    {meal.items}
                  </p>
                </div>

                {/* Action Row */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {meal.feedbacks?.length || 0} resident review{meal.feedbacks?.length === 1 ? '' : 's'}
                  </span>

                  <button
                    onClick={() => openRatingModal(meal)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#eef2ff',
                      color: '#4f46e5',
                      border: '1px solid #c7d2fe',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4f46e5';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eef2ff';
                      e.currentTarget.style.color = '#4f46e5';
                    }}
                  >
                    <Star size={14} />
                    <span>Rate & Review</span>
                  </button>
                </div>

                {/* Recent Reviews preview */}
                {meal.feedbacks && meal.feedbacks.length > 0 && (
                  <div
                    style={{
                      padding: '0.85rem 1.5rem 1.25rem',
                      background: '#f8fafc',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Recent Feedback:
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {meal.feedbacks.slice(0, 2).map((fb) => (
                        <div
                          key={fb.id}
                          style={{
                            background: '#ffffff',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.2rem',
                            }}
                          >
                            <strong style={{ color: '#0f172a' }}>{fb.student?.name || 'Resident'}</strong>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  fill={s <= fb.rating ? '#f59e0b' : '#e2e8f0'}
                                  color={s <= fb.rating ? '#f59e0b' : '#cbd5e1'}
                                />
                              ))}
                            </div>
                          </div>
                          {fb.comment && (
                            <div style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              "{fb.comment}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rate & Review Modal Dialog ────────────────────────────────── */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title={`Review ${selectedMealForRating?.mealType || 'Meal'}`}
        subtitle={`${selectedDay} • ${selectedMealForRating?.items || ''}`}
      >
        <form onSubmit={handleFeedbackSubmit}>
          {/* Star selector */}
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.75rem',
              }}
            >
              Overall Meal Quality Rating *
            </label>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  key={starNum}
                  type="button"
                  onClick={() => setRating(starNum)}
                  style={{
                    padding: '0.4rem',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Star
                    size={32}
                    fill={starNum <= rating ? '#f59e0b' : 'none'}
                    color={starNum <= rating ? '#f59e0b' : '#cbd5e1'}
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706' }}>
              {rating === 5 && '⭐⭐⭐⭐⭐ 5 Stars — Excellent Quality'}
              {rating === 4 && '⭐⭐⭐⭐ 4 Stars — Good'}
              {rating === 3 && '⭐⭐⭐ 3 Stars — Average'}
              {rating === 2 && '⭐⭐ 2 Stars — Needs Improvement'}
              {rating === 1 && '⭐ 1 Star — Poor'}
            </div>
          </div>

          {/* Optional review comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem',
              }}
            >
              Feedback / Suggestions (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Sambhar was delicious today, but puris were a bit oily."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setRatingModalOpen(false)}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submittingFeedback}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: submittingFeedback ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
