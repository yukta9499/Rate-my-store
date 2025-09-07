import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../server.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { validateEmail, validatePassword, validateName, validateAddress } from "../utils/validation.js";

const router = express.Router();

// ✅ Only ADMIN access
router.use(authRequired, requireRole("ADMIN"));

// ✅ Dashboard stats
router.get("/stats", async (req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ totalUsers: users, totalStores: stores, totalRatings: ratings });
});

// ✅ Create user (Admin can add users)
router.post("/users", async (req, res) => {
  const { name, email, address, password, role } = req.body;
  if (!validateName(name)) return res.status(400).json({ error: "Name must be 15-20 characters" });
  if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email" });
  if (!validateAddress(address)) return res.status(400).json({ error: "Address max 400 chars" });
  if (!validatePassword(password)) return res.status(400).json({ error: "Password must be 8-16 chars, include uppercase & special char" });
  if (!["ADMIN", "USER", "OWNER"].includes(role)) return res.status(400).json({ error: "Invalid role" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, passwordHash, role },
    select: { id: true, name: true, email: true, address: true, role: true }
  });
  res.status(201).json({ user });
});

// ✅ List users
router.get("/users", async (req, res) => {
  const { q, role, sortBy = "name", order = "asc" } = req.query;
  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } }
            ]
          }
        : {},
      role ? { role } : {}
    ]
  };

  const orderBy = {};
  orderBy[sortBy] = order === "desc" ? "desc" : "asc";

  const users = await prisma.user.findMany({
    where,
    orderBy,
    select: { id: true, name: true, email: true, address: true, role: true }
  });

  res.json({ users });
});

// ✅ User details
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, address: true, role: true, stores: true }
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  let ownerRating = null;
  if (user.role === "OWNER") {
    const storeIds = user.stores.map(s => s.id);
    if (storeIds.length) {
      const agg = await prisma.rating.aggregate({
        _avg: { score: true },
        where: { storeId: { in: storeIds } }
      });
      ownerRating = agg._avg.score || 0;
    }
  }

  res.json({ user: { ...user, ownerAverageRating: ownerRating } });
});

// ✅ Create store
router.post("/stores", async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  if (typeof name !== "string" || name.length < 2) return res.status(400).json({ error: "Store name required" });
  if (!validateEmail(email)) return res.status(400).json({ error: "Invalid store email" });
  if (!validateAddress(address)) return res.status(400).json({ error: "Address max 400 chars" });

  if (ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "OWNER") return res.status(400).json({ error: "ownerId must be a valid OWNER user id" });
  }

  const store = await prisma.store.create({
    data: { name, email, address, ownerId: ownerId || null }
  });
  res.status(201).json({ store });
});

// ✅ List stores
router.get("/stores", async (req, res) => {
  const { q, sortBy = "name", order = "asc" } = req.query;
  const stores = await prisma.store.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } }
          ]
        }
      : {},
    orderBy: { [sortBy]: order === "desc" ? "desc" : "asc" },
    include: { ratings: true }
  });

  const data = stores.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    rating: s.ratings.length ? s.ratings.reduce((a, r) => a + r.score, 0) / s.ratings.length : 0
  }));

  res.json({ stores: data });
});

export default router;
