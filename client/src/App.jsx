import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminStores from './pages/AdminStores.jsx';
import UserStores from './pages/UserStores.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import UpdatePassword from './pages/UpdatePassword.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

function Home() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="card">
      <h2>Welcome to Rate My Store</h2>
      {user ? (
        <p>Use the navigation to access your dashboard.</p>
      ) : (
        <p>New here? <Link to="/register">Create an account</Link> or <Link to="/login">login</Link>.</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/update-password" element={
            <ProtectedRoute allow={['ADMIN','USER','OWNER']}>
              <UpdatePassword />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute allow={['ADMIN']}>
              <AdminStores />
            </ProtectedRoute>
          } />

          <Route path="/stores" element={
            <ProtectedRoute allow={['USER']}>
              <UserStores />
            </ProtectedRoute>
          } />

          <Route path="/owner" element={
            <ProtectedRoute allow={['OWNER']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
