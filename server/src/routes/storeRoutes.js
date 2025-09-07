import express from "express";
import { prisma } from "../server.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// ✅ List stores (show overall avg + user’s own rating)
router.get("/", authRequired, async (req, res) => {
  try {
    const { q, sortBy = "name", order = "asc" } = req.query;

    const stores = await prisma.store.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } }
            ]
          }
        : {},
      orderBy: { [sortBy]: order === "desc" ? "desc" : "asc" },
      include: { ratings: true }
    });

    const myId = req.user.userId;
    const myRatings = await prisma.rating.findMany({ where: { userId: myId } });
    const myMap = Object.fromEntries(myRatings.map(r => [r.storeId, r.score]));

    const data = stores.map(s => {
      const avg = s.ratings.length
        ? s.ratings.reduce((a, r) => a + r.score, 0) / s.ratings.length
        : 0;

      return {
        id: s.id,
        name: s.name,
        address: s.address,
        overallRating: Number(avg.toFixed(2)),
        myRating: myMap[s.id] || null
      };
    });

    res.json({ stores: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Submit or update rating
router.post("/:id/rate", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const s = parseInt(score, 10);

    if (!(s >= 1 && s <= 5)) {
      return res.status(400).json({ error: "Score must be 1-5" });
    }

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    const existing = await prisma.rating.findUnique({
      where: { storeId_userId: { storeId: id, userId: req.user.userId } }
    });

    let rating;
    if (existing) {
      rating = await prisma.rating.update({
        where: { id: existing.id },
        data: { score: s }
      });
    } else {
      rating = await prisma.rating.create({
        data: { storeId: id, userId: req.user.userId, score: s }
      });
    }

    res.json({ rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
