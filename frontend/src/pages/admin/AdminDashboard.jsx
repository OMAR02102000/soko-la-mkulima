import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchStats = () => api.get('/admin/stats').then((res) => setStats(res.data));
  const fetchUsers = () => api.get('/admin/users').then((res) => setUsers(res.data));
  const fetchProducts = () => api.get('/admin/products').then((res) => setProducts(res.data));
  const fetchOrders = () => api.get('/admin/orders').then((res) => setOrders(res.data));

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers(), fetchProducts(), fetchOrders()])
      .finally(() => setLoading(false));
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { is_active: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Imeshindikana kubadili status');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Inapakia...</p>;

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">🌾 Soko la Mkulima</div>
        <div className="navbar-actions">
          <button onClick={() => navigate('/home')} className="btn btn-outline">🏠 Nyumbani</button>
          <button onClick={handleLogout} className="btn btn-outline">Toka</button>
        </div>
      </div>

      <div className="page">
        <h2>Admin Dashboard - Karibu {user?.full_name}</h2>

        {stats && (
          <div className="stats-grid">
            <StatCard label="Wauzaji" value={stats.total_sellers} />
            <StatCard label="Wanunuzi" value={stats.total_buyers} />
            <StatCard label="Bidhaa" value={stats.total_products} />
            <StatCard label="Orders" value={stats.total_orders} />
            <StatCard label="Mapato (TZS)" value={stats.total_revenue} />
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`} onClick={() => setActiveTab('users')}>Watumiaji</button>
          <button className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`} onClick={() => setActiveTab('products')}>Bidhaa</button>
          <button className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        </div>

        {activeTab === 'users' && (
          <table className="table">
            <thead>
              <tr>
                <th>Jina</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Kitendo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                      {u.is_active ? 'Active' : 'Zimwa'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleUserStatus(u.id, u.is_active)} className="btn btn-ghost">
                        {u.is_active ? 'Zima' : 'Wezesha'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'products' && (
          <table className="table">
            <thead>
              <tr>
                <th>Picha</th>
                <th>Jina</th>
                <th>Muuzaji</th>
                <th>Bei</th>
                <th>Kiasi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <span className="text-muted">Hakuna</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.seller_name}</td>
                  <td>{p.price} TZS</td>
                  <td>{p.quantity_available} {p.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <table className="table">
            <thead>
              <tr>
                <th>Mnunuzi</th>
                <th>Simu</th>
                <th>Bidhaa</th>
                <th>Jumla</th>
                <th>Status</th>
                <th>Malipo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.buyer_name}</td>
                  <td>{o.buyer_phone}</td>
                  <td>
                    {o.items && o.items.map((item, idx) => (
                      <div key={idx} className="order-item-row" style={{ marginBottom: 4 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.product_name} className="order-item-thumb" style={{ width: 30, height: 30 }} />
                        ) : (
                          <div className="order-item-thumb-placeholder" style={{ width: 30, height: 30 }} />
                        )}
                        <span style={{ fontSize: 13 }}>{item.product_name} x{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td>{o.total_amount} TZS</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td>{o.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

