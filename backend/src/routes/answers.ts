// ─── routes/answers.ts ────────────────────────────────────────────────────────
import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

// Teacher/Director: get all answers for a question
router.get("/question/:questionId", authenticate, requireRole("TEACHER", "DIRECTOR"), async (req, res) => {
  const answers = await prisma.answer.findMany({
    where: { questionId: Number(req.params.questionId) },
    include: { student: { select: { id: true, name: true } }, grade: true },
  });
  res.json(answers);
});

// Student: get own answers for a worksheet's questions
router.get("/my/:worksheetId", authenticate, requireRole("STUDENT"), async (req: AuthRequest, res) => {
  const questions = await prisma.question.findMany({ where: { worksheetId: Number(req.params.worksheetId) } });
  const qIds = questions.map(q => q.id);
  const answers = await prisma.answer.findMany({
    where: { questionId: { in: qIds }, studentId: req.user!.id },
    include: { grade: true },
  });
  res.json(answers);
});

// Student: submit or update answer
router.put("/question/:questionId", authenticate, requireRole("STUDENT"), async (req: AuthRequest, res) => {
  const { text } = req.body;
  const questionId = Number(req.params.questionId);
  const studentId = req.user!.id;
  const answer = await prisma.answer.upsert({
    where: { questionId_studentId: { questionId, studentId } },
    update: { text },
    create: { text, questionId, studentId },
  });
  res.json(answer);
});

// Teacher: suggest correction (edit)
router.patch("/:id/edit", authenticate, requireRole("TEACHER"), async (req, res) => {
  const { teacherEdit } = req.body;
  const answer = await prisma.answer.update({
    where: { id: Number(req.params.id) },
    data: { teacherEdit },
  });
  res.json(answer);
});

export default router;
