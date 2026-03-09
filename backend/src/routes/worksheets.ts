// ─── routes/worksheets.ts ─────────────────────────────────────────────────────
import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

// All roles can list worksheets
router.get("/", authenticate, async (_, res) => {
  const worksheets = await prisma.worksheet.findMany({ orderBy: { createdAt: "asc" } });
  res.json(worksheets);
});

// Only director can create
router.post("/", authenticate, requireRole("DIRECTOR"), async (req: AuthRequest, res) => {
  const { title } = req.body;
  const ws = await prisma.worksheet.create({ data: { title, createdById: req.user!.id } });
  res.json(ws);
});

// Only director can delete
router.delete("/:id", authenticate, requireRole("DIRECTOR"), async (req, res) => {
  await prisma.worksheet.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
