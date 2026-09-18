import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = () => {
    api.get('/orders/seller')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Imeshindikana kubadili status');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Inapakia...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '30px auto', fontFamily: 'sans-serif', padding: '0 15px' }}>
      <button onClick={() => navigate('/seller/dashboard')} style={{ marginBottom: 15, cursor: 'pointer' }}>
        ← Rudi kwenye Dashboard
      </button>
      <h2>Orders za Bidhaa Zangu</h2>

      {orders.length === 0 ? (
        <p>Bado hakuna order kwa bidhaa zako.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Order #{o.id}</strong>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Mnunuzi: {o.buyer_name} ({o.buyer_phone})
                </p>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Malipo: {o.payment_method}
                </p>
              </div>
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                style={{ padding: 8, height: 'fit-content' }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <hr />

            {o.items && o.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 6 }} />
                )}
                <div>
                  <div>{item.product_name}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Kiasi: {item.quantity} — {item.price_at_purchase} TZS/kila moja
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
} 
