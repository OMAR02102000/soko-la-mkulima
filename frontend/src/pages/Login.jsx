import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.user, res.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Hitilafu imetokea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 32 }}>🌾</div>
        <h2 style={{ marginTop: 8 }}>Soko la Mkulima</h2>
        <p className="text-muted">Ingia kuendelea na akaunti yako</p>
      </div>

      <div className="auth-card">
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input className="input" name="email" type="email" placeholder="wewe@mfano.com" onChange={handleChange} required />

          <label className="field-label">Password</label>
          <input className="input" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inaingia...' : 'Ingia'}
          </button>
        </form>
      </div>

      <p className="auth-footer">
        Huna akaunti? <Link to="/register">Jisajili hapa</Link>
      </p>
    </div>
  );
}
