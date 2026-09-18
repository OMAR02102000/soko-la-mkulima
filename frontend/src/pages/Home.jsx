import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setZoomed((prev) => !prev);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToMyArea = () => {
    if (user.role === 'seller') navigate('/seller/dashboard');
    else if (user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/buyer/products');
  };

  const roleLabel = {
    seller: 'Muuzaji',
    buyer: 'Mnunuzi',
    admin: 'Msimamizi',
  }[user?.role];

  const ctaLabel = {
    seller: 'Nenda Dashibodi Yangu',
    buyer: 'Anza Kununua Bidhaa',
    admin: 'Fungua Admin Dashboard',
  }[user?.role];

  return (
    <>
      <div className="navbar">
        <div className="navbar-brand">🌾 Soko la Mkulima</div>
        <div className="navbar-actions">
          <button onClick={handleLogout} className="btn btn-outline">Toka</button>
        </div>
      </div>

      <div style={{
        position: 'relative',
        minHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(22,54,39,0.72), rgba(22,54,39,0.82)), url(/market-hero.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: zoomed ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 9000ms ease-in-out',
          }}
        ></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', marginTop: 0, fontSize: 36 }}>
            Karibu, {user?.full_name}
          </h1>
          <p style={{ color: '#E9F0E7', maxWidth: 520, margin: '8px auto 28px' }}>
            Umeingia kama <strong style={{ color: 'var(--color-gold)' }}>{roleLabel}</strong>.
            Soko la Mkulima linakuunganisha na mazao mapya moja kwa moja kutoka shambani.
          </p>
          <button onClick={goToMyArea} className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </>
  );
}