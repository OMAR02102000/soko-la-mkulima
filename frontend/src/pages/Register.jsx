import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'buyer', location: '',
  });
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
      const res = await api.post('/auth/register', formData);
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
        <h2 style={{ marginTop: 8 }}>Jisajili</h2>
        <p className="text-muted">Chagua kama wewe ni muuzaji au mnunuzi</p>
      </div>

      <div className="auth-card">
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="field-label">Jina Kamili</label>
          <input className="input" name="full_name" placeholder="Jina lako" onChange={handleChange} required />

          <label className="field-label">Email</label>
          <input className="input" name="email" type="email" placeholder="wewe@mfano.com" onChange={handleChange} required />

          <label className="field-label">Namba ya Simu</label>
          <input className="input" name="phone" placeholder="07XXXXXXXX" onChange={handleChange} required />

          <label className="field-label">Password</label>
          <input className="input" name="password" type="password" placeholder="••••••••" onChange={handleChange} required />

          <label className="field-label">Eneo (hiari)</label>
          <input className="input" name="location" placeholder="Mfano: Morogoro" onChange={handleChange} />

          <label className="field-label">Wewe ni nani?</label>
          <select className="input" name="role" onChange={handleChange} value={formData.role}>
            <option value="buyer">Mnunuzi (Buyer)</option>
            <option value="seller">Muuzaji (Seller)</option>
          </select>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inasajili...' : 'Jisajili'}
          </button>
        </form>
      </div>

      <p className="auth-footer">
        Una akaunti tayari? <Link to="/login">Ingia hapa</Link>
      </p>
    </div>
  );
} 
