import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
    api.get("/admin/users").then(({ data }) => setUsers(data.users));
    api.get("/admin/stores").then(({ data }) => setStores(data.stores));
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

      <Tabs defaultValue="stats">
        <TabsList className="flex gap-4 mb-6">
          <TabsTrigger value="stats" className="btn">Stats</TabsTrigger>
          <TabsTrigger value="users" className="btn">Users</TabsTrigger>
          <TabsTrigger value="stores" className="btn">Stores</TabsTrigger>
        </TabsList>

        {/* ✅ Stats */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-2">System Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Users", value: stats.totalUsers },
                      { name: "Stores", value: stats.totalStores },
                      { name: "Ratings", value: stats.totalRatings },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {["Users", "Stores", "Ratings"].map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-2">Data Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Users", value: stats.totalUsers },
                    { name: "Stores", value: stats.totalStores },
                    { name: "Ratings", value: stats.totalRatings },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ✅ Users */}
        <TabsContent value="users">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">👥 All Users</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ✅ Stores */}
        <TabsContent value="stores">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">🏪 All Stores</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{s.name}</td>
                    <td className="p-2 border">{s.email}</td>
                    <td className="p-2 border text-gray-500">{s.address}</td>
                    <td className="p-2 border">{s.rating?.toFixed(2) || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
