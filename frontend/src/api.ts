const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
    req("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, password, role }),
    }),

  login: (name: string, password: string) =>
    req("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    }),

  logout: () =>
    req("/auth/logout", { method: "POST" }),

  me: () =>
    req("/auth/me"),
};

// ── Worksheets ────────────────────────────────────────────────────────────────
export const worksheets = {
  list: () =>
    req("/worksheets"),

  create: (title: string) =>
    req("/worksheets", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  delete: (id: number) =>
    req(`/worksheets/${id}`, { method: "DELETE" }),
};

// ── Questions ─────────────────────────────────────────────────────────────────
export const questions = {
  list: (worksheetId: number) =>
    req(`/questions/worksheet/${worksheetId}`),

  create: (text: string, worksheetId: number) =>
    req("/questions", {
      method: "POST",
      body: JSON.stringify({ text, worksheetId }),
    }),

  delete: (id: number) =>
    req(`/questions/${id}`, { method: "DELETE" }),
};

// ── Answers ───────────────────────────────────────────────────────────────────
export const answers = {
  // Teacher / Director: all answers for a question
  forQuestion: (questionId: number) =>
    req(`/answers/question/${questionId}`),

  // Student: their own answers scoped to a worksheet
  mine: (worksheetId: number) =>
    req(`/answers/my/${worksheetId}`),

  // Student: submit or update an answer
  submit: (questionId: number, text: string) =>
    req(`/answers/question/${questionId}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    }),

  // Teacher: suggest a correction on an answer
  edit: (answerId: number, teacherEdit: string) =>
    req(`/answers/${answerId}/edit`, {
      method: "PATCH",
      body: JSON.stringify({ teacherEdit }),
    }),
};

// ── Grades ────────────────────────────────────────────────────────────────────
export const grades = {
  // Teacher: create or update a grade
  submit: (answerId: number, score: number, feedback: string) =>
    req(`/grades/answer/${answerId}`, {
      method: "PUT",
      body: JSON.stringify({ score, feedback }),
    }),

  // Director: approve a grade
  approve: (gradeId: number) =>
    req(`/grades/${gradeId}/approve`, { method: "PATCH" }),

  // Director: list all unapproved grades
  pending: () =>
    req("/grades/pending"),
};