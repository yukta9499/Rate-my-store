import express from 'express';
import { prisma } from '../server.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authRequired, requireRole('OWNER'));

// Helper to get the one store owned by current owner (single or first)
async function getMyStore(ownerId) {
  return prisma.store.findFirst({ where: { ownerId } });
}

// Ratings for my store
router.get('/my-store/ratings', async (req, res) => {
  const store = await getMyStore(req.user.userId);
  if (!store) return res.json({ ratings: [], store: null });
  const ratings = await prisma.rating.findMany({
    where: { storeId: store.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  const data = ratings.map(r => ({
    id: r.id, score: r.score,
    user: r.user, createdAt: r.createdAt
  }));
  res.json({ store: { id: store.id, name: store.name }, ratings: data });
});

// Average rating for my store
router.get('/my-store/average', async (req, res) => {
  const store = await getMyStore(req.user.userId);
  if (!store) return res.json({ average: 0, count: 0, store: null });
  const agg = await prisma.rating.aggregate({ _avg: { score: true }, _count: { score: true }, where: { storeId: store.id } });
  res.json({ store: { id: store.id, name: store.name }, average: agg._avg.score || 0, count: agg._count.score });
});

export default router;
