import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function BrowseProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { addToCart, items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">🌾 Soko la Mkulima</div>
        <div className="navbar-actions">
          <button onClick={() => navigate('/home')} className="btn btn-outline">🏠 Nyumbani</button>
          <button onClick={() => navigate('/buyer/orders')} className="btn btn-outline">Orders Zangu</button>
          <button onClick={() => navigate('/buyer/cart')} className="btn btn-primary">Kikapu ({items.length})</button>
          <button onClick={handleLogout} className="btn btn-outline">Toka</button>
        </div>
      </div>

      <div className="page">
        <h2>Karibu, {user?.full_name}</h2>
        <p className="text-muted">Chagua mazao mapya moja kwa moja kutoka kwa wakulima.</p>

        {loading ? (
          <p className="text-muted">Inapakia...</p>
        ) : products.length === 0 ? (
          <p className="text-muted">Hakuna bidhaa kwa sasa.</p>
        ) : (
          <div className="product-grid" style={{ marginTop: 20 }}>
            {products.map((p) => (
              <div key={p.id} className="card card-hover">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">Hakuna Picha</div>
                )}
                <h4 style={{ margin: '0 0 4px' }}>{p.name}</h4>
                <p className="text-muted" style={{ margin: '0 0 6px' }}>{p.description}</p>
                <div className="price-tag">{p.price} TZS <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-ink-soft)' }}>/ {p.unit}</span></div>
                <p className="text-muted" style={{ margin: '6px 0' }}>Kilichopo: {p.quantity_available} {p.unit}</p>
                <p className="text-muted" style={{ margin: '0 0 12px' }}>Muuzaji: {p.seller_name} ({p.seller_location})</p>
                <button
                  onClick={() => addToCart(p, 1)}
                  disabled={p.quantity_available < 1}
                  className="btn btn-primary btn-block"
                >
                  Ongeza Kikapuni
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}