import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  function onLogout() { logout(); nav('/login'); }
  return (
    <header>
      <Link to="/">🏬 Rate My Store</Link>
      <div className="spacer" />
      {user ? (
        <>
          <span className="muted">Signed in as {user.name} ({user.role})</span>
          <Link to="/update-password">Update Password</Link>
          {user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
          {user.role === 'USER' && <Link to="/stores">Stores</Link>}
          {user.role === 'OWNER' && <Link to="/owner">Owner</Link>}
          <button className="btn danger" onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </header>
  );
}
