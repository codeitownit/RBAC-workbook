import { useState } from "react";
import type { Answer, Grade, Question, User } from "../types";
import { answers as answersApi, grades as gradesApi } from "../api";
import { DiffView } from "./Diffview";

interface Props {
  question: Question;
  index: number;
  user: User;
  answers: Answer[];
  onAnswersChange: (questionId: number) => void;
}

export function QuestionCard({ question, index, user, answers, onAnswersChange }: Props) {
  const myAnswer = answers.find((a) => a.studentId === user.id);

  // Student state
  const [answerText, setAnswerText] = useState("");

  // Teacher state
  const [editingAnswers, setEditingAnswers] = useState<Record<number, string>>({});
  const [editingGrades, setEditingGrades]   = useState<Record<number, { score: string; feedback: string }>>({});

  // ── Student actions ──────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (!answerText.trim()) return;
    await answersApi.submit(question.id, answerText);
    setAnswerText("");
    onAnswersChange(question.id);
  };

  const updateAnswer = async (text: string) => {
    await answersApi.submit(question.id, text);
    onAnswersChange(question.id);
  };

  // ── Teacher actions ──────────────────────────────────────────────────────
  const saveEdit = async (answerId: number) => {
    const text = editingAnswers[answerId];
    if (text === undefined) return;
    await answersApi.edit(answerId, text);
    setEditingAnswers((e) => { const n = { ...e }; delete n[answerId]; return n; });
    onAnswersChange(question.id);
  };

  const submitGrade = async (answerId: number) => {
    const g = editingGrades[answerId];
    if (!g) return;
    await gradesApi.submit(answerId, Number(g.score), g.feedback);
    setEditingGrades((e) => { const n = { ...e }; delete n[answerId]; return n; });
    onAnswersChange(question.id);
  };

  // ── Director actions ─────────────────────────────────────────────────────
  const approveGrade = async (gradeId: number) => {
    await gradesApi.approve(gradeId);
    onAnswersChange(question.id);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Q{index + 1}</span>
        <p className="text-sm font-semibold text-slate-800">{question.text}</p>
      </div>

      <div className="p-5 space-y-4">
        {/* ── STUDENT ── */}
        {user.role === "STUDENT" && (
          <div>
            {myAnswer ? (
              <div className="space-y-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-slate-700">
                  <p className="text-xs text-amber-500 font-semibold mb-1">Your answer</p>
                  <DiffView original={myAnswer.text} edited={myAnswer.teacherEdit} />
                </div>
                {myAnswer.teacherEdit && myAnswer.teacherEdit !== myAnswer.text && (
                  <p className="text-xs text-slate-400 italic">✏️ Your teacher suggested a correction (shown above)</p>
                )}
                <GradeView grade={myAnswer.grade} />
                <EditAnswerRow
                  initial={myAnswer.text}
                  onSave={updateAnswer}
                  accentCls="amber"
                  label="Update"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <textarea
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                  rows={3}
                  placeholder="Write your answer here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
                <button
                  onClick={submitAnswer}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 rounded-lg self-stretch transition"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TEACHER ── */}
        {user.role === "TEACHER" && (
          <div className="space-y-4">
            {answers.length === 0 && <p className="text-xs text-slate-400 italic">No student answers yet.</p>}
            {answers.map((ans) => {
              const isEditing = editingAnswers[ans.id] !== undefined;
              const isGrading = editingGrades[ans.id] !== undefined;
              return (
                <div key={ans.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">👤 {ans.student?.name}</span>
                    {ans.grade && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ans.grade.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {ans.grade.approved ? "✅ Approved" : "⏳ Pending"} • {ans.grade.score}/100
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    {isEditing ? (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">Original: <span className="text-slate-600">{ans.text}</span></p>
                        <textarea
                          className="w-full border border-emerald-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-emerald-300 resize-none"
                          rows={3}
                          value={editingAnswers[ans.id]}
                          onChange={(e) => setEditingAnswers((ea) => ({ ...ea, [ans.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(ans.id)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded">Save Suggestion</button>
                          <button onClick={() => setEditingAnswers((ea) => { const n = { ...ea }; delete n[ans.id]; return n; })} className="text-xs text-slate-500">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <DiffView original={ans.text} edited={ans.teacherEdit} />
                        <button
                          onClick={() => setEditingAnswers((ea) => ({ ...ea, [ans.id]: ans.teacherEdit ?? ans.text }))}
                          className="mt-2 text-xs text-emerald-600 hover:underline block"
                        >
                          ✏️ {ans.teacherEdit ? "Edit suggestion" : "Suggest correction"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isGrading ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-semibold text-emerald-700">Grade this answer</p>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600">Score (0–100):</label>
                        <input
                          type="number" min={0} max={100}
                          className="w-16 border border-slate-200 rounded px-2 py-1 text-sm outline-none"
                          value={editingGrades[ans.id]?.score ?? ""}
                          onChange={(e) => setEditingGrades((g) => ({ ...g, [ans.id]: { ...g[ans.id], score: e.target.value } }))}
                        />
                      </div>
                      <textarea
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none resize-none"
                        rows={2} placeholder="Feedback (optional)"
                        value={editingGrades[ans.id]?.feedback ?? ""}
                        onChange={(e) => setEditingGrades((g) => ({ ...g, [ans.id]: { ...g[ans.id], feedback: e.target.value } }))}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => submitGrade(ans.id)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded">Submit Grade</button>
                        <button onClick={() => setEditingGrades((g) => { const n = { ...g }; delete n[ans.id]; return n; })} className="text-xs text-slate-500">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingGrades((g) => ({ ...g, [ans.id]: { score: String(ans.grade?.score ?? ""), feedback: ans.grade?.feedback ?? "" } }))}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      🎯 {ans.grade ? "Edit grade" : "Give grade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── DIRECTOR ── */}
        {user.role === "DIRECTOR" && (
          <div className="space-y-3">
            {answers.length === 0 && <p className="text-xs text-slate-400 italic">No answers yet.</p>}
            {answers.map((ans) => (
              <div key={ans.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">👤 {ans.student?.name}</span>
                </div>
                <div className="bg-slate-50 rounded p-2 text-sm text-slate-700 mb-3">
                  <DiffView original={ans.text} edited={ans.teacherEdit} />
                </div>
                {ans.grade ? (
                  <div className={`rounded-lg p-3 border ${ans.grade.approved ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-0.5">
                          Score: <span className="font-bold text-slate-800">{ans.grade.score}/100</span>
                        </p>
                        {ans.grade.feedback && <p className="text-xs text-slate-600">{ans.grade.feedback}</p>}
                      </div>
                      {ans.grade.approved ? (
                        <span className="text-xs text-green-600 font-semibold">✅ Approved</span>
                      ) : (
                        <button
                          onClick={() => approveGrade(ans.grade!.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
                        >
                          Approve Grade
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Not graded yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helper components ────────────────────────────────────────────────────
function GradeView({ grade }: { grade?: Grade }) {
  if (!grade) return <p className="text-xs text-slate-400 italic">Not graded yet.</p>;
  return (
    <div className={`rounded-lg p-3 text-sm border ${grade.approved ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
      <p className="text-xs font-semibold mb-1 text-slate-500">
        {grade.approved ? "✅ Grade (Approved)" : "⏳ Grade (Pending Approval)"}
      </p>
      <p className="font-bold text-slate-800">Score: {grade.score}/100</p>
      {grade.feedback && <p className="text-slate-600 mt-1">{grade.feedback}</p>}
    </div>
  );
}

function EditAnswerRow({ initial, onSave, accentCls, label }: { initial: string; onSave: (t: string) => void; accentCls: string; label: string }) {
  const [text, setText] = useState(initial);
  return (
    <div className="flex gap-2">
      <textarea
        className={`flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-${accentCls}-300 resize-none`}
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => onSave(text)}
        className={`bg-${accentCls}-500 hover:bg-${accentCls}-600 text-white text-sm px-4 rounded-lg self-stretch transition`}
      >
        {label}
      </button>
    </div>
  );
}