import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function UserStores() {
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [stores, setStores] = useState([]);
  const [msg, setMsg] = useState('');

  function load() {
    api.get('/stores', { params: { q, sortBy, order } }).then(({data}) => setStores(data.stores));
  }
  useEffect(load, [q, sortBy, order]);

  async function submitRating(storeId, score) {
    setMsg('');
    try {
      await api.post(`/stores/${storeId}/rate`, { score });
      load();
      setMsg('Saved ✓');
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed');
    }
  }

  return (
    <div className="card">
      <h2>All Stores</h2>
      <div className="grid">
        <input placeholder="Search by name or address" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="address">Address</option>
        </select>
        <select value={order} onChange={e=>setOrder(e.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <table>
        <thead><tr><th>Store</th><th>Address</th><th>Overall Rating</th><th>Your Rating</th><th>Action</th></tr></thead>
        <tbody>
          {stores.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td className="muted">{s.address}</td>
              <td>{s.overallRating}</td>
              <td>{s.myRating ?? '—'}</td>
              <td>
                <select defaultValue={s.myRating || ''} onChange={e=>submitRating(s.id, e.target.value)}>
                  <option value="" disabled>Rate</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
