// src/pages/AdminStores.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
    rating: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all shops
  const fetchStores = async () => {
    try {
      const res = await api.get("/admin/stores");
      setStores(res.data.stores || []);
    } catch (err) {
      setError("Failed to load stores");
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        ownerId: form.ownerId ? Number(form.ownerId) : null,
        rating: form.rating ? Number(form.rating) : 0,
      };

      await api.post("/admin/stores", payload);
      setSuccess("Shop added successfully!");
      setForm({ name: "", email: "", address: "", ownerId: "", rating: "" });
      fetchStores(); // refresh
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add shop");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Stores</h2>

      {/* Add Shop Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-4 mb-6 w-full max-w-lg"
      >
        <h3 className="text-xl font-semibold mb-3">Add New Shop</h3>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <input
          type="text"
          name="name"
          placeholder="Shop Name"
          value={form.name}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Shop Email"
          value={form.email}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Shop Address"
          value={form.address}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded"
          required
        />
        <input
          type="number"
          name="ownerId"
          placeholder="Owner ID (optional)"
          value={form.ownerId}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded"
        />
        <input
          type="number"
          step="0.1"
          name="rating"
          placeholder="Initial Rating (0-5)"
          value={form.rating}
          onChange={handleChange}
          className="border w-full p-2 mb-3 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Shop
        </button>
      </form>

      {/* Shops List */}
      <h3 className="text-xl font-semibold mb-3">All Shops</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Owner ID</th>
            <th className="border p-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.id}</td>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.email}</td>
              <td className="border p-2">{s.address}</td>
              <td className="border p-2">{s.ownerId || "-"}</td>
              <td className="border p-2">{s.rating || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
