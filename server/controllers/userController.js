// server/controllers/userController.js
import pool from "../db.js";

export const getStores = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stores");
    res.json({ stores: result.rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const rateStore = async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = Number(req.params.id);

    // store check
    const storeCheck = await pool.query("SELECT * FROM stores WHERE id=$1", [storeId]);
    if (storeCheck.rows.length === 0) return res.status(404).json({ error: "Store not found" });

    // check if already rated
    const existing = await pool.query(
      "SELECT * FROM store_ratings WHERE user_id=$1 AND store_id=$2",
      [req.user.id, storeId]
    );

    if (existing.rows.length > 0) {
      await pool.query("UPDATE store_ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3", [
        rating,
        req.user.id,
        storeId,
      ]);
    } else {
      await pool.query("INSERT INTO store_ratings (user_id, store_id, rating) VALUES ($1, $2, $3)", [
        req.user.id,
        storeId,
        rating,
      ]);
    }

    // calculate average
    const avgRes = await pool.query("SELECT AVG(rating) as avg FROM store_ratings WHERE store_id=$1", [storeId]);
    const avg = avgRes.rows[0].avg;

    await pool.query("UPDATE stores SET rating=$1 WHERE id=$2", [avg, storeId]);

    res.json({ message: "Rating updated", avg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
