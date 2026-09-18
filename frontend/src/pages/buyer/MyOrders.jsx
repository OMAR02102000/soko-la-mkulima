import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders/mine')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Inapakia...</p>;

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'sans-serif', padding: '0 15px' }}>
      <button onClick={() => navigate('/buyer/products')} style={{ marginBottom: 15, cursor: 'pointer' }}>
        ← Rudi kwenye Bidhaa
      </button>
      <h2>Orders Zangu</h2>

      {orders.length === 0 ? (
        <p>Bado hujaweka order yoyote.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15, marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Order #{o.id}</strong>
              <span>{o.status.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: 13, color: '#666' }}>Malipo: {o.payment_method} | Jumla: {o.total_amount} TZS</p>
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
                  <div style={{ fontSize: 13, color: '#666' }}>Kiasi: {item.quantity} — {item.price_at_purchase} TZS/kila moja</div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

