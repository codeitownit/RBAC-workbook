
// ─── components/Badge.tsx ─────────────────────────────────────────────────────

export function Badge({ role }: { role: string }) {
  const c: Record<string, string> = {
    DIRECTOR: "bg-indigo-100 text-indigo-700",
    TEACHER:  "bg-emerald-100 text-emerald-700",
    STUDENT:  "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${c[role]}`}>
      {role.toLowerCase()}
    </span>
  );
}