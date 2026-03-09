// ─── routes/grades.ts ─────────────────────────────────────────────────────────
import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

// Teacher: create or update grade
router.put("/answer/:answerId", authenticate, requireRole("TEACHER"), async (req: AuthRequest, res) => {
  const { score, feedback } = req.body;
  const answerId = Number(req.params.answerId);
  const grade = await prisma.grade.upsert({
    where: { answerId },
    update: { score, feedback, approved: false }, // reset approval on edit
    create: { score, feedback, answerId, gradedById: req.user!.id },
  });
  res.json(grade);
});

// Director: approve grade
router.patch("/:id/approve", authenticate, requireRole("DIRECTOR"), async (req, res) => {
  const grade = await prisma.grade.update({
    where: { id: Number(req.params.id) },
    data: { approved: true },
  });
  res.json(grade);
});

// Director: get all pending grades
router.get("/pending", authenticate, requireRole("DIRECTOR"), async (_, res) => {
  const grades = await prisma.grade.findMany({
    where: { approved: false },
    include: { answer: { include: { student: { select: { name: true } }, question: true } }, gradedBy: { select: { name: true } } },
  });
  res.json(grades);
});

export default router;