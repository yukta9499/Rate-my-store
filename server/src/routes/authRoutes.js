import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../server.js";
import { authRequired } from "../middleware/auth.js";
import { validateEmail, validatePassword, validateName, validateAddress } from "../utils/validation.js";

const router = express.Router();

// ✅ Register (Normal User)
router.post("/register", async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    if (!validateName(name)) return res.status(400).json({ error: "Name must be 20-60 characters" });
    if (!validateEmail(email)) return res.status(400).json({ error: "Invalid email" });
    if (!validateAddress(address)) return res.status(400).json({ error: "Address max 400 chars" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Password must be 8-16 chars, include uppercase & special char" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, address, passwordHash, role: "USER" },
      select: { id: true, name: true, email: true, address: true, role: true }
    });

    res.status(201).json({ message: "Registered", user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login (all roles)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role } });
});

// ✅ Update password (protected)
router.post("/update-password", authRequired, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!validatePassword(newPassword)) return res.status(400).json({ error: "New password does not meet policy" });

  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Old password incorrect" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ message: "Password updated" });
});

export default router;
