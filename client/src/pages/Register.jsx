import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();
  

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/register', { name, email, address, password });
      setMsg('Registered! You can now login.');
      setTimeout(() => nav('/login'), 800);
    } catch (e) {
      setMsg(e.response?.data?.error || 'Something went wrong');
    }
  }

  return (
    <div className="card">
      <h2>Create an account (Normal User)</h2>
      <p className="muted">Name: 15-20 chars | Password: 8-16 with Uppercase & Special</p>
      <form onSubmit={onSubmit} className="grid">
        <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn">Sign up</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
