import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function OwnerDashboard() {
  const [store, setStore] = useState(null);
  const [avg, setAvg] = useState({ average: 0, count: 0 });
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    api.get('/owner/my-store/average').then(({data}) => { setStore(data.store); setAvg({ average: data.average, count: data.count }); });
    api.get('/owner/my-store/ratings').then(({data}) => { setStore(data.store); setRatings(data.ratings); });
  }, []);

  return (
    <div className="card">
      <h2>Owner Dashboard</h2>
      {!store ? <p className="muted">No store is linked to your account yet.</p> : (
        <>
          <p><strong>{store.name}</strong> — Average rating: {avg.average?.toFixed(2) || 0} ({avg.count} ratings)</p>
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Score</th><th>When</th></tr></thead>
            <tbody>
              {ratings.map(r => (
                <tr key={r.id}>
                  <td>{r.user.name}</td>
                  <td>{r.user.email}</td>
                  <td>{r.score}</td>
                  <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
