import { useEffect, useState, useCallback } from "react";
import { auth, worksheets as wsApi, questions as qApi, answers as answersApi } from "./api";
import type { User, Worksheet, Question, Answer } from "./types";
import { AuthScreen } from "./components/AuthScreen";
import { Sidebar } from "./components/SideBar";
import { Badge } from "./components/badge";
import { QuestionCard } from "./components/QuestionCard";

const ACCENT: Record<string, string> = {
  DIRECTOR: "bg-indigo-600",
  TEACHER:  "bg-emerald-600",
  STUDENT:  "bg-amber-500",
};

export default function App() {
  const [currentUser, setCurrentUser]   = useState<User | null>(null);
  const [worksheets, setWorksheets]     = useState<Worksheet[]>([]);
  const [activeSheet, setActiveSheet]   = useState<number | null>(null);
  const [questions, setQuestions]       = useState<Question[]>([]);
  const [answers, setAnswers]           = useState<Record<number, Answer[]>>({}); // questionId -> answers
  const [newQuestion, setNewQuestion]   = useState("");
  const [loading, setLoading]           = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    auth.me()
      .then((u) => setCurrentUser(u as User))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Load worksheets when logged in ───────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    wsApi.list().then((data) => setWorksheets(data as Worksheet[]));
  }, [currentUser]);

  // ── Load questions when worksheet changes ────────────────────────────────
  useEffect(() => {
    if (!activeSheet) return;
    setQuestions([]);
    setAnswers({});
    qApi.list(activeSheet).then((data) => setQuestions(data as Question[]));
  }, [activeSheet]);

  // ── Load answers for all questions ──────────────────────────────────────
  useEffect(() => {
    if (!questions.length || !currentUser) return;
    questions.forEach((q) => loadAnswers(q.id));
  }, [questions]);

  const loadAnswers = useCallback(async (questionId: number) => {
    if (!currentUser) return;
    try {
      let data: Answer[];
      if (currentUser.role === "STUDENT") {
        // students use the /my/:worksheetId endpoint; filter locally
        const all = await answersApi.mine(activeSheet!) as Answer[];
        data = all.filter((a) => a.questionId === questionId);
      } else {
        data = await answersApi.forQuestion(questionId) as Answer[];
      }
      setAnswers((prev) => ({ ...prev, [questionId]: data }));
    } catch {
      setAnswers((prev) => ({ ...prev, [questionId]: [] }));
    }
  }, [currentUser, activeSheet]);

  const addQuestion = async () => {
    if (!newQuestion.trim() || !activeSheet) return;
    const q = await qApi.create(newQuestion.trim(), activeSheet) as Question;
    setQuestions((prev) => [...prev, q]);
    setNewQuestion("");
  };

  const logout = async () => {
    await auth.logout();
    setCurrentUser(null);
    setWorksheets([]);
    setActiveSheet(null);
    setQuestions([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  const accentCls = ACCENT[currentUser.role];
  const activeWs  = worksheets.find((w) => w.id === activeSheet);
  const pendingCount = Object.values(answers)
    .flat()
    .filter((a) => a.grade && !a.grade.approved).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className={`${accentCls} text-white px-6 py-3 flex items-center justify-between shadow`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📓</span>
          <span className="font-bold text-lg">Workbook</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-90">{currentUser.name}</span>
          <Badge role={currentUser.role} />
          <button
            onClick={logout}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <Sidebar
          user={currentUser}
          worksheets={worksheets}
          activeSheet={activeSheet}
          pendingCount={pendingCount}
          onSelect={setActiveSheet}
          onCreated={(ws) => { setWorksheets((p) => [...p, ws]); setActiveSheet(ws.id); }}
          accentCls={accentCls}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {!activeWs ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-lg font-medium">Select a worksheet</p>
              <p className="text-sm">
                {currentUser.role === "DIRECTOR"
                  ? "Or create one from the sidebar"
                  : "Ask a director to create one"}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{activeWs.title}</h2>
                <Badge role={currentUser.role} />
              </div>

              {/* Teacher: add question */}
              {currentUser.role === "TEACHER" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Add a Question</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-emerald-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                      placeholder="Question text..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                    />
                    <button
                      onClick={addQuestion}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 rounded-lg transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {questions.length === 0 && (
                <p className="text-slate-400 italic text-sm">
                  No questions yet.{" "}
                  {currentUser.role === "TEACHER" ? "Add one above." : "A teacher hasn't added questions yet."}
                </p>
              )}

              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  user={currentUser}
                  answers={answers[q.id] ?? []}
                  onAnswersChange={loadAnswers}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}