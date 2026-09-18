import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../api/axiosInstance';

export default function Cart() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
      const res = await api.post('/orders', { items: orderItems, payment_method: paymentMethod });
      setMessage(`Order imefanikiwa! Jumla: ${res.data.order.total_amount} TZS. Status: ${res.data.order.status}`);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Imeshindikana kuweka order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">🌾 Soko la Mkulima</div>
        <div className="navbar-actions">
          <button onClick={() => navigate('/buyer/products')} className="btn btn-outline">← Bidhaa</button>
        </div>
      </div>

      <div className="page" style={{ maxWidth: 600 }}>
        <h2>Kikapu Chako</h2>

        {message && <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {items.length === 0 ? (
          <p className="text-muted">Kikapu ni tupu.</p>
        ) : (
          <div className="card">
            {items.map((i) => (
              <div key={i.product_id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span>{i.name} x {i.quantity}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 600 }}>{parseFloat(i.price) * i.quantity} TZS</span>
                  <button onClick={() => removeFromCart(i.product_id)} className="btn btn-danger">Ondoa</button>
                </div>
              </div>
            ))}

            <div className="flex-between" style={{ marginTop: 18 }}>
              <h3 style={{ margin: 0 }}>Jumla</h3>
              <div className="price-tag">{total} TZS</div>
            </div>

            <label className="field-label" style={{ marginTop: 18 }}>Njia ya Malipo</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="mobile_money">Mobile Money (M-Pesa/Tigo/Airtel)</option>
              <option value="card">Kadi (Visa/Mastercard)</option>
            </select>

            <button onClick={handleCheckout} disabled={loading} className="btn btn-primary btn-block">
              {loading ? 'Inatuma...' : 'Thibitisha Order'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
