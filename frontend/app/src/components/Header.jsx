import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🚗AutoBASE</h1>
        </div>

        <nav className="nav">
          {token ? (
            <>
              <a href="/cars" onClick={(e) => { e.preventDefault(); navigate('/cars'); }}>
                Available Cars
              </a>
              <a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                My Bookings
              </a>
              <div className="user-info">
                <span>Welcome, {user.firstName}!</span>
                {user.role === 'admin' && <span className="admin-badge">Admin</span>}
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
