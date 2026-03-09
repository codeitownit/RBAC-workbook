// ─── routes/questions.ts ──────────────────────────────────────────────────────
import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

// All roles can list questions for a worksheet
router.get("/worksheet/:worksheetId", authenticate, async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { worksheetId: Number(req.params.worksheetId) },
    orderBy: { createdAt: "asc" },
  });
  res.json(questions);
});

// Only teacher can create questions
router.post("/", authenticate, requireRole("TEACHER"), async (req: AuthRequest, res) => {
  const { text, worksheetId } = req.body;
  const q = await prisma.question.create({ data: { text, worksheetId, createdById: req.user!.id } });
  res.json(q);
});

// Only teacher can delete their own questions
router.delete("/:id", authenticate, requireRole("TEACHER"), async (req: AuthRequest, res) => {
  const q = await prisma.question.findUnique({ where: { id: Number(req.params.id) } });
  if (!q || q.createdById !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
  await prisma.question.delete({ where: { id: q.id } });
  res.json({ ok: true });
});

export default router;
