// server/controllers/adminController.js
import pool from "../db.js";

export const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const result = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, ownerId || null]
    );
    res.json({ message: "Shop added", store: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStores = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stores");
    res.json({ stores: result.rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const usersRes = await pool.query("SELECT COUNT(*) FROM users");
    const storesRes = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsRes = await pool.query("SELECT id, name, email, role, rating FROM users");

    res.json({
      totalUsers: usersRes.rows[0].count,
      totalStores: storesRes.rows[0].count,
      userRatings: ratingsRes.rows,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
