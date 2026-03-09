const BASE = "http://localhost:4000/api";

async function req<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw await res.json() as unknown;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  signup: (name: string, password: string, role: string) =>
    req("/auth/signup", { method: "POST", body: JSON.stringify({ name, password, role }) }),
  login: (name: string, password: string) =>
    req("/auth/login", { method: "POST", body: JSON.stringify({ name, password }) }),
  logout: () => req("/auth/logout", { method: "POST" }),
  me: () => req("/auth/me"),
};

// ── Worksheets ────────────────────────────────────────────────────────────────
export const worksheets = {
  list: () => req("/worksheets"),
  create: (title: string) =>
    req("/worksheets", { method: "POST", body: JSON.stringify({ title }) }),
  delete: (id: number) =>
    req(`/worksheets/${id}`, { method: "DELETE" }),
};

// ── Questions ─────────────────────────────────────────────────────────────────
export const questions = {
  list: (worksheetId: number) => req(`/questions/worksheet/${worksheetId}`),
  create: (text: string, worksheetId: number) =>
    req("/questions", { method: "POST", body: JSON.stringify({ text, worksheetId }) }),
  delete: (id: number) =>
    req(`/questions/${id}`, { method: "DELETE" }),
};

// ── Answers ───────────────────────────────────────────────────────────────────
export const answers = {
  // teacher/director
  forQuestion: (questionId: number) => req(`/answers/question/${questionId}`),
  // student: own answers scoped to a worksheet
  mine: (worksheetId: number) => req(`/answers/my/${worksheetId}`),
  // student: submit/update
  submit: (questionId: number, text: string) =>
    req(`/answers/question/${questionId}`, { method: "PUT", body: JSON.stringify({ text }) }),
  // teacher: suggest correction
  edit: (answerId: number, teacherEdit: string) =>
    req(`/answers/${answerId}/edit`, { method: "PATCH", body: JSON.stringify({ teacherEdit }) }),
};

// ── Grades ────────────────────────────────────────────────────────────────────
export const grades = {
  submit: (answerId: number, score: number, feedback: string) =>
    req(`/grades/answer/${answerId}`, { method: "PUT", body: JSON.stringify({ score, feedback }) }),
  approve: (gradeId: number) =>
    req(`/grades/${gradeId}/approve`, { method: "PATCH" }),
  pending: () => req("/grades/pending"),
};