// server/index.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const PORT = process.env.PORT || 5000;

// in-memory data
let users = [
  { id: 1, name: "Admin", email: "admin@example.com", password: "Admin@1234", role: "ADMIN" },
];
let stores = [];

// auth middleware
const auth = (roles = []) => (req, res, next) => {
  const token = req.header("authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ====================== AUTH ROUTES ======================
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u) => u.email === email)) return res.status(400).json({ error: "Email exists" });

  const id = users.length + 1;
  const user = { id, name, email, password, role: "USER" };
  users.push(user);
  res.json({ message: "Registered", user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user });
});

// ====================== ADMIN ROUTES ======================
app.post("/api/admin/stores", auth(["ADMIN"]), (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const id = stores.length + 1;
  const store = { id, name, email, address, ownerId: ownerId || null, rating: 0, ratings: [] };
  stores.push(store);
  res.json({ message: "Shop added", store });
});

app.get("/api/admin/stores", auth(["ADMIN"]), (req, res) => {
  res.json({ stores });
});

// ====================== USER ROUTES ======================
app.get("/api/user/stores", auth(["USER"]), (req, res) => {
  res.json({ stores });
});

app.post("/api/user/stores/:id/rating", auth(["USER"]), (req, res) => {
  const { rating } = req.body;
  const storeId = Number(req.params.id);
  const store = stores.find((s) => s.id === storeId);

  if (!store) return res.status(404).json({ error: "Store not found" });
  if (rating < 0 || rating > 5) return res.status(400).json({ error: "Rating must be 0-5" });

  if (!store.ratings) store.ratings = [];
  const existing = store.ratings.find((r) => r.userId === req.user.id);
  if (existing) {
    existing.rating = rating;
  } else {
    store.ratings.push({ userId: req.user.id, rating });
  }

  const avg = store.ratings.reduce((s, r) => s + r.rating, 0) / store.ratings.length;
  store.rating = avg;

  res.json({ message: "Rating submitted", store });
});

// ====================== SERVER START ======================
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));



import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
