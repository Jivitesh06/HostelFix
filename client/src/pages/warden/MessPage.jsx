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
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

const MEAL_CONFIG = {
  BREAKFAST: { label: 'Breakfast', time: '7:30 AM – 9:30 AM', Icon: Coffee, color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  LUNCH: { label: 'Lunch', time: '12:30 PM – 2:30 PM', Icon: Utensils, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  SNACKS: { label: 'Evening Snacks', time: '5:00 PM – 6:15 PM', Icon: Sandwich, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  DINNER: { label: 'Dinner', time: '7:45 PM – 9:45 PM', Icon: Soup, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
};

export default function WardenMessPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback'
  const [menu, setMenu] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    dayOfWeek: 'Monday',
    mealType: 'BREAKFAST',
    items: '',
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editItems, setEditItems] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [menuData, feedbackData] = await Promise.all([
        messService.getMenu(),
        messService.getFeedback(),
      ]);
      setMenu(menuData);
      setFeedbacks(feedbackData);
    } catch (err) {
      setError('Unable to load mess information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addForm.items.trim()) return;

    setError('');
    setSuccessMsg('');
    try {
      await messService.createMenuItem({
        dayOfWeek: addForm.dayOfWeek,
        mealType: addForm.mealType,
        items: addForm.items.trim(),
      });
      setSuccessMsg(`New meal slot for ${addForm.dayOfWeek} ${addForm.mealType} created.`);
      setAddModalOpen(false);
      setAddForm({ dayOfWeek: selectedDay, mealType: 'BREAKFAST', items: '' });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add menu entry.');
    }
  };

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setEditItems(meal.items);
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMeal || !editItems.trim()) return;

    setError('');
    setSuccessMsg('');
    try {
      await messService.updateMenuItem(editingMeal.id, { items: editItems.trim() });
      setSuccessMsg('Meal items updated successfully.');
      setEditModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update menu entry.');
    }
  };

  const confirmDelete = (id) => {
    setDeletingMealId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingMealId) return;

    setError('');
    setSuccessMsg('');
    try {
      await messService.deleteMenuItem(deletingMealId);
      setSuccessMsg('Meal entry removed from schedule.');
      setDeleteModalOpen(false);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu entry.');
    }
  };

  const dayMeals = menu.filter((m) => m.dayOfWeek === selectedDay);

  return (
    <AppShell
      title="Mess & Dining Administration"
      subtitle="Publish and update weekly meal menus, and monitor verified resident quality reviews"
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setAddForm({ dayOfWeek: selectedDay, mealType: 'BREAKFAST', items: '' });
              setAddModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={16} />
            <span>Add Meal Entry</span>
          </button>
        </div>
      }
    >
      {/* Feedback Messages */}
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

      {/* ── Tab Switcher Bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          marginBottom: '1.75rem',
        }}
      >
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'menu' ? 700 : 500,
            backgroundColor: activeTab === 'menu' ? '#eef2ff' : 'transparent',
            color: activeTab === 'menu' ? '#4f46e5' : '#64748b',
            border: `1px solid ${activeTab === 'menu' ? '#c7d2fe' : 'transparent'}`,
            cursor: 'pointer',
          }}
        >
          Weekly Menu Schedule ({menu.length} Slots)
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'feedback' ? 700 : 500,
            backgroundColor: activeTab === 'feedback' ? '#eef2ff' : 'transparent',
            color: activeTab === 'feedback' ? '#4f46e5' : '#64748b',
            border: `1px solid ${activeTab === 'feedback' ? '#c7d2fe' : 'transparent'}`,
            cursor: 'pointer',
          }}
        >
          Resident Dining Feedback ({feedbacks.length})
        </button>
      </div>

      {/* ── TAB 1: MENU SCHEDULE ──────────────────────────────────────── */}
      {activeTab === 'menu' && (
        <div>
          {/* Day Selector */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {DAYS.map((day) => {
              const isActive = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
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

          {/* Meals List */}
          {loading ? (
            <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
              Loading dining menu for {selectedDay}...
            </div>
          ) : dayMeals.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={`No meals scheduled for ${selectedDay}`}
              description="Click '+ Add Meal Entry' to publish breakfast, lunch, snacks, or dinner items."
              actionLabel="+ Add Meal Entry"
              onAction={() => {
                setAddForm({ dayOfWeek: selectedDay, mealType: 'BREAKFAST', items: '' });
                setAddModalOpen(true);
              }}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
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
                    }}
                  >
                    <div
                      style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: config.bg,
                            color: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                            {config.label}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {config.time}
                          </div>
                        </div>
                      </div>

                      {meal.averageRating ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <Star size={12} fill="#d97706" color="#d97706" />
                          <span>{meal.averageRating} ({meal.feedbackCount})</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No ratings</span>
                      )}
                    </div>

                    <div style={{ padding: '1.25rem', flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          color: '#1e293b',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          background: '#f8fafc',
                          padding: '0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        {meal.items}
                      </p>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        padding: '0.75rem 1.25rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                      }}
                    >
                      <button
                        onClick={() => openEditModal(meal)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => confirmDelete(meal.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #fecdd3',
                          background: '#fff1f2',
                          color: '#e11d48',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: RESIDENT FEEDBACK ──────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div>
          {feedbacks.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No student feedback submitted yet"
              description="Reviews and ratings submitted by residents will appear here chronologically."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                        {fb.student?.name}
                      </strong>{' '}
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        (Room {fb.student?.roomNumber})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= fb.rating ? '#f59e0b' : '#e2e8f0'}
                          color={s <= fb.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginLeft: '0.35rem' }}>
                        ({fb.rating}/5)
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                    <strong>Meal:</strong> {fb.messMenu?.dayOfWeek} {fb.messMenu?.mealType} &bull; <em>{fb.messMenu?.items}</em>
                  </div>

                  {fb.comment && (
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.875rem',
                        color: '#1e293b',
                        fontStyle: 'italic',
                      }}
                    >
                      "{fb.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal 1: Add Meal Entry ───────────────────────────────────── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Meal Slot to Schedule"
        subtitle="Publish menu items for a specific day and meal category"
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Day of Week *
              </label>
              <select
                value={addForm.dayOfWeek}
                onChange={(e) => setAddForm({ ...addForm, dayOfWeek: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                }}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Meal Type *
              </label>
              <select
                value={addForm.mealType}
                onChange={(e) => setAddForm({ ...addForm, mealType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                }}
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Menu Items (comma-separated) *
            </label>
            <textarea
              rows={3}
              value={addForm.items}
              onChange={(e) => setAddForm({ ...addForm, items: e.target.value })}
              placeholder="e.g. Masala Dosa (2), Coconut Chutney, Sambar, Filter Coffee"
              required
              style={{
                width: '100%',
                padding: '0.65rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
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
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Publish Meal Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Edit Meal Items ──────────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${editingMeal?.dayOfWeek || ''} ${editingMeal?.mealType || ''}`}
        subtitle="Update dishes and food items for this meal slot"
      >
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Food Items *
            </label>
            <textarea
              rows={4}
              value={editItems}
              onChange={(e) => setEditItems(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
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
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 3: Delete Meal Confirmation ─────────────────────────── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Meal Slot"
        subtitle="Confirm removal of this meal slot from the published schedule"
      >
        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
          Are you sure you want to remove this meal slot? Any resident ratings or reviews associated with this slot will also be deleted.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
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
            type="button"
            onClick={handleDelete}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              background: '#e11d48',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Delete Slot
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
