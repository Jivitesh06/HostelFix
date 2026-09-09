import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', roomNumber: '', hostelBlock: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 0.5rem', color: '#2563eb', fontSize: '1.8rem', textAlign: 'center' }}>HostelFix</h1>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#1e293b' }}>Student Registration</h2>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[{ name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
            { name: 'roomNumber', label: 'Room Number', type: 'text', placeholder: 'e.g. A-101' },
            { name: 'hostelBlock', label: 'Hostel Block', type: 'text', placeholder: 'e.g. Block A' },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{f.label}</label>
              <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box' }} type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required />
            </div>
          ))}
          <button style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
