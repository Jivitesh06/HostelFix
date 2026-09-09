import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical & Lighting' },
  { value: 'PLUMBING', label: 'Plumbing & Water Supply' },
  { value: 'CLEANING', label: 'Cleaning & Washroom Hygiene' },
  { value: 'FURNITURE', label: 'Furniture & Carpentry' },
  { value: 'INTERNET', label: 'Internet & WiFi' },
  { value: 'OTHER', label: 'Other Maintenance' },
];

export default function NewComplaintPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: 'ELECTRICAL',
    description: '',
    imageUrl: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.description.trim()) {
      setError('Please provide a detailed description of the complaint.');
      return;
    }

    if (form.description.trim().length < 5) {
      setError('Description must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      await complaintService.createComplaint({
        category: form.category,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || null,
      });

      navigate('/student/complaints', {
        state: { message: 'Complaint registered successfully! It is now pending review.' },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit complaint. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
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
          <Link to="/student/complaints" style={styles.navLinkActive}>My Complaints</Link>
          <Link to="/student/mess" style={styles.navLink}>Mess Menu</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={styles.content}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/student/complaints" style={styles.backLink}>
            ← Back to Complaints
          </Link>
          <h1 style={{ margin: '0.5rem 0 0.25rem', color: '#1e293b' }}>
            Raise New Complaint
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Resident: <strong>{user?.name}</strong> &bull; Room: <strong>{user?.roomNumber}</strong>, <strong>{user?.hostelBlock}</strong>
          </p>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Issue Category *</label>
              <select
                style={styles.select}
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} ({cat.value})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Detailed Description *
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                  (Explain the problem clearly with location details)
                </span>
              </label>
              <textarea
                style={styles.textarea}
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Ceiling fan in Room A-101 has stopped spinning completely since this morning."
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Evidence Image URL
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                  (Optional photo link)
                </span>
              </label>
              <input
                style={styles.input}
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="e.g. https://example.com/photo.jpg"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
              <button style={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/complaints')}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
  content: { padding: '2rem 1.5rem', maxWidth: '680px', margin: '0 auto' },
  backLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', color: '#334155', fontWeight: 500 },
  select: { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', background: '#fff', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  input: { width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' },
  submitBtn: { padding: '0.75rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', cursor: 'pointer' },
};
