import { useState } from 'react';
import api from '../api/axios';

export default function UpdatePassword() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [msg, setMsg] = useState('');
  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/update-password', { oldPassword, newPassword });
      setMsg('Password updated ✓');
      setOld(''); setNew('');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed');
    }
  }
  return (
    <div className="card">
      <h2>Update Password</h2>
      <form onSubmit={onSubmit} className="grid">
        <input placeholder="Old password" type="password" value={oldPassword} onChange={e=>setOld(e.target.value)} />
        <input placeholder="New password" type="password" value={newPassword} onChange={e=>setNew(e.target.value)} />
        <button className="btn">Update</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
