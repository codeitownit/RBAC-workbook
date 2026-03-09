import { useState } from "react";
import type { Worksheet, User } from "../types";
import { worksheets as wsApi } from "../api";

interface Props {
  user: User;
  worksheets: Worksheet[];
  activeSheet: number | null;
  pendingCount: number;
  onSelect: (id: number) => void;
  onCreated: (ws: Worksheet) => void;
  accentCls: string;
}

export function Sidebar({ user, worksheets, activeSheet, pendingCount, onSelect, onCreated, accentCls }: Props) {
  const [title, setTitle]     = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const ws = await wsApi.create(title.trim()) as Worksheet;
      onCreated(ws);
      setTitle("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      <div className="p-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Worksheets</p>
        {worksheets.length === 0 && (
          <p className="text-xs text-slate-400 italic">No worksheets yet</p>
        )}
        {worksheets.map((ws) => (
          <button
            key={ws.id}
            onClick={() => onSelect(ws.id)}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 transition truncate ${
              activeSheet === ws.id ? `${accentCls} text-white` : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            📄 {ws.title}
          </button>
        ))}
      </div>

      {user.role === "DIRECTOR" && (
        <div className="p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">New Worksheet</p>
          <input
            className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none mb-1 focus:ring-1 focus:ring-indigo-300"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <button
            onClick={create}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs py-1 rounded transition"
          >
            {loading ? "Creating..." : "+ Create"}
          </button>
        </div>
      )}

      {user.role === "DIRECTOR" && pendingCount > 0 && (
        <div className="p-3 mt-auto border-t border-slate-100">
          <p className="text-xs font-semibold text-amber-500">⏳ {pendingCount} grade(s) pending approval</p>
        </div>
      )}
    </aside>
  );
}