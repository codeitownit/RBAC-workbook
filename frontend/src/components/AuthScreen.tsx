import { useState } from "react";
import { auth } from "../api";
import type { User } from "../types";

interface Props {
  onLogin: (user: User) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [mode, setMode]       = useState<"login" | "signup">("login");
  const [name, setName]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]       = useState("STUDENT");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim() || !password.trim()) return setError("Name and password required.");
    setLoading(true);
    try {
      const user =
        mode === "login"
          ? await auth.login(name, password)
          : await auth.signup(name, password, role);
      onLogin(user as User);
    } catch (e: any) {
      setError(e?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📓</div>
          <h1 className="text-2xl font-bold text-slate-800">Workbook</h1>
          <p className="text-slate-400 text-sm mt-1">Collaborative learning platform</p>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                mode === m ? "bg-white shadow text-slate-800" : "text-slate-500"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {mode === "signup" && (
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="DIRECTOR">Director</option>
            </select>
          )}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}