export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="panel px-4 py-5 sm:px-5 sm:py-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-pink-300/80 mb-3">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-tight tracking-tight wrap-break-word">
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-dark-400 mt-2 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}
