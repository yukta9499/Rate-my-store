import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({ name:'', email:'', address:'', password:'', role:'USER' });
  const [msg, setMsg] = useState('');

  function load() {
    api.get('/admin/users', { params: { q, role, sortBy, order } }).then(({data}) => setUsers(data.users));
  }
  useEffect(load, [q, role, sortBy, order]);

  async function onCreate(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/admin/users', form);
      setForm({ name:'', email:'', address:'', password:'', role:'USER' });
      load();
      setMsg('User created ✓');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed');
    }
  }

  return (
    <div className="card">
      <h2>Users</h2>
      <div className="grid">
        <input placeholder="Search name/email/address" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="OWNER">OWNER</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="address">Address</option>
          <option value="role">Role</option>
        </select>
        <select value={order} onChange={e=>setOrder(e.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td className="muted">{u.address}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="muted" style={{marginTop:16}}>Add new user</h3>
      <form className="grid" onSubmit={onCreate}>
        <input placeholder="Full Name (20-60)" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <textarea placeholder="Address (max 400)" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        <input placeholder="Password (8-16, Uppercase & Special)" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="USER">USER</option>
          <option value="OWNER">OWNER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button className="btn">Create</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
