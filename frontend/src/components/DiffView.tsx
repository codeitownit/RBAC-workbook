// ─── components/DiffView.tsx ──────────────────────────────────────────────────
export function DiffView({ original, edited }: { original: string; edited?: string | null }) {
  if (!edited || edited === original)
    return <span className="text-gray-700">{original}</span>;
  return (
    <span>
      <span className="line-through text-red-400 mr-1">{original}</span>
      <span className="bg-green-100 text-green-800 rounded px-0.5">{edited}</span>
    </span>
  );
}