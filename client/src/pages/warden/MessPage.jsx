import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import messService from '../../services/messService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

export default function WardenMessPage() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'feedback'
  const [menu, setMenu] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    dayOfWeek: 'Monday',
    mealType: 'BREAKFAST',
    items: '',
  });

  // Edit item state
  const [editingId, setEditingId] = useState(null);
  const [editItems, setEditItems] = useState('');

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
      setSuccessMsg('New meal entry successfully added to the schedule.');
      setShowAddForm(false);
      setAddForm({ dayOfWeek: 'Monday', mealType: 'BREAKFAST', items: '' });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add menu entry.');
    }
  };

  const handleUpdate = async (id) => {
    if (!editItems.trim()) return;
    setError('');
    setSuccessMsg('');
    try {
      await messService.updateMenuItem(id, { items: editItems.trim() });
      setSuccessMsg('Menu items updated successfully.');
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update menu entry.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this meal slot from the schedule?')) {
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await messService.deleteMenuItem(id);
      setSuccessMsg('Menu entry removed.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete menu entry.');
    }
  };

  const dayMeals = menu.filter((m) => m.dayOfWeek === selectedDay);

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#7c3aed', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Warden Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/warden/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/warden/complaints" style={styles.navLink}>All Complaints</Link>
          <Link to="/warden/mess" style={styles.navLinkActive}>Mess Admin</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>Hostel Mess Administration</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Publish weekly meal schedules, edit food items, and monitor student dining feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('menu')}
              style={activeTab === 'menu' ? styles.tabBtnActive : styles.tabBtn}
            >
              Weekly Menu Schedule
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              style={activeTab === 'feedback' ? styles.tabBtnActive : styles.tabBtn}
            >
              Student Feedback ({feedbacks.length})
            </button>
          </div>
        </div>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* ── TAB 1: MENU SCHEDULE ────────────────────────────────────────── */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Day Selector */}
              <div style={styles.daySelector}>
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setEditingId(null);
                    }}
                    style={selectedDay === day ? styles.dayBtnActive : styles.dayBtn}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={styles.addBtn}
              >
                {showAddForm ? '✕ Cancel' : '+ Add Meal Entry'}
              </button>
            </div>

            {/* Add Meal Form */}
            {showAddForm && (
              <form onSubmit={handleCreate} style={styles.addCard}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>
                  Add New Meal to Schedule
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={styles.label}>Day of Week</label>
                    <select
                      style={styles.select}
                      value={addForm.dayOfWeek}
                      onChange={(e) => setAddForm({ ...addForm, dayOfWeek: e.target.value })}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={styles.label}>Meal Type</label>
                    <select
                      style={styles.select}
                      value={addForm.mealType}
                      onChange={(e) => setAddForm({ ...addForm, mealType: e.target.value })}
                    >
                      {MEALS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={styles.label}>Food Items (comma-separated)</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={addForm.items}
                    onChange={(e) => setAddForm({ ...addForm, items: e.target.value })}
                    placeholder="e.g. Masala Dosa, Sambar, Coconut Chutney, Coffee"
                    required
                  />
                </div>

                <button type="submit" style={styles.saveBtn}>
                  Save Menu Slot
                </button>
              </form>
            )}

            {loading ? (
              <div style={styles.centerBox}><p style={{ color: '#64748b' }}>Loading menu...</p></div>
            ) : dayMeals.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ color: '#64748b' }}>No menu slots configured for {selectedDay}.</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {dayMeals.map((meal) => (
                  <div key={meal.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                        {meal.mealType}
                      </strong>
                      {meal.averageRating ? (
                        <span style={styles.ratingBadge}>
                          ⭐ {meal.averageRating} / 5 ({meal.feedbackCount} reviews)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No ratings yet</span>
                      )}
                    </div>

                    {editingId === meal.id ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <textarea
                          style={styles.textarea}
                          rows={3}
                          value={editItems}
                          onChange={(e) => setEditItems(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdate(meal.id)}
                            style={styles.smallSaveBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.smallCancelBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: '0.75rem 0 1.25rem', color: '#334155', lineHeight: 1.5 }}>
                        {meal.items}
                      </p>
                    )}

                    <div style={styles.cardActions}>
                      <button
                        onClick={() => {
                          setEditingId(meal.id);
                          setEditItems(meal.items);
                        }}
                        style={styles.editBtn}
                      >
                        ✏️ Edit Items
                      </button>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: STUDENT FEEDBACK ─────────────────────────────────────── */}
        {activeTab === 'feedback' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1rem' }}>
              Student Meal Reviews & Comments
            </h2>

            {feedbacks.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ color: '#64748b' }}>No student feedback received yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {feedbacks.map((fb) => (
                  <div key={fb.id} style={styles.feedbackCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div>
                        <strong>{fb.student?.name}</strong>{' '}
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          (Room {fb.student?.roomNumber}, {fb.student?.hostelBlock})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#f59e0b' }}>
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)} ({fb.rating}/5)
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem' }}>
                      <strong>Meal:</strong> {fb.messMenu?.dayOfWeek} {fb.messMenu?.mealType} &bull; <em>{fb.messMenu?.items}</em>
                    </div>

                    {fb.comment && (
                      <p style={{ margin: '0.3rem 0 0', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                        "{fb.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
  navLinkActive: { color: '#7c3aed', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' },
  tabBtn: { background: '#fff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' },
  tabBtnActive: { background: '#7c3aed', border: '1px solid #7c3aed', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  success: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  daySelector: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  dayBtn: { background: '#fff', border: '1px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' },
  dayBtnActive: { background: '#7c3aed', border: '1px solid #7c3aed', padding: '0.45rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  addBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  addCard: { background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  label: { display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 500 },
  select: { width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', boxSizing: 'border-box' },
  input: { width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' },
  saveBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' },
  centerBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  emptyBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  ratingBadge: { background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' },
  editBtn: { background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', color: '#334155' },
  deleteBtn: { background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', color: '#991b1b' },
  textarea: { width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'inherit' },
  smallSaveBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' },
  smallCancelBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' },
  feedbackCard: { background: '#fff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
};
