import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', quantity_available: '', unit: 'kg', category: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchMyProducts = async () => {
    try {
      const res = await api.get('/products/mine');
      setProducts(res.data);
    } catch (err) {
      setError('Imeshindikana kupata bidhaa zako');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('quantity_available', formData.quantity_available);
      data.append('unit', formData.unit);
      data.append('category', formData.category);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData({ name: '', description: '', price: '', quantity_available: '', unit: 'kg', category: '' });
      setImageFile(null);
      e.target.reset();
      fetchMyProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindikana kuongeza bidhaa');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Una uhakika unataka kufuta bidhaa hii?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMyProducts();
    } catch (err) {
      alert('Imeshindikana kufuta bidhaa');
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">🌾 Soko la Mkulima</div>
        <div className="navbar-actions">
          <button onClick={() => navigate('/home')} className="btn btn-outline">🏠 Nyumbani</button>
          <button onClick={() => navigate('/seller/orders')} className="btn btn-outline">Orders Zangu</button>
          <button onClick={handleLogout} className="btn btn-outline">Toka</button>
        </div>
      </div>

      <div className="page">
        <h2>Karibu, {user?.full_name}</h2>
        <p className="text-muted">Simamia bidhaa zako na uone orders zinazoingia.</p>

        <div className="card" style={{ marginTop: 20, marginBottom: 30 }}>
          <h3>Ongeza Bidhaa Mpya</h3>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleAddProduct}>
            <label className="field-label">Jina la Bidhaa</label>
            <input className="input" name="name" placeholder="Mfano: Nyanya" value={formData.name} onChange={handleChange} required />

            <label className="field-label">Maelezo</label>
            <input className="input" name="description" placeholder="Maelezo mafupi" value={formData.description} onChange={handleChange} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="field-label">Bei (TZS)</label>
                <input className="input" name="price" type="number" placeholder="0" value={formData.price} onChange={handleChange} required />
              </div>
              <div>
                <label className="field-label">Kiasi Kilichopo</label>
                <input className="input" name="quantity_available" type="number" placeholder="0" value={formData.quantity_available} onChange={handleChange} required />
              </div>
            </div>

            <label className="field-label">Kipimo</label>
            <select className="input" name="unit" value={formData.unit} onChange={handleChange}>
              <option value="kg">Kilo (kg)</option>
              <option value="debe">Debe</option>
              <option value="kifurushi">Kifurushi</option>
              <option value="chungu">Chungu</option>
            </select>

            <label className="field-label">Aina (mfano: Mboga, Matunda)</label>
            <input className="input" name="category" placeholder="Mboga" value={formData.category} onChange={handleChange} />

            <label className="field-label">Picha ya Bidhaa</label>
            <input className="input input-file" type="file" accept="image/*" onChange={handleFileChange} />

            <button type="submit" className="btn btn-primary btn-block" disabled={uploading}>
              {uploading ? 'Inapakia...' : 'Ongeza Bidhaa'}
            </button>
          </form>
        </div>

        <div className="flex-between">
          <h3>Bidhaa Zako ({products.length})</h3>
        </div>

        {loading ? (
          <p className="text-muted">Inapakia...</p>
        ) : products.length === 0 ? (
          <p className="text-muted">Bado hujaongeza bidhaa yoyote.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p.id} className="card card-hover">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">Hakuna Picha</div>
                )}
                <h4 style={{ margin: '0 0 4px' }}>{p.name}</h4>
                <div className="price-tag">{p.price} TZS <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-ink-soft)' }}>/ {p.unit}</span></div>
                <p className="text-muted" style={{ margin: '6px 0 10px' }}>Kiasi: {p.quantity_available}</p>
                <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-block">Futa Bidhaa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}