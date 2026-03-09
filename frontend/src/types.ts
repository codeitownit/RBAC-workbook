export type Role = "DIRECTOR" | "TEACHER" | "STUDENT";

export interface User {
  id: number;
  name: string;
  role: Role;
}

export interface Worksheet {
  id: number;
  title: string;
  createdById: number;
}

export interface Question {
  id: number;
  text: string;
  worksheetId: number;
  createdById: number;
}

export interface Grade {
  id: number;
  score: number;
  feedback?: string;
  approved: boolean;
  gradedById: number;
}

export interface Answer {
  id: number;
  text: string;
  teacherEdit?: string;
  questionId: number;
  studentId: number;
  student?: { id: number; name: string };
  grade?: Grade;
}