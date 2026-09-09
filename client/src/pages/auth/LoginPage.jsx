import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'WARDEN') navigate('/warden/dashboard');
      else navigate('/staff/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>HostelFix</h1>
        <p style={styles.subtitle}>Smart Hostel Complaint & Mess Management</p>
        <h2 style={styles.heading}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          New student? <Link to="/register">Register here</Link>
        </p>
        <div style={styles.demoBox}>
          <strong>Demo Accounts (password: Demo@1234)</strong><br />
          student@hostelfix.demo<br />
          warden@hostelfix.demo<br />
          staff@hostelfix.demo
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: '1rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 0.25rem', color: '#2563eb', fontSize: '1.8rem', textAlign: 'center' },
  subtitle: { margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' },
  heading: { margin: '0 0 1rem', fontSize: '1.2rem', color: '#1e293b' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 },
  input: { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  demoBox: { marginTop: '1.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', padding: '0.75rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.8 },
};
